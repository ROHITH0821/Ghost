import { GhostLogo } from "@/components/ui/GhostLogo";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getSession } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { getRecentMissionsForUser } from "@/lib/db/missions";
import { resolveUserId } from "@/lib/db/users";
import { copy } from "@/lib/copy";

export default async function ProfilePage() {
  const session = await getSession();
  const user = await getCurrentUser();

  if (!session || !user) {
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

  const userId = await resolveUserId(session.email);
  const recent = await getRecentMissionsForUser({ userId, limit: 12 });

  return <ProfilePageClient user={user} recent={recent} />;
}

