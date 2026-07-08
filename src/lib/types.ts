export type Severity = "critical" | "high" | "medium" | "low";

export type MissionStage =
  | "opening"
  | "understanding"
  | "personas"
  | "deploying"
  | "testing"
  | "leaks"
  | "generating";

export type MissionStageStatus = "pending" | "active" | "complete";

export interface MissionStageInfo {
  id: MissionStage;
  label: string;
  description: string;
  duration: number;
}

export interface ShopperPersona {
  id: string;
  name: string;
  type: string;
  avatar: string;
  color: string;
  status: string;
  thought: string;
  location: string;
  progress: number;
}

export interface BusinessUnderstanding {
  businessType: string;
  targetAudience: string;
  primaryGoal: string;
  customerExpectations: string[];
}

export interface JourneyStep {
  id: string;
  label: string;
  description: string;
  dropOffRate?: number;
  hasLeak?: boolean;
  leakReason?: string;
}

export interface ConversionLeak {
  id: string;
  title: string;
  severity: Severity;
  whatIsWrong: string;
  whyCustomersLeave: string;
  impact: string;
  howToFix: string;
  category: string;
  /** The full ready-to-paste fix for this leak, revealed in the How-to-fix dropdown. */
  fix?: { title: string; content: string };
}

export interface AIFix {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  icon: string;
}

export interface GhostReport {
  id: string;
  url: string;
  domain: string;
  score: number;
  scannedAt: string;
  businessUnderstanding: BusinessUnderstanding;
  journey: JourneyStep[];
  leaks: ConversionLeak[];
  fixes: AIFix[];
  /** True when the crawl couldn't read much of the site (heavy JS / blocked). */
  lowConfidence?: boolean;
  /** Shown as a banner when lowConfidence — explains the caveat to the owner. */
  confidenceNote?: string;
}

export interface MissionState {
  id: string;
  url: string;
  domain: string;
  status: "running" | "complete" | "error";
  currentStage: MissionStage;
  stageProgress: number;
  personas: ShopperPersona[];
  startedAt: string;
  /** Human-readable reason, set when status is "error". */
  error?: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  missionId: string;
  status: "started";
}

export interface MissionStatusResponse {
  mission: MissionState;
}

export interface ReportResponse {
  report: GhostReport;
}
