import Anthropic from "@anthropic-ai/sdk";

/**
 * Lazily-constructed shared Anthropic client.
 *
 * Constructing eagerly would throw at import time when ANTHROPIC_API_KEY is
 * absent (e.g. during `next build` or in CI). Deferring construction to first
 * use keeps the module import-safe; the key is read from the environment.
 *
 * maxRetries handles transient 429/5xx/connection errors with backoff. Models,
 * token budgets, and concurrency live in config.ts.
 */
let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  return (client ??= new Anthropic({ maxRetries: 3 }));
}
