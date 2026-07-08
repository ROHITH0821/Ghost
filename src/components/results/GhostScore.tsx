"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { copy, getScoreLabel } from "@/lib/copy";

interface GhostScoreProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 95) return "#22C55E";
  if (score >= 85) return "#38BDF8";
  if (score >= 70) return "#A78BFA";
  if (score >= 55) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

export function GhostScore({ score }: GhostScoreProps) {
  const [animated, setAnimated] = useState(false);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const strokeDashoffset = animated
    ? circumference - (score / 100) * circumference
    : circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ backgroundColor: `${color}20` }}
        />

        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="relative -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(124, 58, 237, 0.1)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: [0.25, 0.4, 0.25, 1] }}
            style={{
              filter: `drop-shadow(0 0 10px ${color}60)`,
            }}
          />
          {/* Tick marks */}
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * 360;
            const rad = (angle * Math.PI) / 180;
            const x1 = 110 + (radius - 15) * Math.cos(rad);
            const y1 = 110 + (radius - 15) * Math.sin(rad);
            const x2 = 110 + (radius - 10) * Math.cos(rad);
            const y2 = 110 + (radius - 10) * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(248, 250, 252, 0.1)"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber
            value={score}
            className="font-heading text-5xl font-bold md:text-6xl"
            duration={2}
          />
          <span className="mt-1 text-sm text-ghost-white/40">
            {copy.common.scoreOutOf}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-4 text-center"
      >
        <p className="font-heading text-lg font-semibold" style={{ color }}>
          {getScoreLabel(score)}
        </p>
        <p className="mt-1 text-sm text-ghost-white/40">
          {copy.results.ghostScore}
        </p>
      </motion.div>
    </div>
  );
}
