"use client";

import { useParams, useRouter } from "next/navigation";
import { useProjects } from "@/context/ProjectProvider";
import { useNotes } from "@/context/NoteProvider";
import { NoteList } from "./_components/NoteList";
import { LiveStatus } from "@/components/a11y/LiveStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProjectNotesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { projects, loading: projectsLoading } = useProjects();
  const { notes, loading: notesLoading, error, deleteNote } = useNotes();

  const project = projects.find((item) => item.id === params.id);
  const isLoading = projectsLoading || notesLoading;

  let content = (
    <NoteList
      projectName={project?.name ?? "Project"}
      notes={notes}
      onSelectNote={(noteId) => router.push(`/project/${params.id}/note/${noteId}`)}
      onOpenCanvas={() => router.push(`/project/${params.id}/canvas`)}
      onDeleteNote={deleteNote}
    />
  );

  if (isLoading) {
    content = <LiveStatus message="Loading notes…" />;
  }

  if (error && notes.length === 0) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!project && !projectsLoading) {
    content = (
      <Alert>
        <AlertDescription className="py-8 text-center">Project not found.</AlertDescription>
      </Alert>
    );
  }

  return content;
}
