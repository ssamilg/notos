"use client";

import { useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import { useProjects } from "@/context/ProjectProvider";
import { useNotes } from "@/context/NoteProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { NoteList } from "./_components/NoteList";
import { NoteListSkeleton } from "@/components/skeletons/NoteListSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProjectNotesPage() {
  const params = useParams<{ id: string }>();
  const { projects, ready: projectsReady, updateProject } = useProjects();
  const { notes, ready: notesReady, error, createDraftNote } = useNotes();
  const { navigateToNote, navigateToProjects, isPendingNotes, clearPending } = useNavigation();

  const project = projects.find((item) => item.id === params.id);

  useLayoutEffect(() => {
    if (notesReady) {
      clearPending();
    }
  }, [notesReady, clearPending]);

  function handleCreateNote() {
    const noteId = createDraftNote();

    if (noteId) {
      navigateToNote(params.id, noteId, { instant: true });
    }

    return noteId;
  }

  const showSkeleton = (isPendingNotes(params.id) || !notesReady) && notes.length === 0;

  let content = (
    <NoteList
      projectName={project?.name ?? "Project"}
      notes={notes}
      onSelectNote={(noteId) => navigateToNote(params.id, noteId)}
      onCreateNote={handleCreateNote}
      onRenameProject={(name) => updateProject(params.id, name)}
      onBack={navigateToProjects}
    />
  );

  if (showSkeleton) {
    content = <NoteListSkeleton />;
  }

  if (error && notes.length === 0 && notesReady) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!project && projectsReady && !showSkeleton) {
    content = (
      <Alert>
        <AlertDescription className="py-8 text-center">Project not found.</AlertDescription>
      </Alert>
    );
  }

  return content;
}
