/**
 * Maps the engine's output (AuditResult + ContextPack) onto the UI's GhostReport
 * contract (@/lib/types). This is the seam between the backend engine and the
 * frontend — keep the engine pure and do all shape translation here.
 */

import type {
  AIFix,
  BusinessUnderstanding,
  ConversionLeak,
  GhostReport,
  JourneyStep,
  Severity,
} from "@/lib/types";

import type { AuditResult } from "./pipeline";
import type { ContextPack, FixType, PersonaJourney } from "./types";

const FIX_META: Record<FixType, { icon: string; category: string }> = {
  price_card: { icon: "💰", category: "Price Card" },
  whatsapp_autoreply: { icon: "💬", category: "WhatsApp Reply" },
  review_request: { icon: "⭐", category: "Reviews" },
  bio_rewrite: { icon: "✍️", category: "Bio Rewrite" },
  faq: { icon: "❓", category: "FAQ" },
  winback_offer: { icon: "🎁", category: "Win-back" },
  trust_block: { icon: "🛡️", category: "Trust Block" },
  other: { icon: "🔧", category: "Fix" },
};

function toSeverity(avg: number): Severity {
  if (avg >= 4.5) return "critical";
  if (avg >= 3.5) return "high";
  if (avg >= 2.5) return "medium";
  return "low";
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

function hasLocation(loc: string): boolean {
  return !!loc && !/not stated|unknown|n\/?a/i.test(loc);
}

function businessUnderstanding(
  pack: ContextPack,
  result: AuditResult,
): BusinessUnderstanding {
  const { business } = pack;
  const topFlow = result.flows[0];

  return {
    businessType: hasLocation(business.location)
      ? `${business.type} — ${business.location}`
      : business.type,
    targetAudience: hasLocation(business.location)
      ? `Customers in and around ${business.location} looking for ${business.type}`
      : `Online visitors and prospects seeking ${business.type}`,
    primaryGoal: topFlow
      ? truncate(topFlow.goal, 140)
      : "Convert interested visitors into paying customers",
    // The distinct journeys customers expect to be able to complete.
    customerExpectations: result.flows.slice(0, 6).map((f) => f.name),
  };
}

function journey(result: AuditResult): JourneyStep[] {
  const byFlow = new Map<string, PersonaJourney>(
    result.journeys.map((j) => [j.flow_id, j]),
  );

  // Top flows by revenue weight become the customer-journey steps.
  return result.flows.slice(0, 5).map((flow) => {
    const j = byFlow.get(flow.id);
    const hasLeak = j ? j.outcome !== "completed" : false;
    const dropOffRate =
      hasLeak && j ? Math.min(95, Math.max(20, Math.round(j.severity * 18))) : undefined;

    return {
      id: flow.id,
      label: truncate(flow.name, 26),
      description: truncate(flow.goal, 64),
      hasLeak,
      leakReason: hasLeak && j ? truncate(j.verbatim_complaint, 150) : undefined,
      dropOffRate,
    };
  });
}

function leaks(result: AuditResult): ConversionLeak[] {
  const total = Math.max(1, result.report.funnel.total_shoppers);
  const fixByRank = new Map(result.fixes.map((f) => [f.leak_rank, f]));

  return result.report.leaks.map((leak) => {
    const fix = fixByRank.get(leak.rank);
    return {
      id: `leak-${leak.rank}`,
      title: leak.category,
      severity: toSeverity(leak.severity_avg),
      whatIsWrong: leak.why_it_matters,
      whyCustomersLeave:
        leak.best_quotes[0] ?? "Customers hesitate or leave at this point.",
      impact: `${leak.personas_affected} of ${total} shoppers dropped off here (severity ${leak.severity_avg.toFixed(1)}/5).`,
      howToFix: fix ? fix.rationale : "See the Growth Kit below for a ready-to-paste fix.",
      category: leak.page,
      // Full paste-ready fix, revealed in the How-to-fix dropdown.
      fix: fix
        ? { title: fix.title, content: fix.variants.join("\n\n———\n\n") }
        : undefined,
    };
  });
}

function fixes(result: AuditResult): AIFix[] {
  return result.fixes.map((fix, i) => {
    const meta = FIX_META[fix.fix_type] ?? FIX_META.other;
    return {
      id: `fix-${i + 1}`,
      category: meta.category,
      title: fix.title,
      description: fix.rationale,
      content: fix.variants.join("\n\n———\n\n"),
      icon: meta.icon,
    };
  });
}

const LOW_CONFIDENCE_NOTE =
  "This site is heavily JavaScript-rendered, so our crawler — like search engines and visitors on slow connections — couldn't read much of its content. These results reflect what those non-JavaScript visitors experience; if products and prices load fine in your own browser, treat the score as a crawlability/SEO signal rather than a verdict on the whole site.";

/** Transform the engine output into the UI's GhostReport. */
export function toGhostReport(
  id: string,
  url: string,
  domain: string,
  pack: ContextPack,
  result: AuditResult,
  meta: { lowConfidence?: boolean } = {},
): GhostReport {
  return {
    id,
    url,
    domain,
    score: result.score.value,
    scannedAt: new Date().toISOString(),
    businessUnderstanding: businessUnderstanding(pack, result),
    journey: journey(result),
    leaks: leaks(result),
    fixes: fixes(result),
    lowConfidence: meta.lowConfidence || undefined,
    confidenceNote: meta.lowConfidence ? LOW_CONFIDENCE_NOTE : undefined,
  };
}
