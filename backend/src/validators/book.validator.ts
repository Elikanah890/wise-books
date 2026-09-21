import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''));

const emptyToUndefined = (value: unknown): unknown =>
  value === '' || value === null || value === undefined ? undefined : value;

const optionalInt = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int('Pages must be a whole number').nonnegative('Pages cannot be negative').optional()
);

const optionalRating = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(0, 'Rating cannot be below 0').max(5, 'Rating cannot exceed 5').optional()
);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''));

export const createBookSchema = z.object({
  categoryId: z.string().uuid('A valid category is required'),
  title: z.string().trim().min(1, 'Title is required').max(300),
  author: z.string().trim().min(1, 'Author is required').max(200),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().int('Price must be a whole number').nonnegative('Price cannot be negative'),
  language: optionalText(60),
  pages: optionalInt,
  publisher: optionalText(200),
  format: optionalText(40),
  rating: optionalRating,
  googleDriveUrl: optionalUrl,
  isEbook: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const publicBookQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  featured: z.enum(['true', 'false']).optional(),
  bestSeller: z.enum(['true', 'false']).optional(),
  ebook: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'title']).default('newest'),
});

export const adminBookQuerySchema = publicBookQuerySchema.extend({
  isActive: z.enum(['true', 'false']).optional(),
});

export const bookIdParamSchema = z.object({
  id: z.string().uuid('Invalid book id'),
});

export const imageIdParamSchema = z.object({
  id: z.string().uuid('Invalid book id'),
  imageId: z.string().uuid('Invalid image id'),
});

export const reorderImagesSchema = z.object({
  images: z
    .array(
      z.object({
        id: z.string().uuid(),
        sortOrder: z.coerce.number().int().nonnegative(),
      })
    )
    .min(1, 'At least one image is required'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type PublicBookQuery = z.infer<typeof publicBookQuerySchema>;
export type AdminBookQuery = z.infer<typeof adminBookQuerySchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
