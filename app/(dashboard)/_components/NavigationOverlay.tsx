"use client";

import { useNavigation } from "@/context/NavigationProvider";
import { NoteDetailSkeleton } from "@/components/skeletons/NoteDetailSkeleton";
import { NoteListSkeleton } from "@/components/skeletons/NoteListSkeleton";
import { ProjectListSkeleton } from "@/components/skeletons/ProjectListSkeleton";

export function NavigationOverlay() {
  const { pending } = useNavigation();

  let overlay = null;

  if (pending) {
    let skeleton = <ProjectListSkeleton />;

    if (pending.type === "notes") {
      skeleton = <NoteListSkeleton />;
    }

    if (pending.type === "note") {
      skeleton = <NoteDetailSkeleton />;
    }

    overlay = (
      <div className="absolute inset-0 z-40 bg-background" aria-busy="true" aria-live="polite">
        {skeleton}
      </div>
    );
  }

  return overlay;
}
