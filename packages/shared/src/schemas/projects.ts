import { z } from 'zod';

export const createProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, 'Name is required'),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().uuid(),
});
