import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const tagIdParamSchema = z.object({
  id: z.string().uuid(),
});
