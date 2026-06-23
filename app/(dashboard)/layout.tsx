import { ProjectProvider } from "@/context/ProjectProvider";
import { LogoutButton } from "./_components/LogoutButton";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProjectProvider>
      <div className="relative min-h-screen bg-background pb-16 text-foreground">
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-8 outline-none">
          {children}
        </main>
        <LogoutButton />
      </div>
    </ProjectProvider>
  );
}
