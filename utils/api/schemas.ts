import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const createNoteSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1, 'Title is required'),
  text: z.string().default(''),
  tag: z.string().trim().nullable().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1).optional(),
  text: z.string().optional(),
  tag: z.string().trim().nullable().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const notesQuerySchema = z.object({
  projectId: z.string().uuid(),
});
