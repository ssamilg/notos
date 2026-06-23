"use client";

import { NavigationProvider } from "@/context/NavigationProvider";
import { LogoutButton } from "./LogoutButton";
import { NavigationOverlay } from "./NavigationOverlay";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <div className="relative min-h-screen bg-background pb-16 text-foreground">
        <main id="main-content" tabIndex={-1} className="relative mx-auto max-w-4xl px-6 py-8 outline-none">
          {children}
          <NavigationOverlay />
        </main>
        <LogoutButton />
      </div>
    </NavigationProvider>
  );
}
