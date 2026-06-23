"use client";

import { useParams, useRouter } from "next/navigation";
import { useProjects } from "@/context/ProjectProvider";
import { useNotes } from "@/context/NoteProvider";
import { NoteList } from "./_components/NoteList";
import { NoteListSkeleton } from "@/components/skeletons/NoteListSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProjectNotesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { projects, loading: projectsLoading, updateProject } = useProjects();
  const { notes, loading: notesLoading, error, createNote } = useNotes();

  const project = projects.find((item) => item.id === params.id);

  const showSkeleton =
    (notesLoading && notes.length === 0) || (projectsLoading && projects.length === 0);

  let content = (
    <NoteList
      projectName={project?.name ?? "Project"}
      notes={notes}
      onSelectNote={(noteId) => router.push(`/project/${params.id}/note/${noteId}`)}
      onCreateNote={() => createNote("Untitled", "", null)}
      onRenameProject={(name) => updateProject(params.id, name)}
    />
  );

  if (showSkeleton) {
    content = <NoteListSkeleton />;
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
