"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MissionStage } from "@/lib/types";
import { copy } from "@/lib/copy";

interface ScanAnimationProps {
  url: string;
  domain: string;
  missionId: string;
  active: boolean;
  currentStage: MissionStage;
  stageProgress: number;
}

type LoadPhase = "connecting" | "fetching" | "rendering" | "live" | "fallback";

const STAGE_LOGS = copy.scan.stageLogs;

const ANALYSIS_STEP_LAYOUT = [
  { top: "4%", left: "8%", w: "72%", h: "12%" },
  { top: "18%", left: "10%", w: "38%", h: "22%" },
  { top: "4%", left: "62%", w: "30%", h: "8%" },
  { top: "42%", left: "8%", w: "55%", h: "18%" },
  { top: "62%", left: "10%", w: "40%", h: "14%" },
  { top: "78%", left: "8%", w: "84%", h: "12%" },
  { top: "48%", left: "58%", w: "34%", h: "20%" },
] as const;

const ANALYSIS_STEPS = copy.scan.analysisSteps.map((step, i) => ({
  ...step,
  ...ANALYSIS_STEP_LAYOUT[i],
}));

function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return displayed;
}

export function ScanAnimation({
  url,
  domain,
  missionId,
  active,
  currentStage,
  stageProgress,
}: ScanAnimationProps) {
  const [phase, setPhase] = useState<LoadPhase>("connecting");
  const [logs, setLogs] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [elementsScanned, setElementsScanned] = useState(0);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const isLiveRef = useRef(false);

  const targetUrl = url.startsWith("http") ? url : `https://${url}`;

  // Loading-overlay pipeline (connecting → fetching → rendering) until the real
  // screenshot arrives from the poll below.
  useEffect(() => {
    if (!active) return;

    setPhase("connecting");
    setLoadProgress(0);
    setScreenshotUrl(null);
    isLiveRef.current = false;

    const t1 = setTimeout(() => {
      setPhase("fetching");
      setLoadProgress(25);
    }, 600);
    const t2 = setTimeout(() => {
      setPhase("rendering");
      setLoadProgress(55);
    }, 1400);

    // Creep toward (but never reach) 95% while we wait — the poll snaps to 100.
    const progressInterval = setInterval(() => {
      setLoadProgress((p) => (isLiveRef.current ? p : Math.min(p + 1, 95)));
    }, 140);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(progressInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, missionId]);

  // Poll for THIS mission's real homepage screenshot (captured during the crawl).
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    const MAX_TRIES = 40; // ~60s safety net

    const poll = async () => {
      if (cancelled || isLiveRef.current) return;
      tries += 1;
      try {
        const res = await fetch(
          `/api/site-preview?missionId=${encodeURIComponent(missionId)}&url=${encodeURIComponent(targetUrl)}`
        );
        const data = await res.json();
        if (!cancelled && data.imageUrl) {
          setScreenshotUrl(data.imageUrl as string);
          isLiveRef.current = true;
          setPhase("live");
          setLoadProgress(100);
          return; // stop polling — we're live
        }
        if (!cancelled && data.fallback) {
          setPhase("fallback"); // crawl produced nothing and the fallback failed
          return;
        }
      } catch {
        // transient — retry
      }
      if (!cancelled && !isLiveRef.current && tries < MAX_TRIES) {
        timer = setTimeout(poll, 1500);
      }
    };

    timer = setTimeout(poll, 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, missionId, targetUrl]);

  // Stage-synced terminal logs
  useEffect(() => {
    if (!active) return;
    const stageLogs = STAGE_LOGS[currentStage];
    const logIndex = Math.min(
      Math.floor((stageProgress / 100) * stageLogs.length),
      stageLogs.length - 1
    );
    const line = stageLogs[logIndex];
    setLogs((prev) => {
      if (prev[prev.length - 1] === line) return prev;
      return [...prev.slice(-5), line];
    });
  }, [active, currentStage, stageProgress]);

  // Cycling analysis bounding boxes
  useEffect(() => {
    if (!active || phase !== "live") return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [active, phase]);

  // Element counter
  useEffect(() => {
    if (!active || phase !== "live") return;
    const interval = setInterval(() => {
      setElementsScanned((n) => n + Math.floor(Math.random() * 12 + 3));
    }, 800);
    return () => clearInterval(interval);
  }, [active, phase]);

  const latestLog = logs[logs.length - 1] ?? "";
  const typedLog = useTypewriter(latestLog);

  if (!active) return null;

  const currentStep = ANALYSIS_STEPS[stepIndex];
  const isLive = phase === "live";
  const showPreview = isLive || phase === "fallback";

  const phaseLabel: Record<LoadPhase, string> = {
    connecting: copy.scan.phases.connecting,
    fetching: copy.scan.phases.fetching,
    rendering: copy.scan.phases.rendering,
    live: copy.scan.phases.live,
    fallback: copy.scan.phases.fallback,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet/20 bg-navy/60 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-violet/10 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-neon-green/60 animate-pulse" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-md bg-midnight/80 px-3 py-1.5 font-mono text-xs">
          <span className="text-muted">{copy.common.urlPrefix}</span>
          <span className="truncate text-ghost-white/70">{domain}</span>
        </div>
        {isLive && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neon-green"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-green" />
            {copy.common.live}
          </motion.span>
        )}
      </div>

      {/* Viewport */}
      <div className="relative aspect-[16/10] overflow-hidden bg-midnight">
        {/* Real crawled screenshot with a slow scroll simulation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-x-0 top-0"
            animate={showPreview ? { y: [0, -80, -200, -120, 0] } : { y: 0 }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          >
            {screenshotUrl && (
              <motion.img
                src={screenshotUrl}
                alt={copy.scan.previewAlt(domain)}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 0.92, scale: 1 }}
                transition={{ duration: 1.2 }}
                className="pointer-events-none w-full select-none object-cover object-top"
              />
            )}
          </motion.div>
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {!isLive && phase !== "fallback" && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-midnight/95"
            >
              <div className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-violet/20 border-t-violet" />
              <p className="font-mono text-sm text-ghost-white/80">
                {phaseLabel[phase]}
              </p>
              <p className="mt-1 font-mono text-xs text-muted">{domain}</p>
              <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-navy-light">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet to-ai-blue"
                  animate={{ width: `${loadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="mt-2 font-mono text-[10px] text-violet/70">
                {loadProgress}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback wireframe when no screenshot is available */}
        {phase === "fallback" && !screenshotUrl && (
          <div className="absolute inset-0 z-10 flex flex-col p-8 opacity-30">
            <div className="mb-4 h-6 w-2/3 rounded bg-violet/20" />
            <div className="mb-2 h-4 w-1/2 rounded bg-ghost-white/10" />
            <div className="mb-6 h-3 w-1/3 rounded bg-ghost-white/5" />
            <div className="grid flex-1 grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg bg-ai-blue/10" />
              ))}
            </div>
          </div>
        )}

        {/* Scan grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139, 92, 246, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* AI bounding box */}
        {showPreview && (
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              style={{
                position: "absolute",
                top: currentStep.top,
                left: currentStep.left,
                width: currentStep.w,
                height: currentStep.h,
              }}
              className="pointer-events-none z-30 select-none rounded border-2 border-violet/70 bg-violet/[0.06] shadow-[0_0_24px_rgba(139,92,246,0.25)]"
            >
              {/* Corner brackets */}
              {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                <span
                  key={corner}
                  className={`absolute h-3 w-3 border-violet ${
                    corner === "tl"
                      ? "-left-px -top-px border-l-2 border-t-2"
                      : corner === "tr"
                        ? "-right-px -top-px border-r-2 border-t-2"
                        : corner === "bl"
                          ? "-bottom-px -left-px border-b-2 border-l-2"
                          : "-bottom-px -right-px border-b-2 border-r-2"
                  }`}
                />
              ))}
              <div className="absolute -top-7 left-0 flex items-center gap-1.5 whitespace-nowrap rounded bg-midnight/90 px-2 py-0.5 font-mono text-[9px] text-violet-glow backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet" />
                {currentStep.label}
              </div>
              <div className="absolute -bottom-5 left-0 font-mono text-[8px] text-ghost-white/60">
                {currentStep.desc}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Horizontal scan line */}
        {showPreview && (
          <motion.div
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute right-0 left-0 z-25 h-[2px] bg-gradient-to-r from-transparent via-ai-blue to-transparent shadow-[0_0_16px_rgba(96,165,250,0.6)]"
          />
        )}

        {/* Stats HUD */}
        {showPreview && (
          <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-lg border border-border/50 bg-midnight/80 px-3 py-2 font-mono text-[9px] backdrop-blur-sm">
            <p className="text-muted">{copy.scan.elementsScanned}</p>
            <p className="text-ai-blue">{elementsScanned.toLocaleString()}</p>
          </div>
        )}

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(3,3,8,0.4)_100%)]" />
      </div>

      {/* Terminal */}
      <div className="border-t border-violet/10 bg-midnight/90 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
            {copy.scan.terminalLabel}
          </span>
          <span className="h-1 w-1 animate-pulse rounded-full bg-neon-green" />
        </div>
        <div className="min-h-[72px] space-y-1 font-mono text-[10px] sm:text-xs">
          {logs.slice(0, -1).map((line, i) => (
            <p key={`${i}-${line}`} className="flex items-center gap-2 text-muted/60">
              <span className="text-neon-green/40">{copy.scan.terminalPrompt}</span>
              {line}
            </p>
          ))}
          <p className="flex items-center gap-2 text-ai-blue">
            <span className="text-neon-green/70">{copy.scan.terminalPrompt}</span>
            <span>
              {typedLog}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="ml-0.5 inline-block h-3 w-1.5 bg-ai-blue/80"
              />
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
