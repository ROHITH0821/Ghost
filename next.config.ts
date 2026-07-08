import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This app is nested inside the engine's repo (which has its own lockfile), so
  // Next would otherwise infer the wrong workspace root. Pin it to this folder.
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  // Keep heavy/native server-only packages out of the bundle — they're required
  // at runtime (Node) rather than bundled. Playwright ships native binaries;
  // cheerio and the Anthropic SDK are server-only too.
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "@sparticuz/chromium",
    "cheerio",
    "@anthropic-ai/sdk",
  ],
};

export default nextConfig;
