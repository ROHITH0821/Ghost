import * as cheerio from "cheerio";

import { FETCH_TIMEOUT_MS } from "../config";
import { getOrigin, isCrawlableUrl, isSameOrigin, normalizePageUrl } from "./urlUtils";
import { USER_AGENT } from "./extract";

/**
 * Sitemap discovery — robots.txt Sitemap: directives plus common fallback paths,
 * following child sitemaps one level. Ported from the takeover extractor.
 */

const MAX_CHILD_SITEMAPS = 5;
const FALLBACK_SITEMAP_PATHS = ["/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"];

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function discoverSitemapCandidates(rootUrl: string): Promise<string[]> {
  const origin = getOrigin(rootUrl);
  const candidates = new Set<string>();

  const robotsTxt = await fetchText(`${origin}/robots.txt`);
  if (robotsTxt) {
    for (const line of robotsTxt.split("\n")) {
      const match = line.match(/^\s*sitemap:\s*(.+)\s*$/i);
      if (match?.[1]) candidates.add(match[1].trim());
    }
  }
  for (const path of FALLBACK_SITEMAP_PATHS) candidates.add(`${origin}${path}`);

  return Array.from(candidates);
}

function parseSitemapXml(
  xml: string,
  origin: string,
): { pageUrls: string[]; childSitemaps: string[] } {
  const $ = cheerio.load(xml, { xml: true });
  const pageUrls: string[] = [];
  const childSitemaps: string[] = [];

  $("sitemap loc").each((_, el) => {
    const loc = $(el).text().trim();
    if (loc) childSitemaps.push(loc);
  });
  $("url loc").each((_, el) => {
    const loc = $(el).text().trim();
    if (loc) pageUrls.push(loc);
  });

  const filteredPages = pageUrls.filter((u) => isSameOrigin(u, origin) && isCrawlableUrl(u));
  return { pageUrls: filteredPages, childSitemaps };
}

async function parseSitemap(
  sitemapUrl: string,
  origin: string,
  visited: Set<string>,
): Promise<string[]> {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  const xml = await fetchText(sitemapUrl);
  if (!xml) return [];

  const { pageUrls, childSitemaps } = parseSitemapXml(xml, origin);
  const allUrls = [...pageUrls];
  for (const child of childSitemaps.slice(0, MAX_CHILD_SITEMAPS)) {
    allUrls.push(...(await parseSitemap(child, origin, visited)));
  }
  return allUrls;
}

export async function discoverSitemapUrls(rootUrl: string): Promise<string[]> {
  try {
    const origin = getOrigin(rootUrl);
    const candidates = await discoverSitemapCandidates(rootUrl);
    const visited = new Set<string>();
    const urlSet = new Set<string>();

    for (const candidate of candidates) {
      for (const u of await parseSitemap(candidate, origin, visited)) {
        urlSet.add(normalizePageUrl(u));
      }
    }
    return Array.from(urlSet);
  } catch {
    return [];
  }
}
