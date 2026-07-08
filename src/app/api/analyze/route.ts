import { NextRequest, NextResponse } from "next/server";
import { getMissionStatus, startGhostMission } from "@/lib/api/ghost-api";
import { getSession } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { db } from "@/lib/db";
import { extractDomain } from "@/lib/utils";

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

    const result = await startGhostMission({ url });

    await db.mission.upsert({
      where: { id: result.missionId },
      create: {
        id: result.missionId,
        url: url.trim(),
        domain: extractDomain(url),
        userId: session.userId,
        status: "running",
      },
      update: {
        url: url.trim(),
        domain: extractDomain(url),
        userId: session.userId,
        status: "running",
      },
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
