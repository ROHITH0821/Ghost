import { dirname } from "node:path";
import type { Browser } from "playwright-core";

function isServerless(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL_ENV
  );
}

/** Launch Chromium for HTML→PDF. Uses @sparticuz/chromium on Vercel/Lambda. */
export async function launchPdfBrowser(): Promise<Browser> {
  if (isServerless()) {
    const chromiumPack = (await import("@sparticuz/chromium")).default;
    const { chromium: playwright } = await import("playwright-core");

    chromiumPack.setGraphicsMode = false;

    const executablePath = await chromiumPack.executablePath();
    process.env.LD_LIBRARY_PATH = dirname(executablePath);

    return playwright.launch({
      args: chromiumPack.args,
      executablePath,
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch({ args: ["--no-sandbox"] });
}
