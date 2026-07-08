import type { MissionStageInfo } from "./types";
import { copy, getMissionStages } from "./copy";

export const COLORS = {
  midnight: "#050510",
  navy: "#0B1020",
  ghostWhite: "#F8FAFC",
  violet: "#7C3AED",
  aiBlue: "#38BDF8",
  neonGreen: "#22C55E",
} as const;

export const MISSION_STAGES: MissionStageInfo[] = getMissionStages();

export const SEVERITY_CONFIG = {
  critical: {
    label: copy.severity.critical,
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
  },
  high: {
    label: copy.severity.high,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
  },
  medium: {
    label: copy.severity.medium,
    color: "#38BDF8",
    bg: "rgba(56, 189, 248, 0.1)",
    border: "rgba(56, 189, 248, 0.3)",
  },
  low: {
    label: copy.severity.low,
    color: "#A78BFA",
    bg: "rgba(167, 139, 250, 0.1)",
    border: "rgba(167, 139, 250, 0.3)",
  },
} as const;
