"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Users } from "lucide-react";
import type { JourneyStep } from "@/lib/types";
import { ScrollReveal, SectionHeading, SectionLabel } from "@/components/ui/BRAVE";
import { copy } from "@/lib/copy";

interface JourneyMapProps {
  steps: JourneyStep[];
}

export function JourneyMap({ steps }: JourneyMapProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div>
      <SectionLabel>{copy.results.journey.label}</SectionLabel>
      <SectionHeading size="lg" className="mb-10">
        Where customers <span className="text-gradient">ghost</span>
      </SectionHeading>

      <ScrollReveal>
        <div className="brave-card overflow-hidden p-6 sm:p-8">
          <div className="hidden md:block">
            <div className="relative flex items-start justify-between">
              <div className="absolute top-8 right-8 left-8 h-px bg-border" />

              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-1 flex-col items-center"
                  onMouseEnter={() => setActiveStep(step.id)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors ${
                      step.hasLeak
                        ? "border-danger/40 bg-danger/10"
                        : "border-border bg-surface"
                    }`}
                  >
                    {step.hasLeak ? (
                      <AlertTriangle className="h-5 w-5 text-danger" />
                    ) : (
                      <Users className="h-5 w-5 text-violet-glow" />
                    )}
                  </div>

                  <p className="mt-3 text-center text-sm font-semibold text-ghost-white">
                    {step.label}
                  </p>
                  <p className="mt-1 max-w-[120px] text-center text-xs text-muted">
                    {step.description}
                  </p>

                  {step.dropOffRate && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        step.hasLeak ? "text-danger" : "text-muted"
                      }`}
                    >
                      {copy.common.dropOffRate(step.dropOffRate)}
                    </p>
                  )}

                  <AnimatePresence>
                    {activeStep === step.id && step.hasLeak && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full z-20 mt-2 w-48 rounded-xl border border-border bg-surface p-3 text-xs text-muted shadow-xl"
                      >
                        <p className="font-medium text-danger">
                          {copy.results.journey.conversionLeak}
                        </p>
                        <p className="mt-1">{step.leakReason}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {index < steps.length - 1 && (
                    <span className="absolute -right-2 top-6 text-muted">
                      {copy.common.chevron}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-0 md:hidden">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      step.hasLeak
                        ? "border-danger/40 bg-danger/10"
                        : "border-border bg-surface"
                    }`}
                  >
                    {step.hasLeak ? (
                      <AlertTriangle className="h-4 w-4 text-danger" />
                    ) : (
                      <Users className="h-4 w-4 text-violet-glow" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="my-1 h-8 w-px bg-border" />
                  )}
                </div>

                <div className="flex-1 pb-6">
                  <p className="text-sm font-semibold text-ghost-white">
                    {step.label}
                  </p>
                  <p className="text-xs text-muted">{step.description}</p>
                  {step.dropOffRate && (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        step.hasLeak ? "text-danger" : "text-muted"
                      }`}
                    >
                      {copy.common.dropOffRate(step.dropOffRate)}
                      {step.hasLeak &&
                        `${copy.results.journey.stepSeparator}${step.leakReason}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
