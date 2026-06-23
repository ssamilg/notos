"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useNotes } from "@/context/NoteProvider";
import { NoteDetail } from "@/app/(dashboard)/project/[id]/_components/NoteDetail";
import { NoteDetailSkeleton } from "@/components/skeletons/NoteDetailSkeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

function isNewNote(noteId: string, title: string, text: string) {
  return noteId.startsWith("temp-") || (title === "Untitled" && text.trim() === "");
}

export default function NoteDetailPage() {
  const params = useParams<{ id: string; noteId: string }>();
  const router = useRouter();
  const { getNote, loading, error, updateNote, deleteNote } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);
  const note = getNote(params.noteId);
  const showSkeleton = isDeleting || (loading && !note);

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
        router.replace(`/project/${params.id}/note/${detail.serverId}`);
      }
    }

    window.addEventListener("notos:sync-resolved", handleSyncResolved);

    return () => {
      window.removeEventListener("notos:sync-resolved", handleSyncResolved);
    };
  }, [params.id, params.noteId, router]);

  let content = <NoteDetailSkeleton />;

  if (showSkeleton) {
    content = <NoteDetailSkeleton />;
  } else if (note) {
    content = (
      <NoteDetail
        key={params.noteId}
        note={note}
        projectId={params.id}
        initialEditing={isNewNote(note.id, note.title, note.text)}
        onSave={(input) => updateNote(params.noteId, input)}
        onDelete={() => {
          setIsDeleting(true);
          deleteNote(params.noteId);
          router.push(`/project/${params.id}`);
        }}
      />
    );
  } else if (error && !loading && !isDeleting) {
    content = (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  } else if (!loading && !isDeleting) {
    content = (
      <Alert>
        <AlertDescription className="py-8 text-center">Note not found.</AlertDescription>
      </Alert>
    );
  }

  return content;
}
