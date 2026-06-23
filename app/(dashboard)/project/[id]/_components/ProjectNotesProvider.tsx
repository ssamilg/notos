"use client";

import { NoteProvider } from "@/context/NoteProvider";

type ProjectNotesProviderProps = {
  projectId: string;
  children: React.ReactNode;
};

export function ProjectNotesProvider({ projectId, children }: ProjectNotesProviderProps) {
  return <NoteProvider projectId={projectId}>{children}</NoteProvider>;
}
