import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import type { CreateCommentInput, UpdateCommentInput } from '../validators/comment.validator';

const order = [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }];

/** Public: only active comments, in display order. */
export function listPublicComments() {
  return prisma.comment.findMany({ where: { isActive: true }, orderBy: order });
}

/** Admin: every comment, in display order. */
export function listComments() {
  return prisma.comment.findMany({ orderBy: order });
}

export function createComment(input: CreateCommentInput) {
  return prisma.comment.create({
    data: {
      name: input.name,
      location: input.location ? input.location : null,
      quote: input.quote,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateComment(id: string, input: UpdateCommentInput) {
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Comment not found');
  }
  return prisma.comment.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.location !== undefined
        ? { location: input.location ? input.location : null }
        : {}),
      ...(input.quote !== undefined ? { quote: input.quote } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
}

export async function deleteComment(id: string): Promise<void> {
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Comment not found');
  }
  await prisma.comment.delete({ where: { id } });
}
