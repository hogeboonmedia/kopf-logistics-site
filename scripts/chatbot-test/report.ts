/**
 * HTML report generator + console summary.
 *
 * Writes test-results/report.html with:
 *   - Color-coded category bars
 *   - Per-test expandable rows
 *   - Bot transcripts (multi-bubble where applicable)
 *   - Failed-assertion details with the regex/rule that failed
 *   - For failures with a proposed fix: syntax-highlighted unified diff
 *
 * Self-contained HTML — no external CDN, no runtime JS dependencies. Just
 * inline CSS + minimal vanilla JS for the expand/collapse interactions.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { TestRun, TestResult, Assertion } from "./framework";
import type { ProposedFix } from "./improver";

export interface ReportOptions {
  outPath?: string;
  /** Proposed fixes from the Improver, keyed by test id. */
  fixes?: Record<string, ProposedFix>;
}

export function writeHtmlReport(
  run: TestRun,
  options: ReportOptions = {},
): string {
  const outPath = options.outPath ?? "test-results/report.html";
  const fixes = options.fixes ?? {};

  mkdirSync(dirname(outPath), { recursive: true });
  const html = renderHtml(run, fixes);
  writeFileSync(outPath, html);
  return outPath;
}

function renderHtml(run: TestRun, fixes: Record<string, ProposedFix>): string {
  const categories: Array<{ id: string; label: string }> = [
    { id: "pattern-routing", label: "Pattern routing" },
    { id: "flow-walking", label: "Flow walking" },
    { id: "llm-fallback", label: "LLM fallback" },
    { id: "edge-case", label: "Edge cases" },
    { id: "lead-capture", label: "Lead capture" },
  ];

  const totals = {
    pass: run.results.filter((r) => r.status === "pass").length,
    fail: run.results.filter((r) => r.status === "fail").length,
    error: run.results.filter((r) => r.status === "error").length,
    skip: run.results.filter((r) => r.status === "skip").length,
    total: run.results.length,
  };
  const passRate =
    totals.total === 0
      ? 0
      : Math.round(((totals.pass) / (totals.total - totals.skip)) * 1000) / 10;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Chatbot Test Report — ${escapeHtml(run.clientId)}</title>
<style>
  :root {
    --bg: #0F0B08;
    --bg-elev: #17110C;
    --card: #1F1810;
    --text: #F5EFE6;
    --text-muted: #8A8075;
    --hairline: rgba(245, 239, 230, 0.08);
    --pass: #43A047;
    --fail: #EA580C;
    --error: #C2410C;
    --skip: #6B6258;
    --accent: #015EAD;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    padding: 24px;
  }
  h1 { font-size: 20px; margin: 0 0 4px; letter-spacing: 0.02em; }
  h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--text-muted); }
  .meta { color: var(--text-muted); font-size: 12px; margin-bottom: 24px; }
  .meta strong { color: var(--text); }
  .summary {
    background: var(--bg-elev);
    border: 1px solid var(--hairline);
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 24px;
  }
  .summary-row {
    display: grid;
    grid-template-columns: 180px 1fr 60px;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .summary-row:last-child { margin-bottom: 0; }
  .bar {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    height: 14px;
    overflow: hidden;
    display: flex;
  }
  .bar-pass { background: var(--pass); }
  .bar-fail { background: var(--fail); }
  .bar-error { background: var(--error); }
  .bar-skip { background: var(--skip); }
  .summary-row .count { text-align: right; font-variant-numeric: tabular-nums; color: var(--text-muted); }
  .total { padding-top: 12px; margin-top: 12px; border-top: 1px solid var(--hairline); font-weight: 600; font-size: 15px; }
  .pass-rate { color: var(--pass); }
  .pass-rate.bad { color: var(--fail); }

  .test {
    background: var(--card);
    border: 1px solid var(--hairline);
    border-left: 3px solid var(--skip);
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
  }
  .test.pass { border-left-color: var(--pass); }
  .test.fail { border-left-color: var(--fail); }
  .test.error { border-left-color: var(--error); }
  .test.skip { opacity: 0.6; }

  .test-header {
    display: grid;
    grid-template-columns: 60px 110px 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    user-select: none;
  }
  .test-header:hover { background: rgba(255, 255, 255, 0.02); }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: center;
  }
  .badge.pass { background: var(--pass); color: white; }
  .badge.fail { background: var(--fail); color: white; }
  .badge.error { background: var(--error); color: white; }
  .badge.skip { background: var(--skip); color: white; }
  .test-id { font-family: ui-monospace, monospace; font-size: 11px; color: var(--text-muted); }
  .test-desc { color: var(--text); }
  .test-input { color: var(--text-muted); font-size: 12px; }
  .test-time { color: var(--text-muted); font-size: 11px; font-variant-numeric: tabular-nums; }

  .test-body { display: none; padding: 14px; border-top: 1px solid var(--hairline); }
  .test.expanded .test-body { display: block; }

  .field { margin-bottom: 12px; }
  .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-muted); margin-bottom: 4px; }
  .field-value {
    background: var(--bg);
    border: 1px solid var(--hairline);
    border-radius: 3px;
    padding: 10px 12px;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .transcript { display: flex; flex-direction: column; gap: 8px; }
  .turn { display: flex; gap: 10px; }
  .turn-role {
    width: 60px;
    flex-shrink: 0;
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .turn-content {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--hairline);
    border-radius: 3px;
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.5;
  }
  .turn.bot .turn-content { background: var(--card); }

  .assertions { margin-top: 12px; }
  .assertion {
    display: grid;
    grid-template-columns: 60px 1fr;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid var(--hairline);
    font-size: 12px;
  }
  .assertion:last-child { border-bottom: none; }
  .assertion-status {
    font-family: ui-monospace, monospace;
    font-size: 10px;
    text-align: center;
  }
  .assertion-status.pass { color: var(--pass); }
  .assertion-status.fail { color: var(--fail); }
  .assertion-status.error { color: var(--error); }
  .assertion-status.skip { color: var(--skip); }
  .assertion-name { font-family: ui-monospace, monospace; font-size: 11px; color: var(--text); }
  .assertion-desc { color: var(--text-muted); font-size: 12px; }
  .assertion-reason { margin-top: 4px; color: var(--fail); font-size: 12px; }
  .assertion-source { margin-top: 2px; color: var(--text-muted); font-size: 10px; font-family: ui-monospace, monospace; }

  .fix {
    margin-top: 16px;
    background: var(--bg-elev);
    border: 1px solid var(--accent);
    border-radius: 4px;
    overflow: hidden;
  }
  .fix-header {
    padding: 10px 14px;
    background: rgba(1, 94, 173, 0.15);
    color: var(--text);
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    border-bottom: 1px solid var(--hairline);
  }
  .fix-meta { padding: 10px 14px; font-size: 11px; color: var(--text-muted); border-bottom: 1px solid var(--hairline); }
  .fix-meta strong { color: var(--text); font-family: ui-monospace, monospace; }
  .diff {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    padding: 12px 14px;
    white-space: pre;
    overflow-x: auto;
  }
  .diff-line { display: block; }
  .diff-line.add { background: rgba(67, 160, 71, 0.12); color: #B5E5B8; }
  .diff-line.del { background: rgba(234, 88, 12, 0.12); color: #FCC09B; }
  .diff-line.context { color: var(--text-muted); }
  .fix-rationale { padding: 10px 14px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--hairline); font-style: italic; }
  .filters { margin-bottom: 12px; }
  .filter-btn {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--hairline);
    border-radius: 3px;
    padding: 4px 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    cursor: pointer;
    margin-right: 6px;
  }
  .filter-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .notes { color: var(--text-muted); font-size: 12px; padding: 6px 14px; font-style: italic; }
</style>
</head>
<body>
  <h1>Chatbot Test Report — ${escapeHtml(run.clientId)}</h1>
  <div class="meta">
    Started: <strong>${escapeHtml(run.startedAt)}</strong> ·
    Duration: <strong>${(run.durationMs / 1000).toFixed(1)}s</strong> ·
    API URL: <strong>${escapeHtml(run.apiUrl)}</strong> ·
    E2E mode: <strong>${run.e2e ? "ON" : "off"}</strong>
  </div>

  <div class="summary">
    ${categories.map((c) => renderCategorySummary(c.id, c.label, run.results)).join("")}
    <div class="summary-row total">
      <div>Overall</div>
      <div></div>
      <div class="count ${passRate < 90 ? "pass-rate bad" : "pass-rate"}">
        ${totals.pass}/${totals.total - totals.skip} (${passRate}%)
      </div>
    </div>
  </div>

  <h2>All tests</h2>
  <div class="filters">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="fail">Failures</button>
    <button class="filter-btn" data-filter="pass">Passing</button>
    <button class="filter-btn" data-filter="skip">Skipped</button>
  </div>

  <div id="tests">
    ${run.results.map((r) => renderTest(r, fixes[r.id])).join("\n")}
  </div>

  <script>
    document.querySelectorAll('.test-header').forEach((h) => {
      h.addEventListener('click', () => h.closest('.test').classList.toggle('expanded'));
    });
    document.querySelectorAll('.filter-btn').forEach((b) => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        const f = b.getAttribute('data-filter');
        document.querySelectorAll('.test').forEach((t) => {
          if (f === 'all') t.style.display = '';
          else t.style.display = t.classList.contains(f) ? '' : 'none';
        });
      });
    });
    // Auto-expand all failures so they're visible at first paint
    document.querySelectorAll('.test.fail, .test.error').forEach((t) => t.classList.add('expanded'));
  </script>
</body>
</html>`;
}

function renderCategorySummary(
  categoryId: string,
  label: string,
  results: TestResult[],
): string {
  const inCat = results.filter((r) => r.category === categoryId);
  if (inCat.length === 0) {
    return `<div class="summary-row"><div>${escapeHtml(label)}</div><div class="bar"></div><div class="count">—</div></div>`;
  }
  const pass = inCat.filter((r) => r.status === "pass").length;
  const fail = inCat.filter((r) => r.status === "fail").length;
  const error = inCat.filter((r) => r.status === "error").length;
  const skip = inCat.filter((r) => r.status === "skip").length;
  const total = inCat.length;
  const widths = {
    pass: (pass / total) * 100,
    fail: (fail / total) * 100,
    error: (error / total) * 100,
    skip: (skip / total) * 100,
  };
  return `<div class="summary-row">
    <div>${escapeHtml(label)}</div>
    <div class="bar">
      <div class="bar-pass" style="width:${widths.pass}%"></div>
      <div class="bar-fail" style="width:${widths.fail}%"></div>
      <div class="bar-error" style="width:${widths.error}%"></div>
      <div class="bar-skip" style="width:${widths.skip}%"></div>
    </div>
    <div class="count">${pass}/${total - skip} ${fail || error ? "✗" : "✓"}</div>
  </div>`;
}

function renderTest(r: TestResult, fix: ProposedFix | undefined): string {
  const statusClass = r.status;
  return `<div class="test ${statusClass}">
    <div class="test-header">
      <span class="badge ${statusClass}">${escapeHtml(r.status)}</span>
      <span class="test-id">${escapeHtml(r.id)}</span>
      <div>
        <div class="test-desc">${escapeHtml(r.description)}</div>
        <div class="test-input">${escapeHtml(truncate(r.input, 110))}</div>
      </div>
      <span class="test-time">${r.durationMs ? `${r.durationMs}ms` : ""}</span>
    </div>
    <div class="test-body">
      ${r.notes ? `<div class="notes">${escapeHtml(r.notes)}</div>` : ""}
      <div class="field">
        <div class="field-label">Expected</div>
        <div class="field-value">${escapeHtml(r.expected)}</div>
      </div>
      ${
        r.transcript
          ? `<div class="field"><div class="field-label">Transcript</div>${renderTranscript(r.transcript)}</div>`
          : r.actual
            ? `<div class="field"><div class="field-label">Actual</div><div class="field-value">${escapeHtml(r.actual)}</div></div>`
            : ""
      }
      ${renderAssertions(r.assertions)}
      ${fix ? renderFix(fix) : ""}
    </div>
  </div>`;
}

function renderTranscript(turns: Array<{ role: string; content: string }>): string {
  return `<div class="transcript">${turns
    .map(
      (t) =>
        `<div class="turn ${t.role === "bot" ? "bot" : "visitor"}"><span class="turn-role">${escapeHtml(t.role)}</span><div class="turn-content">${escapeHtml(t.content)}</div></div>`,
    )
    .join("")}</div>`;
}

function renderAssertions(assertions: Assertion[]): string {
  if (assertions.length === 0) return "";
  return `<div class="assertions">
    <div class="field-label">Assertions (${assertions.length})</div>
    ${assertions
      .map(
        (a) => `<div class="assertion">
          <div class="assertion-status ${a.status}">${a.status === "pass" ? "✓" : a.status === "fail" ? "✗" : a.status === "error" ? "!" : "—"}</div>
          <div>
            <div><span class="assertion-name">${escapeHtml(a.name)}</span></div>
            <div class="assertion-desc">${escapeHtml(a.description)}</div>
            ${a.reason ? `<div class="assertion-reason">${escapeHtml(a.reason)}</div>` : ""}
            ${a.source ? `<div class="assertion-source">${escapeHtml(a.source)}</div>` : ""}
          </div>
        </div>`,
      )
      .join("")}
  </div>`;
}

function renderFix(fix: ProposedFix): string {
  const diffHtml = renderDiff(fix.before, fix.after);
  return `<div class="fix">
    <div class="fix-header">Proposed fix (auto-generated)</div>
    <div class="fix-meta">File: <strong>${escapeHtml(fix.filePath)}</strong></div>
    <div class="diff">${diffHtml}</div>
    <div class="fix-rationale">${escapeHtml(fix.rationale)}</div>
  </div>`;
}

function renderDiff(before: string, after: string): string {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const lines: string[] = [];
  for (const b of beforeLines) {
    lines.push(`<span class="diff-line del">- ${escapeHtml(b)}</span>`);
  }
  for (const a of afterLines) {
    lines.push(`<span class="diff-line add">+ ${escapeHtml(a)}</span>`);
  }
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

// ────────────────────────────────────────────────────────────────────────────
// Console summary — printed after every run regardless of HTML report
// ────────────────────────────────────────────────────────────────────────────

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m",
};

export function printConsoleSummary(run: TestRun, htmlPath: string): void {
  const totals = {
    pass: run.results.filter((r) => r.status === "pass").length,
    fail: run.results.filter((r) => r.status === "fail").length,
    error: run.results.filter((r) => r.status === "error").length,
    skip: run.results.filter((r) => r.status === "skip").length,
    total: run.results.length,
  };

  console.log(
    `\n${ANSI.bold}Chatbot Test Report — ${run.clientId}${ANSI.reset}`,
  );
  console.log(`${ANSI.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ANSI.reset}`);

  const categories = [
    "pattern-routing",
    "flow-walking",
    "llm-fallback",
    "edge-case",
    "lead-capture",
  ];
  for (const cat of categories) {
    const inCat = run.results.filter((r) => r.category === cat);
    if (inCat.length === 0) continue;
    const p = inCat.filter((r) => r.status === "pass").length;
    const f = inCat.filter((r) => r.status === "fail").length;
    const e = inCat.filter((r) => r.status === "error").length;
    const s = inCat.filter((r) => r.status === "skip").length;
    const denom = inCat.length - s;
    const ok = f === 0 && e === 0;
    console.log(
      `${cat.padEnd(20)} ${p}/${denom} ${ok ? ANSI.green + "✓" : ANSI.red + "✗"}${s ? ` ${ANSI.gray}(${s} skipped)` : ""}${ANSI.reset}`,
    );
  }

  console.log(`${ANSI.gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ANSI.reset}`);
  const passRate =
    totals.total === 0
      ? 0
      : Math.round((totals.pass / Math.max(1, totals.total - totals.skip)) * 1000) / 10;
  const passColor = passRate >= 95 ? ANSI.green : passRate >= 80 ? ANSI.yellow : ANSI.red;
  console.log(
    `${ANSI.bold}Overall: ${passColor}${totals.pass}/${totals.total - totals.skip}${ANSI.reset}${ANSI.bold} (${passRate}%)${ANSI.reset}  Run: ${(run.durationMs / 1000).toFixed(1)}s`,
  );

  if (totals.fail > 0 || totals.error > 0) {
    console.log(`\n${ANSI.bold}Failures:${ANSI.reset}`);
    for (const r of run.results) {
      if (r.status !== "fail" && r.status !== "error") continue;
      console.log(`  ${ANSI.red}${r.id}${ANSI.reset} ${r.description}`);
      const failed = r.assertions.filter((a) => a.status === "fail" || a.status === "error");
      for (const a of failed) {
        const reason = a.reason ? `: ${truncate(a.reason, 110)}` : "";
        console.log(`    ${ANSI.gray}└─${ANSI.reset} ${a.name}${reason}`);
      }
    }
  }

  console.log(`\n${ANSI.cyan}Visual report:${ANSI.reset} ${htmlPath}`);
}
