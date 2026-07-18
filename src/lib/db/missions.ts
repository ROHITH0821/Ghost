import { createPersonas } from "@/lib/mock-data";
import type { GhostReport, MissionState } from "@/lib/types";
import { db } from "@/lib/db";

function toJson<T>(value: T) {
  return JSON.parse(JSON.stringify(value));
}

function missionProgress(state: MissionState) {
  return {
    currentStage: state.currentStage,
    stageProgress: state.stageProgress,
    personas: state.personas,
    startedAt: state.startedAt,
    previewImageUrl: state.previewImageUrl,
    progressLog: state.progressLog,
    detectedFlows: state.detectedFlows,
    customerSnippets: state.customerSnippets,
    error: state.error,
  };
}

export async function persistMissionStart(input: {
  missionId: string;
  url: string;
  domain: string;
  userId: string;
}): Promise<void> {
  const startedAt = new Date().toISOString();
  await db.mission.upsert({
    where: { id: input.missionId },
    create: {
      id: input.missionId,
      url: input.url,
      domain: input.domain,
      userId: input.userId,
      status: "running",
      progress: toJson({
        currentStage: "opening",
        stageProgress: 0,
        personas: createPersonas(),
        startedAt,
      }),
    },
    update: {
      url: input.url,
      domain: input.domain,
      userId: input.userId,
      status: "running",
      progress: toJson({
        currentStage: "opening",
        stageProgress: 0,
        personas: createPersonas(),
        startedAt,
      }),
    },
  });
}

export async function persistMissionProgress(
  missionId: string,
  state: MissionState
): Promise<void> {
  await db.mission.update({
    where: { id: missionId },
    data: {
      status: state.status,
      progress: toJson(missionProgress(state)),
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
      progress: toJson({
        currentStage: "generating",
        stageProgress: 100,
        personas: createPersonas(),
        startedAt: report.scannedAt,
      }),
    },
    update: {
      status: "complete",
      report: toJson(report),
      progress: toJson({
        currentStage: "generating",
        stageProgress: 100,
        startedAt: report.scannedAt,
      }),
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
      progress: toJson({ error }),
    },
    update: {
      status: "error",
      report: toJson({ error }),
      progress: toJson({ error }),
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

export async function persistMissionPdf(
  missionId: string,
  input: { pdfUrl: string }
): Promise<void> {
  await db.mission.update({
    where: { id: missionId },
    data: {
      pdfUrl: input.pdfUrl,
      pdfUploadedAt: new Date(),
    },
  });
}

export async function getMissionPdfUrlFromDb(missionId: string): Promise<string | null> {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    select: { pdfUrl: true, status: true },
  });

  if (!mission?.pdfUrl || mission.status !== "complete") return null;
  return mission.pdfUrl;
}

export async function getMissionStatusFromDb(
  missionId: string
): Promise<MissionState | null> {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
  });

  if (!mission) return null;

  const progress = (mission.progress ?? {}) as Partial<MissionState>;
  const status = mission.status as MissionState["status"];

  const state: MissionState = {
    id: mission.id,
    url: mission.url,
    domain: mission.domain,
    status,
    currentStage: progress.currentStage ?? "opening",
    stageProgress: progress.stageProgress ?? 0,
    personas: progress.personas ?? createPersonas(),
    startedAt: progress.startedAt ?? mission.createdAt.toISOString(),
    error: progress.error,
  };

  if (status === "complete") {
    return {
      ...state,
      status: "complete",
      currentStage: "generating",
      stageProgress: 100,
    };
  }

  if (status === "error") {
    const errReport = mission.report as { error?: string } | null;
    return {
      ...state,
      status: "error",
      error: errReport?.error ?? progress.error,
    };
  }

  return state;
}

export type RecentMissionRow = {
  id: string;
  url: string;
  domain: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  pdfUrl?: string | null;
  progress?: {
    currentStage?: MissionState["currentStage"];
    stageProgress?: number;
    error?: string;
  } | null;
};

export async function getRecentMissionsForUser(input: {
  userId: string;
  limit?: number;
}): Promise<RecentMissionRow[]> {
  // `progress` can be hundreds of KB per row (it may embed a base64 preview
  // screenshot), so project only the keys the profile list actually renders
  // instead of pulling the whole JSON column across the wire.
  const rows = await db.$queryRaw<
    Array<{
      id: string;
      url: string;
      domain: string;
      status: string;
      pdfUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      currentStage: string | null;
      stageProgress: number | null;
      error: string | null;
    }>
  >`
    SELECT id, url, domain, status, "pdfUrl", "createdAt", "updatedAt",
           progress->>'currentStage'           AS "currentStage",
           (progress->>'stageProgress')::float AS "stageProgress",
           progress->>'error'                  AS "error"
    FROM "Mission"
    WHERE "userId" = ${input.userId}
    ORDER BY "createdAt" DESC
    LIMIT ${input.limit ?? 12}`;

  return rows.map(({ currentStage, stageProgress, error, ...rest }) => ({
    ...rest,
    progress: {
      currentStage:
        (currentStage as MissionState["currentStage"] | null) ?? undefined,
      stageProgress: stageProgress ?? undefined,
      error: error ?? undefined,
    },
  }));
}
