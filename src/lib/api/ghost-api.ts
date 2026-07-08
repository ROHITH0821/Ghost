/**
 * API client layer — swap mock implementations with real backend calls.
 *
 * Future integration points:
 * - POST /api/analyze          → startGhostMission()
 * - GET  /api/missions/:id     → getMissionStatus()
 * - GET  /api/reports/:id      → getReport()
 */

import { createInitialMission, createMockReport } from "../mock-data";
import { MISSION_STAGES } from "../constants";
import { getPersonaThought, getPersonaLocation } from "../copy";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  GhostReport,
  MissionState,
} from "../types";
import { extractDomain } from "../utils";

const missionStore = new Map<string, MissionState>();
const reportStore = new Map<string, GhostReport>();

export async function startGhostMission(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const domain = extractDomain(request.url);
  const missionId = `mission-${Date.now().toString(36)}`;

  const mission = createInitialMission(missionId, request.url, domain);
  missionStore.set(missionId, mission);

  const report = createMockReport(request.url, domain);
  reportStore.set(missionId, report);

  simulateMissionProgress(missionId);

  return { missionId, status: "started" };
}

export async function getMissionStatus(
  missionId: string
): Promise<MissionState | null> {
  return missionStore.get(missionId) ?? null;
}

export async function getReport(missionId: string): Promise<GhostReport | null> {
  return reportStore.get(missionId) ?? null;
}

function simulateMissionProgress(missionId: string): void {
  let stageIndex = 0;
  let progress = 0;

  const tick = () => {
    const mission = missionStore.get(missionId);
    if (!mission || mission.status !== "running") return;

    const stage = MISSION_STAGES[stageIndex];
    if (!stage) {
      mission.status = "complete";
      mission.currentStage = "generating";
      mission.stageProgress = 100;
      missionStore.set(missionId, { ...mission });
      return;
    }

    progress += 2;
    mission.currentStage = stage.id;
    mission.stageProgress = Math.min(progress, 100);

    if (stageIndex >= 3) {
      mission.personas = mission.personas.map((p, i) => ({
        ...p,
        progress: Math.min(
          100,
          (mission.stageProgress / 100) * 100 + i * 5
        ),
        thought: getPersonaThought(p.id, mission.stageProgress),
        location: getPersonaLocation(p.id, mission.stageProgress),
      }));
    }

    missionStore.set(missionId, { ...mission });

    if (progress >= 100) {
      stageIndex++;
      progress = 0;
    }

    if (stageIndex < MISSION_STAGES.length) {
      setTimeout(tick, stage.duration / 50);
    } else {
      mission.status = "complete";
      mission.stageProgress = 100;
      missionStore.set(missionId, { ...mission });
    }
  };

  setTimeout(tick, 100);
}

export type { AnalyzeResponse, MissionState, GhostReport };
