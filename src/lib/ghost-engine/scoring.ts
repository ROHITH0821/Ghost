import type { GrowthLeakReport } from "./types";

/**
 * The Ghost Score — one headline number (0-100) for the whole business.
 *
 * Deterministic on purpose: computed in code from the report, not asked of the
 * model. That makes it reproducible run-to-run and defensible ("half from how
 * many shopper journeys succeeded, half from how severe the leaks are") rather
 * than a number a judge can poke holes in.
 *
 * Higher = healthier. A leaky store scores low — which is the point.
 */

export type GhostBand = "Critical" | "Poor" | "Fair" | "Good" | "Excellent";

export interface GhostScore {
  value: number; // 0-100
  band: GhostBand;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function scoreBand(value: number): GhostBand {
  if (value < 25) return "Critical";
  if (value < 45) return "Poor";
  if (value < 65) return "Fair";
  if (value < 85) return "Good";
  return "Excellent";
}

export function computeGhostScore(report: GrowthLeakReport): GhostScore {
  const { funnel, leaks } = report;

  const total = Math.max(1, funnel.total_shoppers);
  // How many shopper journeys actually succeeded.
  const passRate = clamp01(funnel.would_have_bought / total);
  // How mild the leaks are (severity is 1-5; higher severity = less health).
  const avgSeverity =
    leaks.length > 0 ? leaks.reduce((s, l) => s + l.severity_avg, 0) / leaks.length : 0;
  const severityHealth = clamp01(1 - avgSeverity / 5);

  const value = Math.round(100 * (0.5 * passRate + 0.5 * severityHealth));
  const clamped = Math.min(100, Math.max(0, value));
  return { value: clamped, band: scoreBand(clamped) };
}
