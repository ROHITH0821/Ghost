import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type Anthropic from "@anthropic-ai/sdk";

import { anthropic } from "../client";
import { MODEL, MAX_TOKENS_CONTEXT_PACK, CONTEXT_PACK_TEXT_CAP } from "../config";
import { ContextPackSchema, type ContextPack } from "../types";
import type { RawCrawl } from "./crawl";

/**
 * Stage 1.4 — Context Pack synthesis.
 *
 * The crawler gives us raw pages (text, meta, structured data, screenshots). Our
 * engine needs the *interpreted* view a customer experiences: which prices are
 * actually visible, the real CTAs, the visual hierarchy, the trust signals. Those
 * don't exist in raw HTML — an LLM derives them. This is that single call: raw
 * crawl (+ screenshots via vision) → a zod-validated ContextPack.
 */

const SYNTH_SYSTEM = `
You convert a raw website crawl into a "Context Pack" — a structured description of a
business's online presence AS A CUSTOMER ACTUALLY EXPERIENCES IT. This pack feeds an
audit that finds where customers give up, so accuracy about what a visitor can and cannot
find matters more than marketing polish.

You are given crawled pages (URL, title, meta description, visible text, structured data)
and full-page SCREENSHOTS of the most important pages. Use the screenshots to judge visual
hierarchy — what a real visitor sees first, what is buried, what is above the fold.

Produce the Context Pack with these fields, grounded ONLY in the crawl (never invent):

- business: { name, type (e.g. salon, cafe, web agency, boutique, gym…), location }.
  Infer from titles, text, and structured data. If location isn't stated, say "not stated on site".
- pages[]: one entry per meaningful crawled page, each with:
    - url, title
    - summary: what the page offers, in one or two plain sentences
    - prices_visible: judge how many real prices a customer can actually see —
      "none", "partial — N of M services/products", or "all". "Contact for quote",
      "DM for price", and login-walled prices count as NOT visible.
    - ctas: the ACTUAL call-to-action button/link texts on the page (e.g. "Book Now",
      "Get a Quote", "Add to Cart", "Contact for price"). Empty array if none.
    - visual_notes: what a human SEES from the screenshot — hierarchy, what's above the
      fold, what's buried, how many hero banners before real content. If there is no
      screenshot for this page, base it on structure and say "(no screenshot — inferred)".
- nav_structure: the main navigation items.
- contact_paths: every real way a customer can contact/book — form (with field count if
  known), phone (and whether it's prominent or buried), WhatsApp, email, chat. Be specific.
- search: { exists: whether the site has a working product/service search }.
- reviews: { visible: whether ratings, testimonials, or a review widget are shown to visitors }.
- trust_signals: concrete signals present OR notably ABSENT — address shown/missing,
  real shopfront/staff photos, reviews, credentials, years in business. The absences are
  as important as the presences.

Be precise and customer-eyed. If the business hides prices, has no reviews, or buries its
phone number, say so plainly — that is exactly what the audit needs.
`.trim();

/** Compact the crawl into a token-bounded text payload for synthesis. */
function crawlToText(crawl: RawCrawl): string {
  const pages = crawl.pages
    .map((p, i) => {
      const parts = [
        `### PAGE ${i + 1}: ${p.url}`,
        `title: ${p.title || "(none)"}`,
        p.metaDescription ? `meta: ${p.metaDescription}` : "",
        p.screenshotB64 ? `screenshot: attached below` : "",
        p.jsonld.length ? `structured_data: ${JSON.stringify(p.jsonld).slice(0, 1500)}` : "",
        `text: ${p.text.slice(0, CONTEXT_PACK_TEXT_CAP)}`,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");

  return `ROOT: ${crawl.rootUrl}
PAGES CRAWLED: ${crawl.pages.length}

${pages}`;
}

export async function buildContextPack(crawl: RawCrawl): Promise<ContextPack> {
  if (crawl.pages.length === 0) {
    throw new Error(`Crawl of ${crawl.rootUrl} returned no usable pages.`);
  }

  const content: Anthropic.ContentBlockParam[] = [
    { type: "text", text: crawlToText(crawl) },
  ];

  // Attach the screenshots (vision) so visual_notes reflects what a visitor sees.
  for (const page of crawl.pages) {
    if (!page.screenshotB64) continue;
    content.push({ type: "text", text: `Screenshot of ${page.url}:` });
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: page.screenshotB64 },
    });
  }

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: MAX_TOKENS_CONTEXT_PACK,
    system: SYNTH_SYSTEM,
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(ContextPackSchema) },
  });

  const pack = response.parsed_output;
  if (!pack) {
    throw new Error(
      `Context Pack synthesis returned nothing parseable (stop_reason=${response.stop_reason}).`,
    );
  }
  return pack;
}
