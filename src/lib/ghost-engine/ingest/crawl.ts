import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import * as cheerio from "cheerio";
import { type Browser, chromium } from "playwright";

import {
  CRAWL_CACHE,
  CRAWL_CONCURRENCY,
  CRAWL_MAX_PAGES,
  CRAWL_SCREENSHOT_TOP_K,
  FETCH_TIMEOUT_MS,
} from "../config";
import { mapWithConcurrency } from "../util";
import { getPageInfo, USER_AGENT, type RawPage } from "./extract";
import { discoverSitemapUrls } from "./sitemap";
import { prioritizeUrls } from "./prioritize";
import {
  assertSafeUrl,
  getOrigin,
  isCrawlableUrl,
  isSameOrigin,
  normalizeInputUrl,
  normalizePageUrl,
} from "./urlUtils";

export interface RawCrawl {
  rootUrl: string;
  pages: RawPage[];
  discoveredFrom: { sitemap: number; links: number };
  truncated: boolean;
}

export interface CrawlOptions {
  maxPages?: number;
  screenshotTopK?: number;
  useCache?: boolean;
}

const CACHE_DIR = join(".cache", "crawl");
// Bump when crawl output shape/behavior changes, to invalidate stale caches.
// Bump when crawl behaviour changes so stale caches are invalidated. v3: JS-SPA
// force-render + domcontentloaded (was capturing blank shells on busy sites).
const CACHE_VERSION = "v3";

async function extractInternalLinks(rootUrl: string): Promise<string[]> {
  try {
    const origin = getOrigin(rootUrl);
    const response = await fetch(rootUrl, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const $ = cheerio.load(await response.text());

    const urls = new Set<string>();
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const absolute = new URL(href, rootUrl).href;
        if (isSameOrigin(absolute, origin) && isCrawlableUrl(absolute)) {
          urls.add(normalizePageUrl(absolute));
        }
      } catch {
        // skip invalid URLs
      }
    });
    return Array.from(urls);
  } catch {
    return [];
  }
}

function cachePath(key: string): string {
  return join(CACHE_DIR, `${createHash("md5").update(key).digest("hex")}.json`);
}

async function readCache(key: string): Promise<RawCrawl | null> {
  try {
    return JSON.parse(await readFile(cachePath(key), "utf-8")) as RawCrawl;
  } catch {
    return null;
  }
}

async function writeCache(key: string, crawl: RawCrawl): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cachePath(key), JSON.stringify(crawl), "utf-8");
  } catch {
    // cache is best-effort
  }
}

/**
 * Crawl a business site into raw pages ready for Context Pack synthesis.
 * Discovers URLs from the sitemap + homepage links, prioritizes journey pages,
 * fetches them in parallel, and screenshots the top-K for visual analysis.
 */
export async function crawlSite(url: string, options: CrawlOptions = {}): Promise<RawCrawl> {
  const rootUrl = normalizeInputUrl(url);
  const maxPages = options.maxPages ?? CRAWL_MAX_PAGES;
  const screenshotTopK = options.screenshotTopK ?? CRAWL_SCREENSHOT_TOP_K;
  const useCache = options.useCache ?? CRAWL_CACHE;
  const cacheKey = `${CACHE_VERSION}|${rootUrl}|${maxPages}|${screenshotTopK}`;

  if (useCache) {
    const cached = await readCache(cacheKey);
    if (cached) return cached;
  }

  // SSRF guard: refuse private/internal targets before touching the network.
  await assertSafeUrl(rootUrl);

  // One browser per crawl (lazily launched only if a page needs rendering), so
  // concurrent crawls don't share or tear down each other's browser. Held in an
  // object so the closure assignment survives TS's control-flow narrowing.
  const state: { browser: Browser | null } = { browser: null };
  const getBrowser = async (): Promise<Browser> =>
    (state.browser ??= await chromium.launch({ args: ["--no-sandbox"] }));

  try {
    const [sitemapUrls, linkUrls] = await Promise.all([
      discoverSitemapUrls(rootUrl),
      extractInternalLinks(rootUrl),
    ]);

    const merged = [...sitemapUrls, ...linkUrls];
    const truncated = new Set(merged.map(normalizePageUrl)).size + 1 > maxPages;
    const selected = prioritizeUrls(rootUrl, merged, maxPages);

    // Fetch the homepage first to detect a JS-rendered SPA. If the static HTML was
    // thin enough that we had to render it, the whole site is likely client-side
    // rendered — so force-render every other page too, otherwise product /
    // collection pages come back as blank shells and the audit is meaningless.
    const root = await getPageInfo(selected[0], {
      wantScreenshot: screenshotTopK > 0,
      getBrowser,
    });
    const isSpa = root.renderedWith === "dynamic";

    const restSettled = await mapWithConcurrency(selected.slice(1), CRAWL_CONCURRENCY, (pageUrl, i) =>
      getPageInfo(pageUrl, {
        wantScreenshot: i + 1 < screenshotTopK,
        forceRender: isSpa,
        getBrowser,
      }),
    );

    const pages = [
      root,
      ...restSettled
        .filter((r): r is PromiseFulfilledResult<RawPage> => r.status === "fulfilled")
        .map((r) => r.value),
    ].filter((p) => p.title || p.text); // drop pages that failed to load entirely

    const crawl: RawCrawl = {
      rootUrl,
      pages,
      discoveredFrom: { sitemap: sitemapUrls.length, links: linkUrls.length },
      truncated,
    };

    if (useCache && pages.length > 0) await writeCache(cacheKey, crawl);
    return crawl;
  } finally {
    await state.browser?.close();
  }
}
