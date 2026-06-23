"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNotes } from "@/context/NoteProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { NoteDetail } from "@/app/(dashboard)/project/[id]/_components/NoteDetail";
import { NoteDetailSkeleton } from "@/components/skeletons/NoteDetailSkeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NoteDetailPage() {
  const params = useParams<{ id: string; noteId: string }>();
  const router = useRouter();
  const {
    getNote,
    ready,
    error,
    isDraftNote,
    saveDraftNote,
    cancelDraftNote,
    updateNote,
    deleteNote,
  } = useNotes();
  const { navigateToProject, isPendingNote, clearPending } = useNavigation();
  const [isDeleting, setIsDeleting] = useState(false);
  const note = getNote(params.noteId);
  const isDraft = isDraftNote(params.noteId);

  useLayoutEffect(() => {
    if (ready && note) {
      clearPending();
    }
  }, [ready, note, clearPending]);

  useEffect(() => {
    function handleSyncResolved(event: Event) {
      const detail = (event as CustomEvent<{
        entityType: string;
        tempId: string;
        serverId: string;
        projectId?: string;
      }>).detail;

      if (
        detail.entityType === "note" &&
        detail.tempId === params.noteId &&
        detail.projectId === params.id
      ) {
        queueMicrotask(() => {
          router.replace(`/project/${params.id}/note/${detail.serverId}`);
        });
      }
    }

    window.addEventListener("notos:sync-resolved", handleSyncResolved);

    return () => {
      window.removeEventListener("notos:sync-resolved", handleSyncResolved);
    };
  }, [params.id, params.noteId, router]);

  function handleBack() {
    if (isDraft) {
      cancelDraftNote(params.noteId);
    }

    navigateToProject(params.id);
  }

  function handleSave(input: { title?: string; text?: string; tag?: string | null }) {
    if (isDraft) {
      saveDraftNote(params.noteId, input);
      return;
    }

    updateNote(params.noteId, input);
  }

  const showSkeleton = isDeleting || (!note && (isPendingNote(params.id, params.noteId) || !ready));

  let content = <NoteDetailSkeleton />;

  if (showSkeleton) {
    content = <NoteDetailSkeleton />;
  } else if (note) {
    content = (
      <NoteDetail
        key={params.noteId}
        note={note}
        projectId={params.id}
        isDraft={isDraft}
        onSave={handleSave}
        onCancel={handleBack}
        onBack={handleBack}
        onDelete={() => {
          setIsDeleting(true);
          deleteNote(params.noteId);
          navigateToProject(params.id);
        }}
      />
    );
  } else if (error && ready && !isDeleting) {
    content = (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else if (ready && !isDeleting) {
    content = (
      <Alert>
        <AlertDescription className="py-8 text-center">Note not found.</AlertDescription>
      </Alert>
    );
  }

  return content;
}
