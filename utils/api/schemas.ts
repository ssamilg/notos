import { z } from 'zod';

export const createProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, 'Name is required'),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const createNoteSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().trim().min(1, 'Title is required'),
  text: z.string().default(''),
  tags: z.array(z.string().trim().min(1)).optional(),
  is_completed: z.boolean().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).optional(),
  text: z.string().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  is_completed: z.boolean().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const notesQuerySchema = z.object({
  projectId: z.string().uuid(),
  cursor: z.string().min(1).optional(),
  search: z.string().trim().optional(),
  tag_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const tagIdParamSchema = z.object({
  id: z.string().uuid(),
});
