"use client";

import { motion } from "framer-motion";
import {
  ScrollReveal,
  SectionHeading,
  SectionLabel,
} from "@/components/ui/BRAVE";
import { copy } from "@/lib/copy";
import { EASE_SMOOTH } from "@/lib/motion";

const stepIds = ["scan", "deploy", "report"] as const;

export function ProgramSteps() {
  return (
    <section id="program" className="section-pad py-24 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel>{copy.landing.program.label}</SectionLabel>

        <SectionHeading size="lg" className="mb-16 md:mb-24">
          Shape of the <span className="text-gradient">system</span>
        </SectionHeading>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {copy.landing.program.steps.map((step, i) => (
            <ScrollReveal key={stepIds[i]} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.45, ease: EASE_SMOOTH }}
                className="brave-card brave-card-interactive group flex h-full flex-col p-8 md:p-10"
              >
                <span className="label-caps mb-6 text-violet-glow">
                  {copy.landing.program.stepPrefix(i + 1)}
                </span>
                <h3 className="font-heading text-4xl font-bold text-ghost-white md:text-5xl">
                  {step.title}
                </h3>
                <p className="mt-6 flex-1 text-sm leading-relaxed text-muted-light md:text-base">
                  {step.description}
                </p>
                <motion.div
                  className="mt-8 h-px w-full bg-border"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                  style={{ originX: 0 }}
                />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
