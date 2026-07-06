import type { Database } from '@notos/shared';

export type Project = Database['public']['Tables']['projects']['Row'];

export type ProjectWithCount = Project & {
  note_count: number;
};

export type Note = Database['public']['Tables']['notes']['Row'] & {
  tags: string[];
};

export type TagWithCount = {
  id: string;
  name: string;
  note_count: number;
  created_at: string;
};
