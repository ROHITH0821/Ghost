import Link from "next/link";
import { GhostLogo } from "@/components/ui/GhostLogo";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getSession } from "@/lib/auth";
import { getRecentMissionsForUser } from "@/lib/db/missions";
import { upsertUserByEmail } from "@/lib/db/users";
import { copy } from "@/lib/copy";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    // Middleware should redirect, but keep a safe fallback for direct loads.
    return (
      <main className="relative min-h-screen">
        <div className="section-pad mx-auto flex min-h-screen max-w-[1100px] flex-col items-center justify-center gap-6">
          <GhostLogo size="md" />
          <p className="text-muted">{copy.authApi.authRequired}</p>
        </div>
      </main>
    );
  }

  try {
    // Sessions issued by the current login flow store the canonical DB user id,
    // so the user row and mission list can be fetched in parallel. Re-query only
    // if the session carries a stale/legacy id.
    const [user, missionsBySessionId] = await Promise.all([
      upsertUserByEmail(session.email),
      getRecentMissionsForUser({ userId: session.userId, limit: 12 }),
    ]);
    const recent =
      user.id === session.userId
        ? missionsBySessionId
        : await getRecentMissionsForUser({ userId: user.id, limit: 12 });

    return (
      <ProfilePageClient
        user={{ id: user.id, email: user.email, createdAt: user.createdAt }}
        recent={recent}
      />
    );
  } catch (error) {
    // A transient DB outage (e.g. unreachable pooler) shouldn't crash the
    // page — show a friendly retry state instead.
    console.error("[profile] failed to load data:", error);
    return (
      <main className="relative min-h-screen">
        <div className="section-pad mx-auto flex min-h-screen max-w-[1100px] flex-col items-center justify-center gap-6 text-center">
          <GhostLogo size="md" />
          <div>
            <p className="text-ghost-white/90">We couldn&apos;t load your profile right now.</p>
            <p className="mt-2 text-sm text-muted">
              The database is briefly unreachable. It usually recovers in a few seconds.
            </p>
          </div>
          <Link
            href="/profile"
            className="rounded-xl bg-violet px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-dim"
          >
            Try again
          </Link>
        </div>
      </main>
    );
  }
}

