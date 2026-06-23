"use client";

import { useParams, useRouter } from "next/navigation";
import { useNotes } from "@/context/NoteProvider";
import { NoteDetail } from "@/app/(dashboard)/project/[id]/_components/NoteDetail";
import { LiveStatus } from "@/components/a11y/LiveStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NoteDetailPage() {
  const params = useParams<{ id: string; noteId: string }>();
  const router = useRouter();
  const { getNote, loading, error, deleteNote } = useNotes();
  const note = getNote(params.noteId);

  let content = <LiveStatus message="Loading note…" />;

  if (!loading && note) {
    content = (
      <NoteDetail
        note={note}
        projectId={params.id}
        onEdit={() => router.push(`/project/${params.id}/canvas/${params.noteId}`)}
        onDelete={() => {
          deleteNote(params.noteId);
          router.push(`/project/${params.id}`);
        }}
      />
    );
  }

  if (!loading && !note) {
    content = (
      <Alert>
        <AlertDescription className="py-8 text-center">Note not found.</AlertDescription>
      </Alert>
    );
  }

  if (error && !note && !loading) {
    content = (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return content;
}
