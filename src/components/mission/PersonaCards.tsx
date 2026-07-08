"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ShopperPersona } from "@/lib/types";
import { TypingText } from "@/components/ui/TypingText";
import { copy } from "@/lib/copy";

interface PersonaCardsProps {
  personas: ShopperPersona[];
  show: boolean;
}

export function PersonaCards({ personas, show }: PersonaCardsProps) {
  if (!show) return null;

  return (
    <div className="space-y-3">
      <p className="label-caps mb-4">{copy.mission.shoppersActive}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence>
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
            >
              <div className="brave-card relative overflow-hidden p-4">
                <div
                  className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent"
                  style={{ color: persona.color, width: `${persona.progress}%` }}
                />

                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${persona.color}15` }}
                  >
                    {persona.avatar}
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-ghost-white truncate">
                        {persona.name}
                      </h4>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: persona.color }}
                      />
                    </div>
                    <p className="text-xs text-ghost-white/40">
                      {persona.status}
                    </p>
                    <p className="mt-1 text-xs text-ghost-white/25">
                      {copy.common.locationPrefix}
                      {persona.location}
                    </p>

                    <div className="mt-2 rounded-lg bg-midnight/50 p-2">
                      <p className="text-xs text-ghost-white/50 italic leading-relaxed">
                        &ldquo;
                        <TypingText
                          text={persona.thought}
                          speed={25}
                          showCursor={false}
                        />
                        &rdquo;
                      </p>
                    </div>

                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-navy-light">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: persona.color }}
                        animate={{ width: `${persona.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
