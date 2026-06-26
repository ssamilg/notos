"use client";

import { useState } from "react";
import { NoteList } from "@/app/(dashboard)/project/[id]/_components/NoteList";
import { NoteListSkeleton } from "@/components/skeletons/NoteListSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboardNavigation } from "@/context/DashboardNavigationProvider";
import { useProjectsQuery } from "@/hooks/queries/useProjectsQuery";
import { useNotesInfiniteQuery } from "@/hooks/queries/useNotesInfiniteQuery";
import { useCreateNoteMutation } from "@/hooks/mutations/useCreateNoteMutation";
import { useUpdateProjectMutation } from "@/hooks/mutations/useUpdateProjectMutation";
import {
  readNoteFiltersFromLocation,
  writeNoteFiltersToLocation,
} from "@/lib/navigation/dashboardView";
import type { NoteFilters } from "@/lib/query/keys";

type ProjectNotesViewProps = {
  projectId: string;
};

export function ProjectNotesView({ projectId }: ProjectNotesViewProps) {
  const { navigateToProjects, navigateToNote } = useDashboardNavigation();
  const [filters, setFilters] = useState<NoteFilters>(() => readNoteFiltersFromLocation());
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const {
    notes,
    isLoading: notesLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useNotesInfiniteQuery(projectId, filters);
  const createNoteMutation = useCreateNoteMutation(projectId, filters);
  const updateProjectMutation = useUpdateProjectMutation();

  const project = projects.find((item) => item.id === projectId);

  function applyFilters(search: string, tagId: string | null) {
    const nextFilters: NoteFilters = {
      search: search.trim() || undefined,
      tagId: tagId || undefined,
    };

    setFilters(nextFilters);
    writeNoteFiltersToLocation(projectId, nextFilters);
  }

  function handleCreateNote() {
    const noteId = crypto.randomUUID();

    createNoteMutation.mutate({
      id: noteId,
      projectId,
      title: "Untitled",
      text: "",
      tags: [],
      is_completed: false,
    });

    return noteId;
  }

  const showSkeleton = notesLoading && notes.length === 0;

  let content = (
    <NoteList
      projectName={project?.name ?? "Project"}
      notes={notes}
      filters={filters}
      loadingMore={isFetchingNextPage}
      hasMore={Boolean(hasNextPage)}
      onSelectNote={(noteId) => navigateToNote(noteId)}
      onCreateNote={handleCreateNote}
      onRenameProject={(name) => updateProjectMutation.mutate({ id: projectId, name })}
      onBack={navigateToProjects}
      onLoadMore={() => {
        void fetchNextPage();
      }}
      onApplyFilters={applyFilters}
    />
  );

  if (showSkeleton) {
    content = <NoteListSkeleton />;
  }

  if (isError && notes.length === 0) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error?.message ?? "Failed to load notes"}</AlertDescription>
      </Alert>
    );
  }

  if (!project && !projectsLoading && !showSkeleton) {
    content = (
      <Alert>
        <AlertDescription className="py-8 text-center">Project not found.</AlertDescription>
      </Alert>
    );
  }

  return content;
}
