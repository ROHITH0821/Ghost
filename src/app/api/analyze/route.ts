import { NextRequest, NextResponse } from "next/server";
import { getMissionStatus, runGhostAudit, startGhostMission } from "@/lib/api/ghost-api";
import { getSession } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { persistMissionStart } from "@/lib/db/missions";
import { resolveUserId } from "@/lib/db/users";
import { extractDomain } from "@/lib/utils";

// The audit uses Playwright + the Anthropic SDK — force the Node.js runtime.
export const runtime = "nodejs";
// Audits can run for several minutes on long-running hosts.
export const maxDuration = 300;

async function requireSession() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: copy.authApi.authRequired },
      { status: 401 }
    );
  }
  return session;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: copy.authApi.urlRequired }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const domain = extractDomain(trimmedUrl);
    const missionId = `mission-${Date.now().toString(36)}`;

    const userId = await resolveUserId(session.email);
    await persistMissionStart({
      missionId,
      url: trimmedUrl,
      domain,
      userId,
    });

    const result = await startGhostMission({ url: trimmedUrl, missionId });

    // Kick off the audit without blocking the response.
    // `after()` can be unreliable in dev / some runtimes; a detached promise is simpler.
    void runGhostAudit(missionId, trimmedUrl, domain).catch((error) => {
      console.error("[analyze] background audit failed:", error);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[analyze]", error);
    return NextResponse.json(
      { error: copy.authApi.missionFailed },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const missionId = request.nextUrl.searchParams.get("missionId");

  if (!missionId) {
    return NextResponse.json(
      { error: copy.authApi.missionIdRequired },
      { status: 400 }
    );
  }

  const mission = await getMissionStatus(missionId);
  if (!mission) {
    return NextResponse.json({ error: copy.authApi.missionNotFound }, { status: 404 });
  }

  return NextResponse.json({ mission });
}
