"use client";

import Image from "next/image";

export function SiteBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-midnight" />

      {/* Large fixed logo watermark — stays put while scrolling */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/ghost-logo.png"
          alt=""
          width={1024}
          height={1024}
          priority
          className="w-[min(92vw,78vh)] max-w-none mix-blend-screen opacity-[0.07] select-none"
          draggable={false}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Edge vignette so content stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,3,8,0.55)_70%,rgba(3,3,8,0.92)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-midnight/80" />
    </div>
  );
}
