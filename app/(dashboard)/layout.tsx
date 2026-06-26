import { DashboardBootstrap } from "./_components/DashboardBootstrap";
import { DashboardShell } from "./_components/DashboardShell";

export default function DashboardLayout({
  children: _children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardBootstrap>
      <DashboardShell />
    </DashboardBootstrap>
  );
}
