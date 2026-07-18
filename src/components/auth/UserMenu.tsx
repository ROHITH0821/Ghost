"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TextLink } from "@/components/ui/BRAVE";
import { copy } from "@/lib/copy";

export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="h-5 w-20 animate-pulse rounded bg-border" />;
  }

  if (!user) {
    return (
      <TextLink onClick={() => router.push("/login")} className="!text-sm md:!text-base">
        {copy.nav.signIn}
      </TextLink>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/profile"
        className="hidden max-w-[220px] truncate text-sm text-muted-light transition-colors hover:text-ghost-white sm:block"
        title={user.email}
      >
        {user.email}
      </Link>
      <Link
        href="/profile"
        className="rounded-xl border border-border bg-surface/30 px-3 py-1.5 text-sm text-ghost-white/70 transition-colors hover:text-ghost-white"
      >
        Profile
      </Link>
      <button
        type="button"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        className="text-sm text-ghost-white/60 transition-colors hover:text-ghost-white"
      >
        {copy.nav.signOut}
      </button>
    </div>
  );
}
