/**
 * API client layer — now backed by the real GHOST engine.
 *
 * POST /api/analyze      → startGhostMission()  (kicks off the real audit)
 * GET  /api/analyze?...  → getMissionStatus()   (live scan progress)
 * GET  /api/reports/:id  → getReport()          (final GhostReport)
 *
 * The audit runs in the background (fire-and-forget) and streams progress into
 * an in-memory mission store that the scan animation polls; the finished report
 * is mapped to the UI's GhostReport shape and cached by missionId.
 */

import { createInitialMission } from "../mock-data";
import { getPersonaThought, getPersonaLocation } from "../copy";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  GhostReport,
  MissionStage,
  MissionState,
} from "../types";
import { extractDomain } from "../utils";

import {
  getMissionReportFromDb,
  persistMissionError,
  persistMissionReport,
} from "../db/missions";
import { ingestUrl } from "../ghost-engine/ingest";
import { runAudit } from "../ghost-engine/pipeline";
import { toGhostReport } from "../ghost-engine/adapter";

const missionStore = new Map<string, MissionState>();
const reportStore = new Map<string, GhostReport>();
/** missionId → homepage screenshot (data URI) captured during the crawl. */
const previewStore = new Map<string, string>();

export async function startGhostMission(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const domain = extractDomain(request.url);
  const missionId = `mission-${Date.now().toString(36)}`;

  missionStore.set(missionId, createInitialMission(missionId, request.url, domain));

  // Run the real audit in the background; the client polls mission status.
  void runRealAudit(missionId, request.url, domain);

  return { missionId, status: "started" };
}

export async function getMissionStatus(
  missionId: string
): Promise<MissionState | null> {
  return missionStore.get(missionId) ?? null;
}

export async function getReport(missionId: string): Promise<GhostReport | null> {
  const cached = reportStore.get(missionId);
  if (cached) return cached;

  try {
    const persisted = await getMissionReportFromDb(missionId);
    if (persisted) {
      reportStore.set(missionId, persisted);
      return persisted;
    }
  } catch (error) {
    console.error("[ghost-api] report load from db failed:", error);
  }

  return null;
}

/** Homepage screenshot (data URI) for the scan animation, once the crawl runs. */
export function getMissionPreview(missionId: string): string | null {
  return previewStore.get(missionId) ?? null;
}

// --- internals --------------------------------------------------------------

function patchMission(missionId: string, patch: Partial<MissionState>): void {
  const current = missionStore.get(missionId);
  if (!current) return;
  missionStore.set(missionId, { ...current, ...patch });
}

function setStage(missionId: string, stage: MissionStage, progress: number): void {
  patchMission(missionId, {
    currentStage: stage,
    stageProgress: Math.min(100, Math.max(0, Math.round(progress))),
  });
}

/** Advance the on-screen shopper personas as the swarm reports in. */
function advancePersonas(missionId: string, pct: number): void {
  const mission = missionStore.get(missionId);
  if (!mission) return;
  const personas = mission.personas.map((p, i) => ({
    ...p,
    progress: Math.min(100, Math.round(pct) + i * 4),
    thought: getPersonaThought(p.id, pct),
    location: getPersonaLocation(p.id, pct),
  }));
  patchMission(missionId, { personas });
}

async function runRealAudit(
  missionId: string,
  url: string,
  domain: string
): Promise<void> {
  try {
    // Stage 1 → 1.4: crawl + synthesize the Context Pack.
    setStage(missionId, "understanding", 15);
    const pack = await ingestUrl(url, {
      onCrawled: (crawl) => {
        // Surface the real homepage screenshot so the scan shows the actual site.
        const shot = crawl.pages.find((p) => p.screenshotB64)?.screenshotB64;
        if (shot) previewStore.set(missionId, `data:image/png;base64,${shot}`);
        setStage(missionId, "understanding", 100);
      },
    });

    // Stages 1.5 → 4: flows, swarm, report, fixes.
    const result = await runAudit(pack, {
      onFlows: () => setStage(missionId, "personas", 100),
      onCustomer: (_journey, _run, progress) => {
        const pct = (progress.done / progress.total) * 100;
        setStage(missionId, "testing", pct);
        advancePersonas(missionId, pct);
      },
      onAggregateStart: () => setStage(missionId, "leaks", 40),
      onReport: () => setStage(missionId, "leaks", 100),
      onFixesStart: () => setStage(missionId, "generating", 20),
      onFix: (_fix, progress) =>
        setStage(missionId, "generating", (progress.done / progress.total) * 100),
    });

    const report = toGhostReport(missionId, url, domain, pack, result);
    reportStore.set(missionId, report);

    try {
      await persistMissionReport(missionId, report);
    } catch (dbError) {
      console.error("[ghost-audit] mission report persist failed:", dbError);
    }

    patchMission(missionId, {
      status: "complete",
      currentStage: "generating",
      stageProgress: 100,
    });
  } catch (error) {
    console.error("[ghost-audit]", error);
    const message = friendlyError(error);
    patchMission(missionId, { status: "error", error: message });

    try {
      await persistMissionError(missionId, message);
    } catch (dbError) {
      console.error("[ghost-audit] mission error persist failed:", dbError);
    }
  }
}

/** Turn an engine/crawl error into a message safe to show a non-technical user. */
function friendlyError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);

  if (/Could not resolve host|ENOTFOUND|getaddrinfo/i.test(raw)) {
    return "We couldn't reach that website — check the URL is spelled correctly and the site is live.";
  }
  if (/private\/internal address|Unsupported URL scheme|Invalid URL/i.test(raw)) {
    return "That address can't be scanned. Please enter a public website URL (https://…).";
  }
  if (/no usable pages/i.test(raw)) {
    return "We reached the site but couldn't read any content from it. It may block automated visitors.";
  }
  if (/api key|authentication|ANTHROPIC_API_KEY|401/i.test(raw)) {
    return "The audit service isn't configured correctly. Please try again shortly.";
  }
  return "Something went wrong while auditing this site. Please try again.";
}

export type { AnalyzeResponse, MissionState, GhostReport };
