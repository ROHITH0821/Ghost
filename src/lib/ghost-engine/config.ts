/**
 * Central tunables. One place for models, token budgets, and concurrency so the
 * cost/quality knobs aren't scattered across the pipeline.
 */

import { join } from "node:path";

/**
 * Parse an integer env var, falling back to `fallback` when unset, blank, or not
 * a finite number — so a stray `GHOST_MAX_FIXES=abc` can't turn into NaN and
 * silently break a loop.
 */
export function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Personas + aggregation. Claude Sonnet 4.6 — cost-optimized and strong enough
 * to keep persona complaints site-specific. Override with GHOST_MODEL.
 */
export const MODEL = process.env.GHOST_MODEL ?? "claude-sonnet-4-6";

/**
 * Flow analysis (Stage 1.5) is a lighter structural task and can run on a
 * cheaper model. Defaults to MODEL; set GHOST_FLOW_MODEL=claude-haiku-4-5 to
 * shave cost/latency further.
 */
export const FLOW_MODEL = process.env.GHOST_FLOW_MODEL ?? MODEL;

// Output-token budgets per stage.
export const MAX_TOKENS_FLOWS = 2500; // flow list; business-driven length
export const MAX_TOKENS_PERSONA = 2000; // one shopper journey
export const MAX_TOKENS_REPORT = 10000; // the full Growth Leak Report
export const MAX_TOKENS_FIX = 1500; // one ready-to-paste fix

/**
 * How many top leaks to generate fixes for (Stage 4). Ranked, so this takes the
 * worst N. Kept small by default — fixes are the last, low-volume step, and this
 * bounds their cost directly. Override with GHOST_MAX_FIXES.
 */
export const MAX_FIXES = Math.max(1, intEnv("GHOST_MAX_FIXES", 3));

// --- Ingest (Stage 1 → 1.4) -------------------------------------------------

/** Max pages to crawl per site (after prioritization). */
export const CRAWL_MAX_PAGES = Math.max(1, intEnv("GHOST_CRAWL_MAX_PAGES", 8));
/** How many top journey pages get a screenshot (for visual_notes). */
export const CRAWL_SCREENSHOT_TOP_K = Math.max(0, intEnv("GHOST_CRAWL_SCREENSHOTS", 3));
/** How many pages to fetch in parallel while crawling. */
export const CRAWL_CONCURRENCY = Math.max(1, intEnv("GHOST_CRAWL_CONCURRENCY", 4));
/** Per-page text sent to the synthesis call is capped to this many chars. */
export const CONTEXT_PACK_TEXT_CAP = Math.max(500, intEnv("GHOST_TEXT_CAP", 4000));
/** Cache crawl results on disk under .cache/ (skip re-crawling). Set 0 to disable. */
export const CRAWL_CACHE = process.env.GHOST_CRAWL_CACHE !== "0";
/** Per-request timeout for static fetches, so a hanging server can't stall a crawl. */
export const FETCH_TIMEOUT_MS = Math.max(1000, intEnv("GHOST_FETCH_TIMEOUT_MS", 15000));
/** Output-token budget for the Context Pack synthesis call. */
export const MAX_TOKENS_CONTEXT_PACK = 4000;

// --- Branding / report ------------------------------------------------------

/** Brand shown on the PDF report. Override with GHOST_BRAND for white-labeling. */
export const REPORT_BRAND = process.env.GHOST_BRAND ?? "Web Aura India";
/**
 * Logo embedded in the PDF report — the Web Aura India black "W" mark, which
 * reads on the report's white background. Resolved relative to the project so it
 * works regardless of the caller's working directory.
 */
export const REPORT_LOGO_PATH = join(process.cwd(), "public", "webaura-mark-light.png");
/** Generate the PDF one-pager after an audit. Set GHOST_PDF=0 to skip. */
export const REPORT_PDF = process.env.GHOST_PDF !== "0";

/**
 * Persona calls run fully in parallel by default (every flow is independent, so
 * the swarm finishes in roughly one call's time). GHOST_SWARM_CONCURRENCY is a
 * safety valve only: set it to a number if you ever start hitting 429s and want
 * to throttle. Unset = unbounded (all at once).
 */
export const SWARM_CONCURRENCY = process.env.GHOST_SWARM_CONCURRENCY
  ? Math.max(1, intEnv("GHOST_SWARM_CONCURRENCY", 6))
  : Number.POSITIVE_INFINITY;
