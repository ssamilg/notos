"use client";

import { useState } from "react";
import { NoteDetail } from "@/features/project/NoteDetail";
import { NoteDetailSkeleton } from "@/components/skeletons/NoteDetailSkeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboardNavigation } from "@/context/DashboardNavigationProvider";
import { useNoteQuery } from "@/hooks/queries/useNoteQuery";
import { useUpdateNoteMutation } from "@/hooks/mutations/useUpdateNoteMutation";
import { useDeleteNoteMutation } from "@/hooks/mutations/useDeleteNoteMutation";
import { useCreateNoteMutation } from "@/hooks/mutations/useCreateNoteMutation";
import { readNoteFiltersFromLocation } from "@/lib/navigation/dashboardView";
import { DEFAULT_NOTE_TEMPLATE } from "@/constants/templates";
import { useProjectsQuery } from "@/hooks/queries/useProjectsQuery";

type NoteSaveInput = {
  title?: string;
  text?: string;
  tags?: string[];
  is_completed?: boolean;
};

type NoteDetailViewProps = {
  noteId: string;
};

function isNewNote(title: string) {
  return title === "Untitled";
}

export function NoteDetailView({ noteId }: NoteDetailViewProps) {
  const { navigateToProject, navigateToNote } = useDashboardNavigation();
  const { data: note, isLoading, isError, error } = useNoteQuery(noteId);
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: projects = [] } = useProjectsQuery();
  const projectId = note?.project_id ?? "";
  const project = projects.find((item) => item.id === projectId);
  const filters = readNoteFiltersFromLocation();
  const createNoteMutation = useCreateNoteMutation(projectId, filters);
  const isDraft = note ? isNewNote(note.title) : false;

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

    const payload: {
      projectId: string;
      id: string;
      title?: string;
      text?: string;
      tags?: string[];
      is_completed?: boolean;
    } = {
      projectId: note.project_id,
      id: noteId,
    };

    if (input.title !== undefined) {
      payload.title = input.title;
    }

    if (input.text !== undefined) {
      payload.text = input.text;
    }

    if (input.tags !== undefined) {
      payload.tags = input.tags;
    }

    if (input.is_completed !== undefined) {
      payload.is_completed = input.is_completed;
    }

    updateNoteMutation.mutate(payload);
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
      text: DEFAULT_NOTE_TEMPLATE,
      tags: [],
      is_completed: false,
    });
    navigateToNote(nextNoteId);
  }

  function handleToggleComplete() {
    if (!note) {
      return;
    }

    updateNoteMutation.mutate({
      projectId: note.project_id,
      id: noteId,
      is_completed: !note.is_completed,
    });
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
        projectName={project?.name ?? "Project"}
        isDraft={isDraft}
        onSave={handleSave}
        onCancel={handleBack}
        onBack={handleBack}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
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
