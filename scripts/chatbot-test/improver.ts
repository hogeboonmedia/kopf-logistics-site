/**
 * The Improver — Claude Sonnet wrapper that generates validated proposed
 * fixes for failing tests.
 *
 * For each failure, the Improver gets:
 *   - The failing test (input, expected, actual)
 *   - The failed assertion(s) with reason
 *   - The relevant slice of the bot's config (kopf-config.ts, kb.ts, or
 *     route.ts system prompt depending on the rule)
 *   - The client's voice rules (banned words, brand voice notes)
 *
 * It returns a proposed fix as `{ filePath, before, after, rationale }`.
 *
 * Validation:
 *   1. File must exist
 *   2. `before` text must appear in the file (verbatim)
 *   3. `after` must NOT introduce a banned word
 *   4. After applying, the file must still be syntactically valid TypeScript
 *      (light check via `tsc --noEmit` — done by the caller in --apply mode)
 *
 * Validation failures cause the fix to be rejected with a clear reason; the
 * test is marked "auto-fix unavailable, manual review needed."
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, existsSync } from "node:fs";
import type { TestResult, VoiceRules, Assertion } from "./framework";

const IMPROVER_MODEL = "claude-sonnet-4-5-20250929";

export interface ProposedFix {
  /** Project-relative file path. */
  filePath: string;
  /** Exact existing text to replace (must appear in the file verbatim). */
  before: string;
  /** Replacement text. */
  after: string;
  /** Why this fix is safe + correct. Shown in the report + commit message. */
  rationale: string;
}

export interface ImproveOptions {
  result: TestResult;
  voiceRules: VoiceRules;
  /** File paths the Improver may modify (defaults to chatbot config files). */
  allowedFiles?: string[];
}

const DEFAULT_ALLOWED_FILES = [
  "lib/chatbot/kopf-config.ts",
  "lib/chatbot/kb.ts",
  "app/api/chat/route.ts",
];

const SYSTEM_PROMPT = `You are an expert engineer fixing failing tests on a chatbot framework.

Your job: given ONE failing test + the relevant config slice, propose the SMALLEST possible code change that makes the test pass without breaking other tests.

CONSTRAINTS:
- Output strict JSON only — no prose, no markdown fences, just the JSON object below.
- The "before" field must be EXACT verbatim text from the file (whitespace, quotes, all preserved). The applier will do a string replace, so it must be unique.
- Stay in brand voice. Apply the voice rules supplied.
- Do NOT modify regex patterns — those are too easy to break. Modify responses, suggestions, flow questions, KB content, or system prompt rules instead.
- Do NOT add new intents or remove existing ones.
- Prefer the smallest change. Don't rewrite a whole response when trimming one bubble fixes it.
- Multi-bubble responses use <br><br> as the bubble separator. Keep bubbles under the maxBubbleChars limit.
- ALWAYS preserve the conversational close — every response ends with a question or CTA.

OUTPUT SCHEMA:
{
  "filePath": "lib/chatbot/kopf-config.ts",
  "before": "<exact text from the file>",
  "after": "<replacement text>",
  "rationale": "<one sentence explaining why this fix is correct + safe>"
}`;

export async function generateFix(
  opts: ImproveOptions,
): Promise<{ ok: true; fix: ProposedFix } | { ok: false; reason: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "ANTHROPIC_API_KEY not set — Improver unavailable" };
  }

  // Determine which file likely contains the issue based on the failed assertion source
  const allowedFiles = opts.allowedFiles ?? DEFAULT_ALLOWED_FILES;
  const failedAssertions = opts.result.assertions.filter(
    (a) => a.status === "fail" || a.status === "error",
  );
  if (failedAssertions.length === 0) {
    return { ok: false, reason: "No failed assertions to fix" };
  }

  // Read all candidate files so the Improver has the full context.
  //
  // Cap at 50K chars/file (was 12K). The original 12K limit was truncating
  // mid-file content that contained the failure — Improver then hallucinated
  // "before" text that didn't exist in the file. 50K covers a config of
  // ~1500 lines comfortably.
  const fileSlices: Record<string, string> = {};
  const PER_FILE_CAP = 50_000;
  for (const f of allowedFiles) {
    if (existsSync(f)) {
      const content = readFileSync(f, "utf8");
      fileSlices[f] =
        content.length > PER_FILE_CAP
          ? content.slice(0, PER_FILE_CAP) +
            "\n// ...[truncated to fit prompt — manual review needed for fixes targeting content past this point]"
          : content;
    }
  }

  const prompt = buildImproverPrompt(opts.result, failedAssertions, opts.voiceRules, fileSlices);

  const client = new Anthropic({ apiKey });
  let response;
  try {
    response = await client.messages.create({
      model: IMPROVER_MODEL,
      max_tokens: 2000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    return {
      ok: false,
      reason: `Improver API call failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n")
    .trim();

  // Extract JSON (handle the case where Claude adds stray prose despite instructions)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { ok: false, reason: `Improver did not return JSON: ${text.slice(0, 200)}` };
  }

  let parsed: ProposedFix;
  try {
    parsed = JSON.parse(jsonMatch[0]) as ProposedFix;
  } catch (err) {
    return {
      ok: false,
      reason: `Improver returned malformed JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Validation
  const validation = validateFix(parsed, allowedFiles, opts.voiceRules);
  if (!validation.ok) return validation;

  return { ok: true, fix: parsed };
}

function buildImproverPrompt(
  result: TestResult,
  failed: Assertion[],
  voiceRules: VoiceRules,
  fileSlices: Record<string, string>,
): string {
  return `FAILING TEST:
ID: ${result.id}
Description: ${result.description}
Visitor input: ${JSON.stringify(result.input)}
Expected: ${result.expected}
Actual: ${result.actual ? JSON.stringify(result.actual) : "(no actual reply captured)"}

FAILED ASSERTIONS:
${failed
  .map(
    (a) => `- ${a.name}: ${a.description}
  Reason: ${a.reason || "(no reason)"}
  Source: ${a.source || "(no source)"}`,
  )
  .join("\n")}

VOICE RULES:
- Banned words: ${voiceRules.bannedWords.slice(0, 10).join(", ")}${voiceRules.bannedWords.length > 10 ? ", ..." : ""}
- Max bubble chars: ${voiceRules.maxBubbleChars ?? 220}
- Max total chars: ${voiceRules.maxTotalChars ?? 600}
${
  voiceRules.forbiddenClaims && voiceRules.forbiddenClaims.length > 0
    ? `- Forbidden claims:\n${voiceRules.forbiddenClaims.map((c) => `    * ${c.rationale}`).join("\n")}`
    : ""
}

RELEVANT FILES:
${Object.entries(fileSlices)
  .map(([path, content]) => `--- ${path} ---\n${content}`)
  .join("\n\n")}

Now generate the smallest fix that makes this test pass without breaking others. Output ONLY the JSON object.`;
}

function validateFix(
  fix: ProposedFix,
  allowedFiles: string[],
  voiceRules: VoiceRules,
): { ok: true } | { ok: false; reason: string } {
  if (!fix.filePath || !fix.before || !fix.after || !fix.rationale) {
    return { ok: false, reason: "Improver fix missing required fields" };
  }
  if (!allowedFiles.includes(fix.filePath)) {
    return {
      ok: false,
      reason: `Improver tried to modify ${fix.filePath} (not in allow-list: ${allowedFiles.join(", ")})`,
    };
  }
  if (!existsSync(fix.filePath)) {
    return { ok: false, reason: `File ${fix.filePath} does not exist` };
  }
  const content = readFileSync(fix.filePath, "utf8");
  if (!content.includes(fix.before)) {
    return {
      ok: false,
      reason: `"before" text not found verbatim in ${fix.filePath}. Improver may have hallucinated or normalized whitespace.`,
    };
  }
  // Check the after text doesn't introduce banned words
  const afterLc = fix.after.toLowerCase();
  const introduced = voiceRules.bannedWords.filter((w) => afterLc.includes(w.toLowerCase()));
  if (introduced.length > 0) {
    return {
      ok: false,
      reason: `Improver fix introduces banned word(s): ${introduced.join(", ")}`,
    };
  }
  return { ok: true };
}

/**
 * Apply a fix to disk. Returns the previous file content for rollback.
 */
export function applyFix(fix: ProposedFix): { ok: true; previousContent: string } | { ok: false; reason: string } {
  const content = readFileSync(fix.filePath, "utf8");
  if (!content.includes(fix.before)) {
    return { ok: false, reason: `"before" text not found in ${fix.filePath}` };
  }
  const newContent = content.replace(fix.before, fix.after);
  if (newContent === content) {
    return { ok: false, reason: `Replacement made no change to ${fix.filePath}` };
  }
  // Write
  const { writeFileSync } = require("node:fs") as typeof import("node:fs");
  writeFileSync(fix.filePath, newContent);
  return { ok: true, previousContent: content };
}

/** Roll back a fix using the saved previous content. */
export function rollbackFix(fix: ProposedFix, previousContent: string): void {
  const { writeFileSync } = require("node:fs") as typeof import("node:fs");
  writeFileSync(fix.filePath, previousContent);
}
