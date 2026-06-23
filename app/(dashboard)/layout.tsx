import { ProjectProvider } from "@/context/ProjectProvider";
import { DashboardShell } from "./_components/DashboardShell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProjectProvider>
      <DashboardShell>{children}</DashboardShell>
    </ProjectProvider>
  );
}
