"use client";

import Image from "next/image";
import Link from "next/link";
import { copy } from "@/lib/copy";

const SIZES = {
  sm: 40,
  md: 52,
  lg: 72,
} as const;

interface GhostLogoProps {
  size?: keyof typeof SIZES;
  linked?: boolean;
  className?: string;
}

export function GhostLogo({
  size = "md",
  linked = true,
  className = "",
}: GhostLogoProps) {
  const height = SIZES[size];

  const image = (
    <Image
      src="/ghost-logo.png"
      alt={copy.brand.alt}
      width={1024}
      height={1024}
      className={className}
      style={{ height, width: "auto" }}
      priority={size === "lg"}
    />
  );

  if (!linked) {
    return <span className="inline-flex shrink-0">{image}</span>;
  }

  return (
    <Link href="/" className="inline-flex shrink-0">
      {image}
    </Link>
  );
}
