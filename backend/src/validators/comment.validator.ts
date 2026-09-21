import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''));

export const createCommentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  location: optionalText(120),
  quote: z.string().trim().min(1, 'Comment text is required').max(600),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateCommentSchema = createCommentSchema.partial();

export const commentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment id'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
