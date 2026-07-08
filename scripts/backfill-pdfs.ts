import { db } from "../src/lib/db";
import { generateGhostReportPdf } from "../src/lib/report/reportPdf";
import { uploadMissionPdf } from "../src/lib/storage/supabase";
import { persistMissionPdf } from "../src/lib/db/missions";
import { Prisma } from "@prisma/client";

async function main() {
  const limit = process.env.BACKFILL_LIMIT ? Number(process.env.BACKFILL_LIMIT) : 50;
  const dryRun = process.env.DRY_RUN === "1";

  if (Number.isNaN(limit) || limit <= 0) {
    throw new Error("BACKFILL_LIMIT must be a positive number");
  }

  const missions = await db.mission.findMany({
    where: {
      status: "complete",
      pdfUrl: null,
      report: { not: Prisma.DbNull },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: { id: true, domain: true, report: true },
  });

  console.log(`Found ${missions.length} mission(s) missing PDFs (limit=${limit}).`);

  for (const m of missions) {
    console.log(`\n${m.id} (${m.domain})`);
    if (dryRun) {
      console.log("DRY_RUN=1, skipping generate/upload.");
      continue;
    }

    const report = m.report as any;
    const pdf = await generateGhostReportPdf(report);
    const uploaded = await uploadMissionPdf({ missionId: m.id, domain: m.domain, pdfBytes: pdf });
    await persistMissionPdf(m.id, { pdfUrl: uploaded.publicUrl });
    console.log(`Uploaded → ${uploaded.publicUrl}`);
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });

