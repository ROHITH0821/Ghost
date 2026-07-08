import { NextRequest, NextResponse } from "next/server";
import { getMissionPreview, getMissionStatus } from "@/lib/api/ghost-api";
import { getSession } from "@/lib/auth";

// Reads the crawl's screenshot store (Node runtime).
export const runtime = "nodejs";

/**
 * Site preview for the scan animation.
 *
 * Preferred: the real homepage screenshot captured during THIS mission's crawl
 * (self-contained, no iframe/X-Frame-Options blocking). While the crawl is still
 * running we return { pending: true } so the client keeps polling. Only if the
 * crawl produced no screenshot (e.g. Playwright browser not installed) do we fall
 * back to an external screenshot service, then to a wireframe.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const missionId = request.nextUrl.searchParams.get("missionId");
  let fallbackUrl = request.nextUrl.searchParams.get("url");

  if (missionId) {
    const shot = getMissionPreview(missionId);
    if (shot) {
      return NextResponse.json({ imageUrl: shot, source: "crawl" });
    }

    const mission = await getMissionStatus(missionId);
    if (mission) {
      fallbackUrl = fallbackUrl ?? mission.url;
      // Crawl still in progress → tell the client to keep polling.
      const crawlInProgress =
        mission.status === "running" &&
        (mission.currentStage === "opening" || mission.currentStage === "understanding");
      if (crawlInProgress) {
        return NextResponse.json({ pending: true });
      }
    }
  }

  if (!fallbackUrl) {
    return NextResponse.json({ fallback: true });
  }

  const target = fallbackUrl.startsWith("http") ? fallbackUrl : `https://${fallbackUrl}`;
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(target)}&screenshot=true&meta=false`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (!res.ok) return NextResponse.json({ fallback: true });
    const data = await res.json();
    const imageUrl = data?.data?.screenshot?.url as string | undefined;
    return imageUrl
      ? NextResponse.json({ imageUrl, source: "microlink" })
      : NextResponse.json({ fallback: true });
  } catch {
    return NextResponse.json({ fallback: true });
  }
}
