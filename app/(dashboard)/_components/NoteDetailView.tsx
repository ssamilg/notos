"use client";

import { useState } from "react";
import { NoteDetail } from "@/app/(dashboard)/project/[id]/_components/NoteDetail";
import { NoteDetailSkeleton } from "@/components/skeletons/NoteDetailSkeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboardNavigation } from "@/context/DashboardNavigationProvider";
import { useNoteQuery } from "@/hooks/queries/useNoteQuery";
import { useUpdateNoteMutation } from "@/hooks/mutations/useUpdateNoteMutation";
import { useDeleteNoteMutation } from "@/hooks/mutations/useDeleteNoteMutation";
import { useCreateNoteMutation } from "@/hooks/mutations/useCreateNoteMutation";
import { readNoteFiltersFromLocation } from "@/lib/navigation/dashboardView";

type NoteSaveInput = {
  title?: string;
  text?: string;
  tags?: string[];
  is_completed?: boolean;
};

type NoteDetailViewProps = {
  noteId: string;
};

function isNewNote(title: string, text: string) {
  return title === "Untitled" && text.trim().length === 0;
}

export function NoteDetailView({ noteId }: NoteDetailViewProps) {
  const { navigateToProject, navigateToNote } = useDashboardNavigation();
  const { data: note, isLoading, isError, error } = useNoteQuery(noteId);
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const projectId = note?.project_id ?? "";
  const filters = readNoteFiltersFromLocation();
  const createNoteMutation = useCreateNoteMutation(projectId, filters);
  const isDraft = note ? isNewNote(note.title, note.text) : false;

  function handleBack() {
    if (!projectId) {
      return;
    }

    navigateToProject(projectId);
  }

  function handleSave(input: NoteSaveInput) {
    if (!note) {
      return;
    }

    updateNoteMutation.mutate({
      projectId: note.project_id,
      id: noteId,
      title: input.title,
      text: input.text,
      tags: input.tags,
      is_completed: input.is_completed,
    });
  }

  function handleSaveAndExit(input: NoteSaveInput) {
    handleSave(input);
    handleBack();
  }

  function handleSaveAndNew(input: NoteSaveInput) {
    if (!note) {
      return;
    }

    handleSave(input);

    const nextNoteId = crypto.randomUUID();

    createNoteMutation.mutate({
      id: nextNoteId,
      projectId: note.project_id,
      title: "Untitled",
      text: "",
      tags: [],
      is_completed: false,
    });
    navigateToNote(nextNoteId);
  }

  function handleDelete() {
    if (!note) {
      return;
    }

    setIsDeleting(true);
    deleteNoteMutation.mutate(
      {
        projectId: note.project_id,
        id: noteId,
      },
      {
        onSettled: () => {
          navigateToProject(note.project_id);
        },
      }
    );
  }

  const showSkeleton = isDeleting || (isLoading && !note);

  let content = <NoteDetailSkeleton />;

  if (showSkeleton) {
    content = <NoteDetailSkeleton />;
  } else if (note) {
    content = (
      <NoteDetail
        key={noteId}
        note={note}
        projectId={note.project_id}
        isDraft={isDraft}
        onSave={handleSave}
        onCancel={handleBack}
        onBack={handleBack}
        onDelete={handleDelete}
        onSaveAndExit={handleSaveAndExit}
        onSaveAndNew={handleSaveAndNew}
      />
    );
  } else if (isError && !isDeleting) {
    content = (
      <Alert variant="destructive">
        <AlertDescription>{error?.message ?? "Failed to load note"}</AlertDescription>
      </Alert>
    );
  } else if (!isDeleting) {
    content = (
      <Alert>
        <AlertDescription className="py-8 text-center">Note not found.</AlertDescription>
      </Alert>
    );
  }

  return content;
}
