"use client";

import { useState } from "react";
import type { TagWithCount } from "@/data/tags";
import { TagList } from "@/app/(dashboard)/_components/TagList";
import { TagDeleteDialog } from "@/app/(dashboard)/_components/TagDeleteDialog";
import { TagListSkeleton } from "@/components/skeletons/TagListSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { useUpdateTagMutation } from "@/hooks/mutations/useUpdateTagMutation";
import { useDeleteTagMutation } from "@/hooks/mutations/useDeleteTagMutation";

type TagManagerProps = {
  isCreating: boolean;
  draftName: string;
  onCancelCreate: () => void;
  onDraftNameChange: (value: string) => void;
  onSaveCreate: () => void;
};

export function TagManager({
  isCreating,
  draftName,
  onCancelCreate,
  onDraftNameChange,
  onSaveCreate,
}: TagManagerProps) {
  const { data: tags = [], isLoading: tagsLoading, isError, error } = useTagsQuery();
  const updateTagMutation = useUpdateTagMutation();
  const deleteTagMutation = useDeleteTagMutation();
  const [pendingDelete, setPendingDelete] = useState<TagWithCount | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleDeleteRequest(tag: TagWithCount) {
    setPendingDelete(tag);
    setDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (pendingDelete) {
      deleteTagMutation.mutate({ id: pendingDelete.id });
      setPendingDelete(null);
    }
  }

  if (tagsLoading && tags.length === 0) {
    return <TagListSkeleton />;
  }

  let content = (
    <TagList
      tags={tags}
      isCreating={isCreating}
      draftName={draftName}
      onCancelCreate={onCancelCreate}
      onDraftNameChange={onDraftNameChange}
      onSaveCreate={onSaveCreate}
      onUpdateTag={(id, name) => updateTagMutation.mutate({ id, name })}
      onDelete={handleDeleteRequest}
    />
  );

  if (isError && tags.length === 0) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error?.message ?? "Failed to load tags"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {content}

      <TagDeleteDialog
        tag={pendingDelete}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
