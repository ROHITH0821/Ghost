"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import type { AIFix } from "@/lib/types";
import { TypingText } from "@/components/ui/TypingText";
import { SectionHeading, SectionLabel } from "@/components/ui/BRAVE";
import { copy } from "@/lib/copy";

interface FixCenterProps {
  fixes: AIFix[];
}

export function FixCenter({ fixes }: FixCenterProps) {
  const [activeFix, setActiveFix] = useState<string>(fixes[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const [showTyping, setShowTyping] = useState(true);

  const currentFix = fixes.find((f) => f.id === activeFix);

  const handleCopy = async () => {
    if (!currentFix) return;
    await navigator.clipboard.writeText(currentFix.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (id: string) => {
    setActiveFix(id);
    setShowTyping(false);
    setTimeout(() => setShowTyping(true), 50);
  };

  return (
    <div>
      <SectionLabel>{copy.results.growthKit.label}</SectionLabel>
      <SectionHeading size="lg" className="mb-10">
        {copy.results.growthKit.heading}{" "}
        <span className="text-gradient">{copy.results.growthKit.headingAccent}</span>
      </SectionHeading>

      <div className="brave-card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border scrollbar-none">
          {fixes.map((fix) => (
            <button
              key={fix.id}
              type="button"
              onClick={() => handleTabChange(fix.id)}
              className={`shrink-0 px-5 py-4 text-xs font-medium transition-colors sm:px-6 sm:text-sm ${
                activeFix === fix.id
                  ? "border-b-2 border-violet text-ghost-white"
                  : "text-muted hover:text-ghost-white/70"
              }`}
            >
              <span className="mr-1.5">{fix.icon}</span>
              {fix.category}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {currentFix && (
              <motion.div
                key={currentFix.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-ghost-white md:text-2xl">
                      {currentFix.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {currentFix.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-violet/30 hover:text-ghost-white"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-neon-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? copy.common.copied : copy.common.copy}
                  </button>
                </div>

                <div className="rounded-xl bg-midnight p-5 font-mono text-sm leading-relaxed">
                  <pre className="whitespace-pre-wrap text-muted">
                    {showTyping ? (
                      <TypingText
                        text={currentFix.content}
                        speed={8}
                        showCursor={true}
                      />
                    ) : (
                      currentFix.content
                    )}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
