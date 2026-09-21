import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export interface CategoryView {
  id: string;
  name: string;
  description: string | null;
  bookCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function listCategories(): Promise<CategoryView[]> {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    bookCount: category._count.books,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }));
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryView> {
  const category = await prisma.category.create({
    data: { name: input.name, description: input.description ?? null },
    include: { _count: { select: { books: true } } },
  });
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    bookCount: category._count.books,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<CategoryView> {
  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
    include: { _count: { select: { books: true } } },
  });
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    bookCount: category._count.books,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { books: true } } },
  });
  if (!category) {
    throw new AppError(404, 'NOT_FOUND', 'Category not found');
  }
  if (category._count.books > 0) {
    throw new AppError(
      409,
      'CATEGORY_IN_USE',
      'This category still has books and cannot be deleted'
    );
  }
  await prisma.category.delete({ where: { id } });
}
