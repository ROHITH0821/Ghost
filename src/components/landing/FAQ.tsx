"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollReveal,
  SectionHeading,
  SectionLabel,
} from "@/components/ui/BRAVE";
import { copy } from "@/lib/copy";
import { EASE_SMOOTH } from "@/lib/motion";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad py-24 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>{copy.landing.faq.label}</SectionLabel>
            <SectionHeading size="lg">
              Got <span className="text-gradient">{copy.landing.faq.headingAccent}</span>
            </SectionHeading>
          </div>

          <div className="divide-y divide-border">
            {copy.landing.faq.items.map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 0.06}>
                <div className="py-6">
                  <button
                    type="button"
                    onClick={() => setOpen(open === i ? null : i)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <span className="font-heading text-base font-semibold text-ghost-white sm:text-lg">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: open === i ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                      className="mt-1 shrink-0 text-xl text-muted"
                    >
                      {copy.landing.faq.expandIcon}
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE_SMOOTH }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 text-sm leading-relaxed text-muted-light">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
