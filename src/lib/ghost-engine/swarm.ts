import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { anthropic } from "./client";
import { MODEL, MAX_TOKENS_PERSONA, SWARM_CONCURRENCY } from "./config";
import { mapWithConcurrency } from "./util";
import { archetypeById, type Archetype } from "./archetypes";
import {
  PersonaJourneySchema,
  type ContextPack,
  type CustomerFlow,
  type PersonaJourney,
} from "./types";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Stage 2 — the persona swarm, flow-driven and concurrency-bounded.
 *
 * One real LLM call per FLOW: the flow's best-fit archetype (identity) is paired
 * with the flow's concrete goal, and that persona walks the Context Pack. Swarm
 * size therefore equals the number of flows discovered in Stage 1.5.
 *
 * Two cost/robustness measures:
 *  - The anti-generic rules + Context Pack are byte-identical for every shopper
 *    in a run, so they live in a single cache_control system block — a cached
 *    prefix that later batches (and re-runs within the TTL) read at ~0.1x.
 *  - Calls run through a bounded pool (SWARM_CONCURRENCY) rather than all at
 *    once, so an uncapped flow count can't spike rate limits.
 *
 * THE ANTI-GENERIC RULE is enforced hard. "Add prices" is a failing output.
 * "Your Services page lists 11 services and prices only 3 — I wanted bridal" passes.
 */

const ANTI_GENERIC_RULES = `
You are role-playing a specific shopper walking a specific small business's online presence.
You are given a Context Pack: a structured description of exactly what that business's
website shows, page by page, including what a real visitor SEES (visual hierarchy),
what prices are visible, how they can contact/book, and what trust signals exist.

Walk the site as your persona, pursuing your goal. Be honest about where you would
give up, hesitate, or succeed — real customers leave silently, so channel that.

ABSOLUTE REQUIREMENTS for your output (these make or break the result):
1. Every observation and your verbatim_complaint MUST quote specific things from the
   Context Pack: actual page names, actual button/CTA text, actual missing elements,
   actual counts ("3 of 11 services priced").
2. NEVER give generic advice. "Add prices" / "improve the website" / "make it faster"
   are FORBIDDEN and count as failures. Instead: name what YOU wanted, what the page
   actually showed, and what you did as a result.
3. verbatim_complaint must sound like a real person talking, and must be specific
   enough that the owner could not have written it about any other website.
4. Only mark outcome "completed" if this persona could genuinely finish their goal
   with what the site provides. If a required step is missing (e.g. no price for the
   service they wanted, no way to reach a human), they abandon or hesitate — say why.
5. severity: 5 = you definitely left and booked a competitor; 1 = mild friction you
   pushed through.

Good verbatim_complaint (site-specific):
"Your Services page lists bridal makeup but just says 'Contact for quote'. I'm not
messaging a stranger to find out if I can afford my own wedding. The salon next door
showed ₹8,000 so I booked them."

Bad verbatim_complaint (generic — never do this):
"The website should show more pricing information and be easier to use."
`.trim();

/** A resolved (flow + archetype) pairing that a single swarm shopper runs. */
export interface FlowRun {
  flow: CustomerFlow;
  archetype: Archetype;
}

/** Pair each flow with its archetype identity, ready to run. */
export function buildFlowRuns(flows: CustomerFlow[]): FlowRun[] {
  return flows.map((flow) => {
    const archetype =
      archetypeById.get(flow.archetype_id) ?? archetypeById.get("generic_shopper")!;
    return { flow, archetype };
  });
}

/** Byte-identical stable prefix shared by every shopper this run (cacheable). */
function stablePrefix(contextPack: ContextPack): string {
  return `${ANTI_GENERIC_RULES}

BUSINESS CONTEXT PACK (identical for every shopper this run):
${JSON.stringify(contextPack, null, 2)}`;
}

async function runFlow(
  run: FlowRun,
  cachedPrefix: string,
): Promise<PersonaJourney> {
  const { flow, archetype } = run;

  const personaBlock = `YOU ARE: ${archetype.name}
${archetype.identity}

THE CUSTOMER FLOW YOU ARE EXERCISING: ${flow.name}
YOUR GOAL FOR THIS VISIT: ${flow.goal}`;

  const response = await withTimeout(
    anthropic().messages.parse({
      model: MODEL,
      max_tokens: MAX_TOKENS_PERSONA,
      system: [
        // Stable across all shoppers → cached prefix (~0.1x on reads).
        { type: "text", text: cachedPrefix, cache_control: { type: "ephemeral" } },
        // Varies per shopper → full price, but small.
        { type: "text", text: personaBlock },
      ],
      messages: [
        {
          role: "user",
          content: `Walk this business's online presence as yourself, chasing your goal.
Then report your journey, where (if anywhere) you dropped off, and your verbatim
complaint. Set "persona" to "${archetype.id}" and "flow_id" to "${flow.id}".`,
        },
      ],
      output_config: { format: zodOutputFormat(PersonaJourneySchema) },
    }),
    90_000,
    `Persona run for flow ${flow.id}`,
  );

  const journey = response.parsed_output;
  if (!journey) {
    throw new Error(
      `Flow ${flow.id} returned no parseable journey (stop_reason=${response.stop_reason})`,
    );
  }
  // Force ids to our canonical values regardless of what the model echoed.
  return { ...journey, persona: archetype.id, flow_id: flow.id };
}

/**
 * Run one persona per flow through a bounded pool. `onReport` fires as each one
 * lands, so the caller can stream results (the SSE-to-speech-bubbles moment in
 * the real UI). A single shopper failing does not kill the swarm.
 */
export async function runSwarm(
  contextPack: ContextPack,
  runs: FlowRun[],
  onReport?: (journey: PersonaJourney, run: FlowRun) => void,
): Promise<PersonaJourney[]> {
  const cachedPrefix = stablePrefix(contextPack);

  const settled = await mapWithConcurrency(runs, SWARM_CONCURRENCY, async (run) => {
    const journey = await runFlow(run, cachedPrefix);
    onReport?.(journey, run);
    return journey;
  });

  const journeys: PersonaJourney[] = [];
  settled.forEach((result, i) => {
    if (result.status === "fulfilled") {
      journeys.push(result.value);
    } else {
      console.error(
        `  ⚠ flow ${runs[i].flow.id} failed: ${String(result.reason).slice(0, 120)}`,
      );
    }
  });
  return journeys;
}
