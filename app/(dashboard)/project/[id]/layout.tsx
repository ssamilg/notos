import { ProjectNotesProvider } from "./_components/ProjectNotesProvider";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <ProjectNotesProvider projectId={id}>{children}</ProjectNotesProvider>;
}
