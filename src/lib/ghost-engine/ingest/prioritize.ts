import { normalizePageUrl } from "./urlUtils";

/**
 * Cheap, LLM-free page prioritization. An audit cares about the customer-journey
 * pages (home, services/products, pricing, contact, about, booking, reviews) —
 * not blog posts, legal, or account pages. We rank discovered URLs by their path
 * so the crawler spends its page budget where the money is.
 */

// Path substrings that signal a high-value journey page → boosted.
const JOURNEY_HINTS: Array<[RegExp, number]> = [
  [/\/(pricing|prices|plans|rates|packages?|quote)(\/|$)/i, 6],
  [/\/(services?|offerings?)(\/|$)/i, 5],
  [/\/(products?|shop|store|catalog|menu)(\/|$)/i, 5],
  [/\/(book|booking|appointment|reserve|order|checkout|enquir|enquiry)(\/|$)/i, 5],
  [/\/(contact|reach|get-in-touch)(\/|$)/i, 4],
  [/\/(about|team|who-we-are|company)(\/|$)/i, 3],
  [/\/(reviews?|testimonials?|ratings?)(\/|$)/i, 3],
  [/\/(gallery|portfolio|work|case-stud)(\/|$)/i, 2],
];

// Path substrings that signal a low-value page for an audit → dropped.
const DROP_HINTS =
  /\/(blog|news|article|post|privacy|terms|policy|policies|refund|cookie|disclaimer|careers?|jobs|login|signin|sign-in|register|signup|account|cart|wishlist|referral|affiliate|sitemap)(\/|$)/i;

function pathScore(url: string): number {
  let path: string;
  try {
    path = new URL(url).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return -1;
  }

  if (path === "/") return 100; // homepage always wins
  if (DROP_HINTS.test(path)) return -1;

  let score = 1; // any non-dropped journey-adjacent page starts slightly positive
  for (const [pattern, weight] of JOURNEY_HINTS) if (pattern.test(path)) score += weight;

  // Prefer shallow pages; deep nested paths are usually detail/blog-like.
  const depth = path.split("/").filter(Boolean).length;
  score -= Math.max(0, depth - 1);
  return score;
}

/**
 * Return the root URL first, then the highest-scoring journey pages, dropping
 * blog/legal/account pages, capped to `maxPages`.
 */
export function prioritizeUrls(rootUrl: string, urls: string[], maxPages: number): string[] {
  const root = normalizePageUrl(rootUrl);
  const scored = urls
    .map((u) => normalizePageUrl(u))
    .filter((u, i, arr) => u !== root && arr.indexOf(u) === i)
    .map((u) => ({ url: u, score: pathScore(u) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  return [root, ...scored.map((x) => x.url)].slice(0, Math.max(1, maxPages));
}
