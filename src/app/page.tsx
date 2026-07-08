import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { GhostMindset } from "@/components/landing/GhostMindset";
import { ProgramSteps } from "@/components/landing/ProgramSteps";
import { PersonaShowcase } from "@/components/landing/PersonaShowcase";
import { IntelligenceFinale } from "@/components/landing/IntelligenceFinale";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <Header />
      <Hero />
      <GhostMindset />
      <ProgramSteps />
      <PersonaShowcase />
      <IntelligenceFinale />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
