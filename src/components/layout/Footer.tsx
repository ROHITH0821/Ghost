import Link from "next/link";
import { GhostLogo } from "@/components/ui/GhostLogo";
import { PoweredByWebaura } from "@/components/layout/PoweredByWebaura";
import { copy } from "@/lib/copy";

export function Footer() {
  return (
    <footer className="section-pad border-t border-border py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <GhostLogo size="lg" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {copy.footer.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted">
            {copy.footer.bullets.map((bullet) => (
              <span key={bullet}>{bullet}</span>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col gap-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>{copy.footer.copyright(new Date().getFullYear())}</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="transition-colors hover:text-ghost-white">
                {copy.nav.home}
              </Link>
              <span className="text-border">{copy.common.separator}</span>
              <a href="#faq" className="transition-colors hover:text-ghost-white">
                {copy.nav.faq}
              </a>
            </div>
          </div>

          <PoweredByWebaura />
        </div>
      </div>
    </footer>
  );
}
