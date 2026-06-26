"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    const formData = new FormData();
    formData.set("intent", "logout");

    const res = await fetch("/api/auth", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as { redirect?: string };

    queryClient.clear();

    if (data.redirect) {
      router.push(data.redirect);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-label fixed bottom-4 left-1/2 z-50 -translate-x-1/2 text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
}
