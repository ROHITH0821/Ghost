import { NextRequest, NextResponse, after } from "next/server";
import { getReport } from "@/lib/api/ghost-api";
import { getSession } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { getMissionPdfUrlFromDb, persistMissionPdf } from "@/lib/db/missions";
import { generateGhostReportPdf } from "@/lib/report/reportPdf";
import { uploadMissionPdf } from "@/lib/storage/supabase";

// PDF generation uses Playwright — force the Node.js runtime.
export const runtime = "nodejs";
export const maxDuration = 60;

function storageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: copy.authApi.authRequired }, { status: 401 });
  }

  const { id } = await params;
  const wantsDownload = request.nextUrl.searchParams.get("download") === "1";

  const storedPdfUrl = await getMissionPdfUrlFromDb(id);
  if (storedPdfUrl) {
    // Supabase public URLs render inline; `?download=<name>` forces a save-as.
    const target = wantsDownload
      ? `${storedPdfUrl}?download=ghost-report.pdf`
      : storedPdfUrl;
    return NextResponse.redirect(target, 302);
  }

  const report = await getReport(id);
  if (!report) {
    return NextResponse.json({ error: copy.authApi.reportNotFound }, { status: 404 });
  }

  try {
    const pdf = await generateGhostReportPdf(report);
    const safeName = report.domain.replace(/[^a-z0-9.-]/gi, "_") || "site";
    const filename = `ghost-report-${safeName}.pdf`;

    // Persist after the response so the next view is a storage redirect
    // instead of a fresh Playwright render. Skipped until storage env is set.
    if (storageConfigured()) {
      after(async () => {
        try {
          const uploaded = await uploadMissionPdf({
            missionId: id,
            domain: report.domain,
            pdfBytes: pdf,
          });
          await persistMissionPdf(id, { pdfUrl: uploaded.publicUrl });
        } catch (error) {
          console.error("[report-pdf] persist failed", error);
        }
      });
    }

    // Uint8Array is a valid response body at runtime; TS 5.7 typed-array generics
    // don't line up with BodyInit, so cast at this single boundary.
    return new NextResponse(pdf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
        // A completed report's PDF is immutable — let the browser reuse it.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[report-pdf]", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
