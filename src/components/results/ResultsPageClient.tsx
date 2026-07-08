"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { GhostReport } from "@/lib/types";
import { TextLink } from "@/components/ui/BRAVE";
import { GhostLogo } from "@/components/ui/GhostLogo";
import { IntelligenceReportView } from "@/components/results/IntelligenceReportView";
import { copy } from "@/lib/copy";

interface ResultsPageClientProps {
  missionId: string;
}

export function ResultsPageClient({ missionId }: ResultsPageClientProps) {
  const [report, setReport] = useState<GhostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${missionId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [missionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-border border-t-violet"
        />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <p className="text-muted">{copy.results.reportNotFound}</p>
        <TextLink onClick={() => router.push("/")}>{copy.common.backToHome}</TextLink>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-50 section-pad border-b border-border bg-midnight/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between">
          <GhostLogo size="sm" />
          <TextLink onClick={() => router.push("/")} className="!text-sm">
            {copy.common.newAnalysis}
          </TextLink>
        </div>
      </header>

      <div className="relative z-10 section-pad mx-auto max-w-[1400px] py-12 md:py-20">
        <IntelligenceReportView report={report} />
      </div>
    </div>
  );
}
