import { LogoutButton } from "./LogoutButton";
import { DashboardNavigationProvider } from "@/context/DashboardNavigationProvider";
import { DashboardViewHost } from "./DashboardViewHost";

export function DashboardShell() {
  return (
    <DashboardNavigationProvider>
      <div className="relative min-h-screen bg-background pb-16 text-foreground">
        <main
          id="main-content"
          tabIndex={-1}
          className="relative mx-auto max-w-4xl px-6 py-8 outline-none"
        >
          <DashboardViewHost />
        </main>
        <LogoutButton />
      </div>
    </DashboardNavigationProvider>
  );
}
