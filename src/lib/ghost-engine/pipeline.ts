import { analyzeFlows } from "./flows";
import { buildFlowRuns, runSwarm, type FlowRun } from "./swarm";
import { aggregate } from "./aggregate";
import { generateFixes } from "./fixes";
import { computeGhostScore, type GhostScore } from "./scoring";
import { MAX_FIXES } from "./config";
import {
  ContextPackSchema,
  type ContextPack,
  type CustomerFlow,
  type Fix,
  type GrowthLeakReport,
  type PersonaJourney,
} from "./types";

/**
 * The reusable core: Context Pack → flows → swarm → report → fixes.
 *
 * Presentation-free on purpose. The CLI (index.ts) and, later, an SSE endpoint
 * for the web UI both call this and just render the events + result differently.
 */

export interface AuditProgress {
  done: number;
  total: number;
}

export interface AuditEvents {
  /** Fired once, after Stage 1.5 decides the customer flows. */
  onFlows?: (flows: CustomerFlow[]) => void;
  /** Fired as each customer finishes, in completion order. */
  onCustomer?: (
    journey: PersonaJourney,
    run: FlowRun,
    progress: AuditProgress,
  ) => void;
  /** Fired once, when the swarm is done and aggregation begins. */
  onAggregateStart?: (journeys: PersonaJourney[]) => void;
  /** Fired once, when the Growth Leak Report + Ghost Score are ready (before any fixes). */
  onReport?: (report: GrowthLeakReport, score: GhostScore) => void;
  /** Fired once, when fix generation begins (with how many will run). */
  onFixesStart?: (count: number) => void;
  /** Fired as each fix lands. */
  onFix?: (fix: Fix, progress: AuditProgress) => void;
}

export interface AuditOptions {
  /** Generate Stage-4 fixes as part of the run. Set false to defer to a click. */
  withFixes?: boolean;
  /** How many top leaks to fix. Defaults to config MAX_FIXES. */
  maxFixes?: number;
}

export interface AuditResult {
  flows: CustomerFlow[];
  journeys: PersonaJourney[];
  report: GrowthLeakReport;
  score: GhostScore;
  fixes: Fix[];
}

export async function runAudit(
  contextPack: ContextPack,
  events: AuditEvents = {},
  options: AuditOptions = {},
): Promise<AuditResult> {
  const { withFixes = true, maxFixes = MAX_FIXES } = options;

  // Fail loudly on a malformed pack (important once a real crawler feeds this).
  const pack = ContextPackSchema.parse(contextPack);

  // Stage 1.5 — flows drive the swarm size.
  const flows = await analyzeFlows(pack);
  events.onFlows?.(flows);

  // Stage 2 — one independent customer per flow, in parallel.
  const runs = buildFlowRuns(flows);
  let done = 0;
  const journeys = await runSwarm(pack, runs, (journey, run) => {
    done += 1;
    events.onCustomer?.(journey, run, { done, total: runs.length });
  });

  if (journeys.length === 0) {
    throw new Error("No customers completed their journey — cannot aggregate.");
  }

  // Stage 3 — cluster into leaks, weighted by flow revenue.
  events.onAggregateStart?.(journeys);
  const report = await aggregate(pack, flows, journeys);
  const score = computeGhostScore(report);
  events.onReport?.(report, score);

  // Stage 4 — turn the worst leaks into ready-to-paste fixes.
  let fixes: Fix[] = [];
  if (withFixes) {
    const topLeaks = [...report.leaks]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, maxFixes);
    if (topLeaks.length > 0) {
      events.onFixesStart?.(topLeaks.length);
      let fixDone = 0;
      fixes = await generateFixes(pack, topLeaks, (fix) => {
        fixDone += 1;
        events.onFix?.(fix, { done: fixDone, total: topLeaks.length });
      });
    }
  }

  return { flows, journeys, report, score, fixes };
}
