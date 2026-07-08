"use client";

import { useRouter } from "next/navigation";
import { ScrollReveal, SectionHeading, TextLink } from "@/components/ui/BRAVE";
import { useAuth } from "@/components/auth/AuthProvider";
import { copy } from "@/lib/copy";
import { redirectToLogin } from "@/lib/auth/redirect-to-login";

export function CTASection() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!loading && !user) {
      redirectToLogin(router, { redirect: "/" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="section-pad py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] text-center">
        <SectionHeading size="lg" align="center">
          {copy.landing.cta.heading}
        </SectionHeading>

        <ScrollReveal className="mt-8">
          <p className="mx-auto max-w-md text-muted-light">
            {copy.landing.cta.description}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="mt-10 flex justify-center">
          <TextLink onClick={handleClick}>
            {copy.common.releaseGhostAgents}
          </TextLink>
        </ScrollReveal>
      </div>
    </section>
  );
}
