import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { anthropic } from "./client";
import { MODEL, MAX_TOKENS_REPORT } from "./config";
import {
  GrowthLeakReportSchema,
  type ContextPack,
  type CustomerFlow,
  type GrowthLeakReport,
  type PersonaJourney,
} from "./types";

/**
 * Stage 3 — aggregation into the Growth Leak Report.
 *
 * One LLM call takes the customer flows and the persona journeys, clusters the
 * drop-offs, ranks leaks by (personas hit × severity × the revenue_weight of the
 * flow they were on), and produces a revenue estimate WITH VISIBLE ASSUMPTIONS
 * (judges probe the number — an estimate with shown reasoning survives; a naked
 * "₹40,000!" doesn't).
 */

const AGGREGATION_SYSTEM = `
You are the analyst that turns a swarm of AI-shopper journeys into a Growth Leak Report
for a non-technical small business owner.

You are given: the business's Context Pack, the CUSTOMER FLOWS we identified for it (each
with a revenue_weight), and the journeys of the AI shoppers — one shopper per flow. Your job:

1. Cluster the drop-offs into distinct LEAKS. A leak is a specific place/reason shoppers
   gave up or hesitated. Rank leaks by (how many shoppers hit it) × (severity) × (the
   revenue_weight of the flows involved) — a leak on a weight-5 flow matters far more than
   the same leak on a weight-1 flow.
2. For each leak, cite the PAGE it happens on and pull the 1-3 best VERBATIM quotes from
   the actual shopper complaints — do not paraphrase into generic advice.
3. Build a simple funnel: of the shoppers who walked in, how many would have bought vs
   abandoned (base this on their actual outcomes).
4. Produce a revenue estimate as a RANGE with EXPLICIT, VISIBLE ASSUMPTIONS. State the
   assumed monthly visitors for a business of this type/size, the abandonment rate you
   observed in the swarm, the average ticket you assumed, and how the high-revenue-weight
   flows shaped the number. The owner and any skeptical judge must be able to follow the
   arithmetic. Use ₹ (INR).
5. Write a headline the owner reads first — concrete, e.g.
   "You're losing ~40% of interested customers at 3 points — roughly ₹18,000-25,000/month."

Do not invent leaks the shoppers didn't actually report. Ground everything in the journeys.
`.trim();

export async function aggregate(
  contextPack: ContextPack,
  flows: CustomerFlow[],
  journeys: PersonaJourney[],
): Promise<GrowthLeakReport> {
  const userContent = `BUSINESS CONTEXT PACK:
${JSON.stringify(contextPack, null, 2)}

CUSTOMER FLOWS (${flows.length}, each with revenue_weight):
${JSON.stringify(flows, null, 2)}

AI-SHOPPER JOURNEYS (${journeys.length} shoppers, one per flow):
${JSON.stringify(journeys, null, 2)}

Produce the Growth Leak Report. Rank the leaks weighted by flow revenue_weight, attach
real verbatim quotes, build the funnel from the actual outcomes, and give a revenue range
with visible assumptions.`;

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: MAX_TOKENS_REPORT,
    system: AGGREGATION_SYSTEM,
    messages: [{ role: "user", content: userContent }],
    output_config: { format: zodOutputFormat(GrowthLeakReportSchema) },
  });

  const report = response.parsed_output;
  if (!report) {
    // Surface WHY it failed instead of a bare null — usually max_tokens truncation.
    const rawText = response.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("");
    throw new Error(
      `Aggregation returned no parseable report (stop_reason=${response.stop_reason}). ` +
        `Raw output was ${rawText.length} chars. Preview: ${rawText.slice(0, 300)}`,
    );
  }
  return report;
}
