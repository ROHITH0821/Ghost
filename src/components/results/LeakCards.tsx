"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Wrench } from "lucide-react";
import type { ConversionLeak } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/constants";
import { SectionHeading, SectionLabel } from "@/components/ui/BRAVE";
import { copy } from "@/lib/copy";

interface LeakCardsProps {
  leaks: ConversionLeak[];
}

export function LeakCards({ leaks }: LeakCardsProps) {
  return (
    <div>
      <SectionLabel>{copy.results.leaks.label}</SectionLabel>
      <div className="mb-10 flex items-end justify-between gap-4">
        <SectionHeading size="lg">
          Places customers <span className="text-gradient">ghost</span>
        </SectionHeading>
        <span className="shrink-0 text-sm text-muted">
          {copy.common.issuesCount(leaks.length)}
        </span>
      </div>

      <div className="space-y-4">
        {leaks.map((leak, index) => {
          const severity = SEVERITY_CONFIG[leak.severity];
          return (
            <motion.div
              key={leak.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="brave-card overflow-hidden"
                style={{ borderColor: severity.border }}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: severity.bg }}
                    >
                      <AlertTriangle
                        className="h-5 w-5"
                        style={{ color: severity.color }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-ghost-white md:text-xl">
                          {leak.title}
                        </h3>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: severity.bg,
                            color: severity.color,
                          }}
                        >
                          {severity.label}
                        </span>
                      </div>
                      <span className="mt-1 inline-block text-xs text-muted">
                        {leak.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-midnight/50 p-4">
                      <p className="label-caps mb-2">
                        {copy.results.leaks.whatsWrong}
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        {leak.whatIsWrong}
                      </p>
                    </div>
                    <div className="rounded-xl bg-midnight/50 p-4">
                      <p className="label-caps mb-2">
                        {copy.results.leaks.whyTheyGhost}
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        {leak.whyCustomersLeave}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                    <TrendingDown
                      className="h-4 w-4"
                      style={{ color: severity.color }}
                    />
                    {leak.impact}
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-neon-green/10 bg-neon-green/5 p-4">
                    <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-neon-green" />
                    <div>
                      <p className="label-caps mb-1 text-neon-green/70">
                        {copy.results.leaks.howToFix}
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        {leak.howToFix}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
