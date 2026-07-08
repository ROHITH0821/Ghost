import { crawlSite, type CrawlOptions, type RawCrawl } from "./crawl";
import { buildContextPack } from "./buildContextPack";
import type { ContextPack } from "../types";

export type { RawCrawl } from "./crawl";
export type { RawPage } from "./extract";
export { crawlSite } from "./crawl";
export { buildContextPack } from "./buildContextPack";

export interface IngestEvents {
  /** Fired after the crawl, before synthesis. */
  onCrawled?: (crawl: RawCrawl) => void;
}

/**
 * Stage 1 → 1.4: turn a URL into a Context Pack the engine can audit.
 * crawl the site → synthesize the customer-eyed Context Pack.
 */
export async function ingestUrl(
  url: string,
  events: IngestEvents = {},
  options: CrawlOptions = {},
): Promise<ContextPack> {
  const crawl = await crawlSite(url, options);
  events.onCrawled?.(crawl);
  return buildContextPack(crawl);
}
