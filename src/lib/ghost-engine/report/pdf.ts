import { mkdir, readFile } from "node:fs/promises";
import { dirname, extname } from "node:path";

import { chromium } from "playwright";

import { REPORT_BRAND, REPORT_LOGO_PATH } from "../config";
import type { GhostScore } from "../scoring";
import type { AuditResult } from "../pipeline";

/**
 * Branded PDF one-pager of the Growth Leak Report. Rendered from an inline HTML
 * template via Playwright's `page.pdf()` — no new dependency, and the logo is
 * fetched and embedded as a data URI so the PDF is fully self-contained.
 */

const BAND_COLOR: Record<GhostScore["band"], string> = {
  Critical: "#e5484d",
  Weak: "#f97316",
  NeedsImprovement: "#f5a623",
  Good: "#a78bfa",
  Strong: "#38bdf8",
  Excellent: "#30a46c",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

/** Read a local logo file and embed it as a data URI (self-contained PDF). */
async function loadLogoDataUri(path: string): Promise<string | null> {
  try {
    const buf = await readFile(path);
    const mime = MIME_BY_EXT[extname(path).toLowerCase()] ?? "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function buildHtml(result: AuditResult, score: GhostScore, logo: string | null): string {
  const { report, fixes } = result;
  const rev = report.revenue_estimate;
  const color = BAND_COLOR[score.band];
  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const brandMark = `<div class="brand">
        ${logo ? `<img src="${logo}" alt="${escapeHtml(REPORT_BRAND)}" class="logo" />` : ""}
        <span class="wordmark">${escapeHtml(REPORT_BRAND)}</span>
      </div>`;

  const leaks = report.leaks
    .slice(0, 5)
    .map(
      (l) => `
      <div class="leak">
        <div class="leak-head"><span class="rank">#${l.rank}</span> ${escapeHtml(l.category)}
          <span class="meta">${l.personas_affected} customers · severity ${l.severity_avg.toFixed(1)} · ${escapeHtml(l.page)}</span>
        </div>
        <div class="why">${escapeHtml(l.why_it_matters)}</div>
        ${l.best_quotes[0] ? `<div class="quote">“${escapeHtml(l.best_quotes[0])}”</div>` : ""}
      </div>`,
    )
    .join("");

  const assumptions = rev.assumptions
    .slice(0, 4)
    .map((a) => `<li>${escapeHtml(a)}</li>`)
    .join("");

  const fixList = fixes.length
    ? `<div class="fixes"><div class="section-title">Recommended fixes (ready to paste)</div>
        <ul>${fixes.map((f) => `<li>${escapeHtml(f.title)} <span class="meta">— ${escapeHtml(f.addresses)}</span></li>`).join("")}</ul>
      </div>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; margin: 0; padding: 28px 34px; font-size: 11px; line-height: 1.4; }
  .top { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; }
  .brand { display: flex; align-items: center; gap: 9px; }
  .logo { height: 26px; width: auto; }
  .wordmark { font-weight: 700; font-size: 16px; letter-spacing: .5px; }
  .doc-title { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666; }
  .hero { display: flex; align-items: center; gap: 22px; margin: 20px 0 14px; }
  .score { width: 108px; height: 108px; border-radius: 50%; border: 6px solid ${color}; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; }
  .score .num { font-size: 34px; font-weight: 700; line-height: 1; color: ${color}; }
  .score .out { font-size: 11px; color: #888; }
  .score .band { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: ${color}; margin-top: 3px; font-weight: 700; }
  .hero-txt h1 { font-size: 20px; margin: 0 0 4px; }
  .hero-txt .headline { font-size: 13px; color: #333; }
  .funnel { background: #f6f4ee; border-radius: 6px; padding: 9px 12px; margin: 6px 0 14px; font-size: 12px; }
  .funnel b { font-size: 13px; }
  .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin: 14px 0 6px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
  .leak { margin-bottom: 9px; }
  .leak-head { font-weight: 700; font-size: 11.5px; }
  .rank { color: ${color}; }
  .meta { font-weight: 400; color: #888; font-size: 9.5px; }
  .why { color: #333; margin: 2px 0; }
  .quote { color: #555; font-style: italic; border-left: 2px solid #ccc; padding-left: 8px; margin-top: 3px; font-size: 10px; }
  .revenue { background: #fff8e6; border: 1px solid #f0d98a; border-radius: 6px; padding: 10px 12px; margin-top: 10px; }
  .revenue .amount { font-size: 16px; font-weight: 700; color: #a9791a; }
  .revenue ul { margin: 6px 0 0; padding-left: 16px; color: #555; font-size: 9.5px; }
  .fixes ul { margin: 4px 0 0; padding-left: 16px; }
  .fixes li { margin-bottom: 2px; }
  .foot { margin-top: 18px; border-top: 1px solid #ddd; padding-top: 8px; color: #999; font-size: 9px; display: flex; justify-content: space-between; }
  </style></head><body>
    <div class="top">
      ${brandMark}
      <span class="doc-title">Growth Leak Report</span>
    </div>

    <div class="hero">
      <div class="score">
        <span class="num">${score.value}</span><span class="out">/ 100</span>
        <span class="band">${score.band}</span>
      </div>
      <div class="hero-txt">
        <h1>${escapeHtml(report.business_name)}</h1>
        <div class="headline">${escapeHtml(report.headline)}</div>
      </div>
    </div>

    <div class="funnel">
      <b>${report.funnel.total_shoppers}</b> AI customers walked in →
      <b>${report.funnel.would_have_bought}</b> would have bought,
      <b>${report.funnel.abandoned}</b> abandoned.
    </div>

    <div class="section-title">Top leaks</div>
    ${leaks}

    <div class="revenue">
      <div class="section-title" style="margin-top:0;border:none;padding:0;">Estimated revenue leaking</div>
      <span class="amount">${escapeHtml(rev.currency)} ${rev.monthly_low.toLocaleString("en-IN")} – ${rev.monthly_high.toLocaleString("en-IN")} / month</span>
      <ul>${assumptions}</ul>
    </div>

    ${fixList}

    <div class="foot">
      <span>Generated by GHOST · ${escapeHtml(REPORT_BRAND)}</span>
      <span>${escapeHtml(date)}</span>
    </div>
  </body></html>`;
}

/**
 * Build the self-contained report HTML (logo embedded). Exposed so a frontend
 * can render the same one-pager without going through PDF generation.
 */
export async function buildReportHtml(
  result: AuditResult,
  score: GhostScore,
): Promise<string> {
  const logo = await loadLogoDataUri(REPORT_LOGO_PATH);
  return buildHtml(result, score, logo);
}

/**
 * Render the Growth Leak Report to a PDF at `outPath`. Returns the path.
 * Creates the parent directory if needed.
 */
export async function generateReportPdf(
  result: AuditResult,
  score: GhostScore,
  outPath: string,
): Promise<string> {
  const html = await buildReportHtml(result, score);

  await mkdir(dirname(outPath), { recursive: true });

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
    return outPath;
  } finally {
    await browser.close();
  }
}
