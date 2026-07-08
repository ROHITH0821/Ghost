"use client";

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
      <span className="hidden max-w-[160px] truncate text-sm text-muted-light sm:block">
        {user.email}
      </span>
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
