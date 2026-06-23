"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    const formData = new FormData();
    formData.set("intent", "logout");

    const res = await fetch("/api/auth", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as { redirect?: string };

    if (data.redirect) {
      router.push(data.redirect);
    }
  }

  return (
    <header className="border-b border-border bg-background">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <Link
          href="/dashboard"
          className="text-label text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          NOTOS
        </Link>
        <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </nav>
    </header>
  );
}
