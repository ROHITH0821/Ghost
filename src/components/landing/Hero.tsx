"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { EASE_SMOOTH } from "@/lib/motion";
import { copy } from "@/lib/copy";
import { redirectToLogin } from "@/lib/auth/redirect-to-login";

export function Hero() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Keep the GHOST title pinned relative to the viewport by translating it down as we scroll
  const yTitle = scrollY;
  
  // Smooth opacity and scale decay as page scrolls
  const opacityTitle = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scaleTitle = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  const handleAnalyze = async () => {
    if (authLoading) return;

    if (!user) {
      redirectToLogin(router, { redirect: "/", url: url.trim() || undefined });
      return;
    }

    if (!url.trim()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (res.status === 401) {
        redirectToLogin(router, { redirect: "/", url: url.trim() });
        return;
      }

      const data = await res.json();
      if (data.missionId) {
        router.push(`/mission/${data.missionId}`);
      }
    } catch {
      // network error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[120vh] flex-col justify-start section-pad pt-28 pb-32 md:pt-32 overflow-hidden"
    >
      {/* Background neon blur effects */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/10 blur-[120px] md:h-[500px] md:w-[500px]" />
      <div className="absolute top-1/3 left-1/4 -z-10 h-[200px] w-[200px] rounded-full bg-ai-blue/5 blur-[100px]" />

      <div className="mx-auto w-full max-w-[1200px] text-center">
        {/* Sub-label at the top */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_SMOOTH }}
          className="mb-6 flex flex-col items-center relative z-10"
        >
          <span className="label-caps tracking-[0.25em] text-xs text-violet-glow font-medium">
            {copy.landing.hero.eyebrow}
          </span>
          <div className="mt-4 h-px w-[120px] bg-gradient-to-r from-transparent via-violet/50 to-transparent" />
        </motion.div>

        {/* Pinned Massive Display Title in relative flow */}
        <div className="relative z-0 select-none pointer-events-none my-6">
          <motion.h1
            style={{ y: yTitle, scale: scaleTitle, opacity: opacityTitle }}
            className="font-heading text-7xl font-black tracking-[-0.05em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-ghost-white via-ghost-white/80 to-ghost-white/10 uppercase md:text-[11rem] lg:text-[13rem] drop-shadow-[0_0_80px_rgba(139,92,246,0.15)]"
          >
            {copy.landing.hero.title}
          </motion.h1>
        </div>

        {/* Scrolling Content Wrapper with solid overlay background */}
        <div className="relative z-10 bg-midnight pt-12">
          {/* Interactive Console / Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE_SMOOTH }}
            className="mx-auto w-full max-w-2xl mb-6"
          >
            <div className="brave-card animate-border-blink overflow-hidden p-1.5 transition-all focus-within:border-violet/40 focus-within:shadow-[0_0_40px_rgba(139,92,246,0.12)]">
              {/* Console Header */}
              <div className="flex items-center border-b border-border/50 px-4 py-2">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-danger/60" />
                  <span className="h-2 w-2 rounded-full bg-warning/60" />
                  <span className="h-2 w-2 rounded-full bg-neon-green/60 animate-pulse" />
                </div>
              </div>

              {/* Input Form Area */}
              <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 flex items-center">
                  <span className="font-mono text-violet/60 pl-3 select-none text-base md:text-lg">&gt;</span>
                  {!url && !isFocused && (
                    <span className="absolute left-[28px] w-[8px] h-[16px] bg-violet-glow animate-cursor-blink pointer-events-none" />
                  )}
                  <input
                    id="hero-url"
                    type="url"
                    value={url}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    placeholder={copy.landing.hero.urlPlaceholder}
                    disabled={isLoading}
                    className="w-full bg-transparent pl-2 pr-3 py-3.5 text-base text-ghost-white placeholder:text-muted outline-none md:text-lg caret-violet"
                  />
                </div>
                <Button
                  variant="glow"
                  size="md"
                  onClick={handleAnalyze}
                  disabled={isLoading || authLoading || (!!user && !url.trim())}
                  isLoading={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? copy.common.deploying : copy.common.releaseGhostAgents}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE_SMOOTH }}
            className="mx-auto max-w-2xl text-base leading-relaxed text-muted-light md:text-lg md:leading-relaxed mb-12"
          >
            {copy.landing.hero.description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
