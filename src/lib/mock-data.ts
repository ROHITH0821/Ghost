import type {
  GhostReport,
  MissionState,
  ShopperPersona,
} from "./types";
import { copy } from "./copy";

export function createPersonas(): ShopperPersona[] {
  return copy.personas.defaults.map((p) => ({
    ...p,
    color:
      p.id === "budget-buyer"
        ? "#38BDF8"
        : p.id === "first-time"
          ? "#A78BFA"
          : p.id === "premium"
            ? "#7C3AED"
            : p.id === "busy"
              ? "#22C55E"
              : "#F59E0B",
    progress: 0,
  }));
}

export function createMockReport(url: string, domain: string): GhostReport {
  return {
    id: `report-${Date.now()}`,
    url,
    domain,
    score: 62,
    scannedAt: new Date().toISOString(),
    businessUnderstanding: {
      ...copy.mock.businessUnderstanding,
      customerExpectations: [
        ...copy.mock.businessUnderstanding.customerExpectations,
      ],
    },
    journey: copy.mock.journey.map((step) => ({ ...step })),
    leaks: copy.mock.leaks.map((leak) => ({ ...leak })),
    fixes: copy.mock.fixes.map((fix) => ({ ...fix })),
  };
}

export function createInitialMission(
  id: string,
  url: string,
  domain: string
): MissionState {
  return {
    id,
    url,
    domain,
    status: "running",
    currentStage: "opening",
    stageProgress: 0,
    personas: createPersonas(),
    startedAt: new Date().toISOString(),
  };
}
