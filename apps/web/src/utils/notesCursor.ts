const NOTE_CURSOR_PATTERN = /^([01]):(.+)$/;

export type NoteListCursor = {
  is_completed: boolean;
  updated_at: string;
};

export function encodeNoteListCursor(isCompleted: boolean, updatedAt: string): string {
  return `${isCompleted ? "1" : "0"}:${updatedAt}`;
}

export function decodeNoteListCursor(cursor: string): NoteListCursor | null {
  const match = cursor.match(NOTE_CURSOR_PATTERN);

  if (!match || !match[2]) {
    return null;
  }

  return {
    is_completed: match[1] === "1",
    updated_at: match[2],
  };
}

export const NOTE_COMPLETE_REORDER_DELAY_MS = 350;
export const NOTE_ROW_EXIT_DURATION_MS = 300;
