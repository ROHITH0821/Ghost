"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GhostReport, MissionState } from "@/lib/types";
import { MissionDashboard } from "@/components/mission/MissionDashboard";
import { copy } from "@/lib/copy";
import { redirectToLogin } from "@/lib/auth/redirect-to-login";

interface MissionPageClientProps {
  missionId: string;
}

export function MissionPageClient({ missionId }: MissionPageClientProps) {
  const [mission, setMission] = useState<MissionState | null>(null);
  const [report, setReport] = useState<GhostReport | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Returns true once the report has been fetched and stored.
    const fetchReport = async (): Promise<boolean> => {
      try {
        const res = await fetch(`/api/reports/${missionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setReport(data.report);
            return true;
          }
        }
      } catch {
        // transient — retry on the next poll
      }
      return false;
    };

    const poll = async () => {
      try {
        const res = await fetch(`/api/analyze?missionId=${missionId}`);
        if (res.status === 401) {
          clearInterval(interval);
          redirectToLogin(router, {
            redirect: `/mission/${missionId}`,
          });
          return;
        }
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setMission(data.mission);

        if (data.mission.status === "complete") {
          // Keep polling until the report is actually in hand — a single fetch
          // can race the report being written, and stopping early leaves the UI
          // stuck on the loading spinner until a manual reload.
          const got = await fetchReport();
          if (got) clearInterval(interval);
        } else if (data.mission.status === "error") {
          clearInterval(interval);
        }
      } catch {
        setError(true);
      }
    };

    poll();
    interval = setInterval(poll, 500);

    return () => clearInterval(interval);
  }, [missionId, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ghost-white/50">{copy.mission.notFound}</p>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet/30 border-t-violet" />
      </div>
    );
  }

  return <MissionDashboard mission={mission} report={report} />;
}
