import { ProjectProvider } from "@/context/ProjectProvider";
import { Navbar } from "./_components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-8 outline-none">
          {children}
        </main>
      </div>
    </ProjectProvider>
  );
}
