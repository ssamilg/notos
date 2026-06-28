"use client";

import type { TagWithCount } from "@/data/tags";
import { ConfirmationModal } from "@/components/ConfirmationModal";

type TagDeleteDialogProps = {
  tag: TagWithCount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function TagDeleteDialog({ tag, open, onOpenChange, onConfirm }: TagDeleteDialogProps) {
  const noteLabel = tag?.note_count === 1 ? "note" : "notes";
  const description = tag
    ? `Are you sure you want to delete "${tag.name}"? This affects ${tag.note_count} ${noteLabel}.`
    : "Are you sure you want to delete this tag?";

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete tag?"
      description={description}
      confirmLabel="Delete"
      onConfirm={onConfirm}
    />
  );
}
