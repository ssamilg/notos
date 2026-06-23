"use client";

import Link from "next/link";
import { GlowButton } from "@/components/glow-button";

export function LandingView() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center"
    >
      <h1 className="text-display mb-2 glow-text-intense sm:text-7xl sm:tracking-[0.5em]">
        NOTOS
      </h1>
      <p className="text-label mb-12 text-muted-foreground">
        Noise To Signal
      </p>
      <Link href="/login">
        <GlowButton>Authenticate</GlowButton>
      </Link>
    </main>
  );
}
