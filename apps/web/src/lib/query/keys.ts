export type NoteFilters = {
  search?: string;
  tagId?: string;
};

export const queryKeys = {
  projects: ["projects"] as const,
  note: (noteId: string) => ["note", noteId] as const,
  notes: (projectId: string, filters: NoteFilters) =>
    ["notes", projectId, filters.search ?? "", filters.tagId ?? ""] as const,
  tags: ["tags"] as const,
};
