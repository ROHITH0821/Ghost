"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { GhostLogo } from "@/components/ui/GhostLogo";
import { copy } from "@/lib/copy";

const navItems = [
  { label: copy.nav.intelligence, href: "#mindset" },
  { label: copy.nav.howItWorks, href: "#program" },
  { label: copy.nav.personas, href: "#personas" },
  { label: copy.nav.faq, href: "#faq" },
] as const;

export function Header() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const bgOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const borderOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  return (
    <motion.header
      ref={ref}
      className="fixed top-0 right-0 left-0 z-50 section-pad"
    >
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-midnight/95 backdrop-blur-xl"
      />
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-x-0 bottom-0 h-px bg-border"
      />

      <div className="relative mx-auto flex h-16 max-w-[1400px] items-center md:h-20">
        <GhostLogo size="sm" />
        <nav className="ml-8 mr-auto hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-ghost-white/60 transition-colors hover:text-ghost-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* ml-auto keeps the menu right-aligned even when the nav is hidden
            on mobile (the nav's mr-auto disappears with it). */}
        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}
