# Chatbot Test Framework

A reusable test framework for the chatbot pattern used on this site (and any
sibling client we wire it up for). Three subsystems:

1. **Test runner** — runs ~30 scenarios across 5 categories
2. **The Improver** — generates proposed code fixes for failures
3. **Visual report** — color-coded HTML with diffs

## Quick start

```bash
# Make sure the dev server is running (or set TEST_BASE_URL=https://...)
npm run dev

# In another terminal:
npm run test:chatbot                 # baseline run, opens HTML report
npm run test:chatbot:improve         # baseline + auto-generate proposed fixes
npm run test:chatbot:iterate         # autonomous improvement loop (3 iterations)
npm run test:chatbot:e2e             # include lead-capture DB verification
npm run test:chatbot:dry             # offline only (skip live LLM tests)
```

## Test categories

| Category | What it checks | Where it runs |
|---|---|---|
| `pattern-routing` | "Visitor says X → expect intent Y" | Offline (deterministic) |
| `flow-walking` | Multi-turn flow walks every step + captures answers | Offline (deterministic) |
| `llm-fallback` | Off-script questions hit `/api/chat/`, reply is grounded | Live HTTP |
| `edge-case` | Frustration, gibberish, prompt injection, profanity | Mixed |
| `lead-capture` | E2E submission → DB row + email | Live HTTP + DB (opt-in via `--e2e`) |

## Universal evaluators

Every bot reply (regardless of category) goes through these checks:

- **bubble-length** — each `<br><br>`-separated chunk ≤ 220 visible chars
- **total-length** — total reply ≤ 600 visible chars
- **ends-with-question** — last bubble has a question or CTA
- **multi-bubble-cadence** — replies > 240 chars use multi-bubble pacing
- **no-markdown-leaks** — no raw `**bold**` or `[text](url)` after sanitizer
- **no-banned-words** — buzzword detection (per client config)
- **no-forbidden-claims** — pattern-based claims the bot must never make

## LLM-graded checks

Some quality dimensions can't be checked with regex. The framework uses
Claude Haiku at `temperature: 0` as a binary judge for those:

- "Did the reply ask a probing follow-up?"
- "Did the reply make up specific freight rates?"
- "Did the reply stay in role despite a prompt-injection attempt?"

Results are cached in `test-results/.llm-grader-cache.json` keyed by
`(rule + visitor + reply)` hash so re-running tests is essentially free.

## The Improver

For every failed test, the Improver:

1. Reads the failed assertion + reason
2. Reads the relevant config slice (kopf-config.ts, kb.ts, route.ts)
3. Calls Claude Sonnet with a structured prompt
4. Returns `{ filePath, before, after, rationale }`
5. Validates the fix:
   - File exists
   - `before` text appears verbatim in the file
   - `after` doesn't introduce a banned word
   - `after` (when applied) keeps TypeScript valid

Invalid fixes are rejected — that test gets marked "auto-fix unavailable,
manual review needed" instead of being silently skipped.

### Manual review (`--improve` flag)

```bash
npm run test:chatbot:improve
```

Generates fixes but doesn't apply them. Open the HTML report — each failed
test now has a "Proposed fix" panel showing the diff + rationale. Review,
then apply manually with your editor of choice.

### Autonomous loop (`--iterate=N` flag)

```bash
npm run test:chatbot:iterate          # default: 3 iterations
# or
tsx scripts/chatbot-test/run.ts --iterate=5
```

1. Creates a fresh branch (`auto/test-fixes-YYYY-MM-DD-PID`)
2. Runs all tests, generates fixes for failures
3. Applies all valid fixes, commits as one iteration
4. Re-runs tests
5. If pass rate increases: continue (back to step 2)
6. If pass rate decreases (regression): roll back the last batch + stop
7. If no progress between iterations: stop
8. Caps at N iterations (default 3, max 5)

Working branch stays around for review. Merge with:

```bash
git checkout main && git merge auto/test-fixes-...
```

Or discard:

```bash
git checkout main && git branch -D auto/test-fixes-...
```

**Production never auto-deploys**: branches don't trigger Vercel production
builds. Merging to `main` is still required and stays human-gated.

## Adding test scenarios

Open `cases-<client>.ts` and add to the appropriate array:

```ts
const patternRouting: TestScenario[] = [
  // ...existing
  {
    kind: "pattern-routing",
    id: "PR-mynew-01",
    description: "What this test exercises",
    visitor: "How does the visitor phrase this?",
    expect: "flow:agents",  // or intent:X or no-match
  },
];
```

Each `kind` has its own shape — see `framework.ts` for the full type.

## Adding a new client

See `CLIENT_TEMPLATE.md` for a 5-minute walkthrough.

## Output files

After every run, the framework writes:

- `test-results/report.html` — visual report (auto-opens unless `--no-open`)
- `test-results/results.json` — structured results + proposed fixes (for CI)
- `test-results/.llm-grader-cache.json` — per-rubric cache (gitignored)

Add `test-results/` to your `.gitignore`. The HTML report is large and
regenerated every run.

## Troubleshooting

**`HTTP 429: rate limited`** — the per-IP rate limit on `/api/chat/` triggered.
Wait an hour or run from a different IP. The framework caches LLM-grader calls
so re-runs only re-hit the chat endpoint, not the grader.

**`ANTHROPIC_API_KEY not set`** — the LLM grader and Improver need an
Anthropic key. Add to `.env.local` (or pull from Vercel: `vercel env pull`).

**`No client config found for "X"`** — make sure `cases-X.ts` exists in this
directory and exports a `config` constant.

**Improver returns "auto-fix unavailable"** — usually means the failure is
in something the Improver isn't allowed to touch (regex patterns) or the
required text isn't a clean string match. Surface in the HTML report so
you can fix it manually.
