import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/api/ghost-api";
import { getSession } from "@/lib/auth";
import { copy } from "@/lib/copy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: copy.authApi.authRequired },
      { status: 401 }
    );
  }

  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return NextResponse.json(
      { error: copy.authApi.reportNotFound },
      { status: 404 }
    );
  }

  return NextResponse.json({ report });
}
