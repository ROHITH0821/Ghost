import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/api/ghost-api";
import { getSession } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { getMissionPdfUrlFromDb } from "@/lib/db/missions";
import { generateGhostReportPdf } from "@/lib/report/reportPdf";

// PDF generation uses Playwright — force the Node.js runtime.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: copy.authApi.authRequired }, { status: 401 });
  }

  const { id } = await params;
  const storedPdfUrl = await getMissionPdfUrlFromDb(id);
  if (storedPdfUrl) {
    return NextResponse.redirect(storedPdfUrl, 302);
  }

  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: copy.authApi.reportNotFound }, { status: 404 });
  }

  try {
    const pdf = await generateGhostReportPdf(report);
    const safeName = report.domain.replace(/[^a-z0-9.-]/gi, "_") || "site";
    // Uint8Array is a valid response body at runtime; TS 5.7 typed-array generics
    // don't line up with BodyInit, so cast at this single boundary.
    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ghost-report-${safeName}.pdf"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[report-pdf]", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
