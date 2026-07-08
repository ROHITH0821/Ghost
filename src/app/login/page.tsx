import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { copy } from "@/lib/copy";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center section-pad">
      <div className="w-full flex justify-center">
        <Suspense fallback={<div className="text-muted">{copy.common.loading}</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
