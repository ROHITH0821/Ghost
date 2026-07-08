import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ConversionLeak, GhostReport, Severity } from "@/lib/types";
import { launchPdfBrowser } from "./launchBrowser";

/**
 * Generates the downloadable branded PDF from a GhostReport (the same data the
 * user sees on the results page). Rendered via Playwright's page.pdf() with the
 * Web Aura India logo embedded — self-contained, no external assets.
 */

const LOGO_PATH = join(process.cwd(), "public", "webaura-mark-light.png");
const BRAND = "Web Aura India";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#38bdf8",
};

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#38bdf8";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Leaky";
  return "Critical";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadLogo(): Promise<string | null> {
  try {
    const buf = await readFile(LOGO_PATH);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function leakHtml(leak: ConversionLeak): string {
  const color = SEVERITY_COLOR[leak.severity];
  const fixBlock = leak.fix
    ? `<div class="fixbox">
         <div class="fixtitle">${esc(leak.fix.title)}</div>
         <pre>${esc(leak.fix.content)}</pre>
       </div>`
    : "";
  return `
    <div class="leak">
      <div class="leak-head">
        <span class="leak-title">${esc(leak.title)}</span>
        <span class="sev" style="background:${color}22;color:${color};">${leak.severity.toUpperCase()}</span>
      </div>
      <div class="leak-cat">${esc(leak.category)}</div>
      <div class="cols">
        <div><div class="lbl">What's wrong</div><p>${esc(leak.whatIsWrong)}</p></div>
        <div><div class="lbl">Why customers leave</div><p>${esc(leak.whyCustomersLeave)}</p></div>
      </div>
      <div class="impact">${esc(leak.impact)}</div>
      <div class="lbl fixlbl">How to fix it</div>
      <p class="fixsummary">${esc(leak.howToFix)}</p>
      ${fixBlock}
    </div>`;
}

export function buildReportHtml(report: GhostReport, logo: string | null): string {
  const color = scoreColor(report.score);
  const bu = report.businessUnderstanding;
  const scannedAt = new Date(report.scannedAt);
  const date = scannedAt.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = scannedAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const brand = `<div class="brand">${
    logo ? `<img src="${logo}" class="logo" alt="${esc(BRAND)}"/>` : ""
  }<span class="wordmark">${esc(BRAND)}</span></div>`;

  const expectations = bu.customerExpectations
    .map((e) => `<span class="chip">${esc(e)}</span>`)
    .join("");

  const fixes = report.fixes
    .map(
      (f) => `
      <div class="fix">
        <div class="fix-head">${f.icon} <b>${esc(f.title)}</b> <span class="fix-cat">${esc(f.category)}</span></div>
        <div class="fix-desc">${esc(f.description)}</div>
        <pre>${esc(f.content)}</pre>
      </div>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; margin: 0; padding: 30px 34px; font-size: 11px; line-height: 1.45; }
    .top { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; }
    .brand { display: flex; align-items: center; gap: 9px; }
    .logo { height: 26px; width: auto; }
    .wordmark { font-weight: 700; font-size: 16px; letter-spacing: .4px; }
    .doc-title { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666; }
    .hero { display: flex; align-items: center; gap: 22px; margin: 20px 0 16px; }
    .score { width: 112px; height: 112px; border-radius: 50%; border: 6px solid ${color}; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; }
    .score .num { font-size: 36px; font-weight: 700; line-height: 1; color: ${color}; }
    .score .out { font-size: 11px; color: #888; }
    .score .band { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: ${color}; margin-top: 3px; font-weight: 700; }
    .hero-txt h1 { font-size: 22px; margin: 0 0 4px; }
    .hero-txt .goal { font-size: 12.5px; color: #333; }
    .note { background: #fff8e6; border: 1px solid #f0d98a; border-radius: 6px; padding: 9px 12px; margin: 14px 0 0; font-size: 10px; color: #6b5a1a; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
    .bu { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
    .bu .lbl { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
    .bu p { margin: 1px 0 6px; }
    .chips { margin-top: 4px; }
    .chip { display: inline-block; border: 1px solid #ddd; border-radius: 20px; padding: 2px 9px; margin: 0 4px 4px 0; font-size: 9.5px; color: #555; }
    .leak { border: 1px solid #eee; border-left: 3px solid #ccc; border-radius: 6px; padding: 11px 13px; margin-bottom: 10px; page-break-inside: avoid; }
    .leak-head { display: flex; align-items: center; gap: 8px; }
    .leak-title { font-weight: 700; font-size: 13px; }
    .sev { border-radius: 20px; padding: 1px 8px; font-size: 8.5px; font-weight: 700; letter-spacing: .5px; }
    .leak-cat { color: #999; font-size: 9.5px; margin: 1px 0 6px; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 2px; }
    .cols p { margin: 0; color: #333; }
    .impact { margin-top: 7px; color: #a9791a; font-size: 10.5px; }
    .fixlbl { margin-top: 9px; color: #1f9d55; }
    .fixsummary { margin: 0 0 6px; color: #333; }
    .fixbox { background: #f6faf7; border: 1px solid #d7ecdd; border-radius: 6px; padding: 8px 10px; }
    .fixtitle { font-weight: 700; font-size: 10.5px; margin-bottom: 4px; }
    pre { white-space: pre-wrap; word-break: break-word; font-family: "Courier New", monospace; font-size: 9.5px; line-height: 1.4; color: #333; margin: 0; }
    .fix { border: 1px solid #eee; border-radius: 6px; padding: 10px 12px; margin-bottom: 9px; page-break-inside: avoid; }
    .fix-head { font-size: 12px; margin-bottom: 3px; }
    .fix-cat { color: #999; font-size: 9.5px; }
    .fix-desc { color: #555; font-size: 10px; margin-bottom: 6px; }
    .foot { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 8px; color: #999; font-size: 9px; display: flex; justify-content: space-between; }
  </style></head><body>
    <div class="top">${brand}<span class="doc-title">Growth Leak Report</span></div>

    <div class="hero">
      <div class="score">
        <span class="num">${report.score}</span><span class="out">/ 100</span>
        <span class="band">${scoreLabel(report.score)}</span>
      </div>
      <div class="hero-txt">
        <h1>${esc(report.domain)}</h1>
        <div class="goal">${esc(bu.primaryGoal)}</div>
        <div class="goal" style="margin-top:4px;color:#666;font-size:10.5px;">
          ${esc(report.url)} · ${esc(date)} ${esc(time)}
        </div>
      </div>
    </div>

    ${
      report.lowConfidence && report.confidenceNote
        ? `<div class="note"><b>Limited visibility — results may be incomplete.</b> ${esc(report.confidenceNote)}</div>`
        : ""
    }

    <div class="section-title">What Ghost detected</div>
    <div class="bu">
      <div><div class="lbl">Business</div><p>${esc(bu.businessType)}</p></div>
      <div><div class="lbl">Target audience</div><p>${esc(bu.targetAudience)}</p></div>
    </div>
    <div class="chips">${expectations}</div>

    <div class="section-title">Where customers ghost — ${report.leaks.length} leaks</div>
    ${report.leaks.map(leakHtml).join("")}

    ${
      report.fixes.length
        ? `<div class="section-title">Growth Kit — ready-to-paste fixes</div>${fixes}`
        : ""
    }

    <div class="foot">
      <span>Generated by GHOST · ${esc(BRAND)}</span>
      <span>${esc(date)}</span>
    </div>
  </body></html>`;
}

export async function generateGhostReportPdf(report: GhostReport): Promise<Uint8Array> {
  const logo = await loadLogo();
  const html = buildReportHtml(report, logo);

  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}
