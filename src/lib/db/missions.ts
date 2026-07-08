import type { GhostReport } from "@/lib/types";
import { db } from "@/lib/db";

function toJson(report: GhostReport | { error: string }) {
  return JSON.parse(JSON.stringify(report));
}

export async function persistMissionStart(input: {
  missionId: string;
  url: string;
  domain: string;
  userId: string;
}): Promise<void> {
  await db.mission.upsert({
    where: { id: input.missionId },
    create: {
      id: input.missionId,
      url: input.url,
      domain: input.domain,
      userId: input.userId,
      status: "running",
    },
    update: {
      url: input.url,
      domain: input.domain,
      userId: input.userId,
      status: "running",
    },
  });
}

export async function persistMissionReport(
  missionId: string,
  report: GhostReport
): Promise<void> {
  await db.mission.upsert({
    where: { id: missionId },
    create: {
      id: missionId,
      url: report.url,
      domain: report.domain,
      status: "complete",
      report: toJson(report),
    },
    update: {
      status: "complete",
      report: toJson(report),
    },
  });
}

export async function persistMissionError(
  missionId: string,
  error: string
): Promise<void> {
  await db.mission.upsert({
    where: { id: missionId },
    create: {
      id: missionId,
      url: "",
      domain: "",
      status: "error",
      report: toJson({ error }),
    },
    update: {
      status: "error",
      report: toJson({ error }),
    },
  });
}

export async function getMissionReportFromDb(
  missionId: string
): Promise<GhostReport | null> {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    select: { report: true, status: true },
  });

  if (!mission?.report || mission.status !== "complete") {
    return null;
  }

  return mission.report as unknown as GhostReport;
}
