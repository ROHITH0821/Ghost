"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_SMOOTH, VIEWPORT_DEFAULT } from "@/lib/motion";

interface SectionHeadingProps {
  children: ReactNode;
  size?: "xl" | "lg";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}

/** Full phrase heading — animates as one block, no per-word line stacking */
export function SectionHeading({
  children,
  size = "lg",
  align = "left",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.2"],
  });
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -20]);

  const sizeClass = size === "xl" ? "display-xl" : "display-lg";

  return (
    <div
      ref={ref}
      className={cn(
        align === "center" && "text-center",
        className
      )}
    >
      <motion.div style={{ y }}>
        <Tag
          className={cn(
            sizeClass,
            "font-heading text-ghost-white will-change-transform"
          )}
        >
          <motion.span
            initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
            animate={
              isInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 32, filter: "blur(6px)" }
            }
            transition={{ duration: 0.8, ease: EASE_SMOOTH }}
            className="inline"
          >
            {children}
          </motion.span>
        </Tag>
      </motion.div>
    </div>
  );
}

/** @deprecated Use SectionHeading with natural phrases instead */
export function AnimatedWords({
  words,
  accentIndices = [],
  size = "lg",
  align = "left",
  className,
}: {
  words: string[];
  accentIndices?: number[];
  size?: "xl" | "lg";
  align?: "left" | "center";
  className?: string;
  parallax?: boolean;
}) {
  const text = words.join(" ");
  const accentSet = new Set(
    accentIndices.map((i) => words[i]?.toLowerCase()).filter(Boolean)
  );

  return (
    <SectionHeading size={size} align={align} className={className}>
      {words.map((word, i) => {
        const isAccent = accentSet.has(word.toLowerCase());
        return (
          <span key={`${word}-${i}`}>
            {i > 0 && " "}
            {isAccent ? (
              <span className="text-gradient">{word}</span>
            ) : (
              word
            )}
          </span>
        );
      })}
    </SectionHeading>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, VIEWPORT_DEFAULT);

  return (
    <motion.div ref={ref} className={cn("mb-6 overflow-hidden", className)}>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE_SMOOTH }}
        className="label-caps"
      >
        {children}
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE_SMOOTH }}
        className="accent-line mt-4 max-w-[120px] origin-left"
      />
    </motion.div>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const offsets = { up: { y: 48 }, left: { x: -48 }, right: { x: 48 } };

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction], filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={VIEWPORT_DEFAULT}
      transition={{ duration: 0.75, delay, ease: EASE_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function TextLink({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ x: 6 }}
      transition={{ duration: 0.3, ease: EASE_SMOOTH }}
      className={cn(
        "group inline-flex items-center gap-2 font-heading text-lg font-semibold text-ghost-white transition-colors hover:text-violet-glow disabled:opacity-40 sm:text-xl",
        className
      )}
    >
      {children}
      <span className="text-violet-glow transition-transform group-hover:translate-x-1">
        ›
      </span>
    </motion.button>
  );
}

export const SplitHeading = SectionHeading;
