"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotes } from "@/context/NoteProvider";
import { GlowButton } from "@/components/glow-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CanvasProps = {
  projectId: string;
  noteId?: string;
};

type Draft = {
  title: string;
  text: string;
  tag: string;
};

function emptyDraft(): Draft {
  return { title: "", text: "", tag: "" };
}

export function Canvas({ projectId, noteId }: CanvasProps) {
  const router = useRouter();
  const { createNote, updateNote, getNote } = useNotes();
  const existing = noteId ? getNote(noteId) : undefined;
  const [draftOverride, setDraftOverride] = useState<Draft | null>(null);

  function getBaseDraft(): Draft {
    let base = emptyDraft();

    if (existing) {
      base = {
        title: existing.title,
        text: existing.text,
        tag: existing.tag ?? "",
      };
    }

    return base;
  }

  const draft = draftOverride ?? getBaseDraft();

  useEffect(() => {
    const titleInput = document.getElementById("canvas-title");
    titleInput?.focus();
  }, []);

  function updateDraft(field: keyof Draft, value: string) {
    const current = draftOverride ?? getBaseDraft();
    const next = { ...current, [field]: value };
    setDraftOverride(next);
  }

  function handleSaveAndClose() {
    const trimmedTitle = draft.title.trim() || "Untitled";
    const tag = draft.tag.trim() || null;

    if (noteId) {
      updateNote(noteId, {
        title: trimmedTitle,
        text: draft.text,
        tag,
      });
    } else {
      createNote(trimmedTitle, draft.text, tag);
    }

    router.push(`/project/${projectId}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-6 sm:px-10">
      <div className="mb-12 flex items-center justify-between">
        <Link href={`/project/${projectId}`} className="text-label text-muted-foreground hover:text-foreground">
          ← Close
        </Link>
        <span className="text-label text-muted-foreground" role="status">
          Ready
        </span>
        <GlowButton type="button" onClick={handleSaveAndClose}>
          Save
        </GlowButton>
      </div>

      <Input
        id="canvas-title"
        className="input-bare text-display mb-8 h-auto glow-text-intense shadow-none focus-visible:ring-0"
        value={draft.title}
        onChange={(event) => updateDraft("title", event.target.value)}
        placeholder="Title"
        aria-label="Note title"
      />

      <Input
        className="input-bare text-caption mb-6 h-auto text-muted-foreground shadow-none focus-visible:ring-0"
        value={draft.tag}
        onChange={(event) => updateDraft("tag", event.target.value)}
        placeholder="tag"
        aria-label="Note tag"
      />

      <Textarea
        className="input-bare text-body min-h-[50vh] flex-1 resize-none shadow-none focus-visible:ring-0"
        value={draft.text}
        onChange={(event) => updateDraft("text", event.target.value)}
        placeholder="Start writing…"
        aria-label="Note content"
      />
    </div>
  );
}
