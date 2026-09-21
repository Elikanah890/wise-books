import path from 'node:path';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { deleteUploadedFile } from '../utils/file';
import { serializeAdminBook, serializePublicBook } from '../utils/serialize';
import type {
  AdminBookQuery,
  CreateBookInput,
  PublicBookQuery,
  ReorderImagesInput,
  UpdateBookInput,
} from '../validators/book.validator';

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const bookInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.BookInclude;

function sortToOrderBy(sort: PublicBookQuery['sort']): Prisma.BookOrderByWithRelationInput {
  switch (sort) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'title':
      return { title: 'asc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
}

function buildListWhere(
  query: PublicBookQuery,
  activeOnly: boolean,
  isActive?: boolean
): Prisma.BookWhereInput {
  const where: Prisma.BookWhereInput = {};

  if (activeOnly) {
    where.isActive = true;
  } else if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  } else if (query.category) {
    where.category = { name: { equals: query.category } };
  }

  if (query.search) {
    where.OR = [{ title: { contains: query.search } }, { author: { contains: query.search } }];
  }

  if (query.featured === 'true') where.isFeatured = true;
  if (query.bestSeller === 'true') where.isBestSeller = true;
  if (query.ebook === 'true') where.isEbook = true;

  return where;
}

async function paginateBooks(
  query: PublicBookQuery,
  activeOnly: boolean,
  isActive: boolean | undefined,
  mapFn: (book: Awaited<ReturnType<typeof findBooks>>[number]) => unknown
): Promise<Paginated<unknown>> {
  const where = buildListWhere(query, activeOnly, isActive);
  const skip = (query.page - 1) * query.limit;

  const [total, books] = await Promise.all([
    prisma.book.count({ where }),
    findBooks(where, sortToOrderBy(query.sort), skip, query.limit),
  ]);

  return {
    items: books.map(mapFn),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

function findBooks(
  where: Prisma.BookWhereInput,
  orderBy: Prisma.BookOrderByWithRelationInput,
  skip: number,
  take: number
) {
  return prisma.book.findMany({ where, orderBy, skip, take, include: bookInclude });
}

export async function listPublicBooks(query: PublicBookQuery): Promise<Paginated<unknown>> {
  return paginateBooks(query, true, undefined, serializePublicBook);
}

export async function listAdminBooks(query: AdminBookQuery): Promise<Paginated<unknown>> {
  const isActive =
    query.isActive === undefined ? undefined : query.isActive === 'true';
  return paginateBooks(query, false, isActive, serializeAdminBook);
}

export async function getPublicBook(id: string) {
  const book = await prisma.book.findFirst({
    where: { id, isActive: true },
    include: bookInclude,
  });
  if (!book) {
    throw new AppError(404, 'NOT_FOUND', 'Book not found');
  }
  return serializePublicBook(book);
}

export async function getAdminBook(id: string) {
  const book = await prisma.book.findUnique({ where: { id }, include: bookInclude });
  if (!book) {
    throw new AppError(404, 'NOT_FOUND', 'Book not found');
  }
  return serializeAdminBook(book);
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new AppError(400, 'INVALID_CATEGORY', 'The selected category does not exist');
  }
}

export async function createBook(input: CreateBookInput) {
  await assertCategoryExists(input.categoryId);
  const book = await prisma.book.create({
    data: {
      categoryId: input.categoryId,
      title: input.title,
      author: input.author,
      description: input.description ?? null,
      price: input.price,
      language: input.language ? input.language : 'English',
      pages: input.pages ?? null,
      publisher: input.publisher ? input.publisher : null,
      format: input.format ? input.format : 'PDF',
      rating: input.rating ?? null,
      googleDriveUrl: input.googleDriveUrl ? input.googleDriveUrl : null,
      isEbook: input.isEbook ?? Boolean(input.googleDriveUrl),
      isFeatured: input.isFeatured ?? false,
      isBestSeller: input.isBestSeller ?? false,
      isActive: input.isActive ?? true,
    },
    include: bookInclude,
  });
  return serializeAdminBook(book);
}

export async function updateBook(id: string, input: UpdateBookInput) {
  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Book not found');
  }
  if (input.categoryId) {
    await assertCategoryExists(input.categoryId);
  }

  const book = await prisma.book.update({
    where: { id },
    data: {
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.author !== undefined ? { author: input.author } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.language !== undefined ? { language: input.language || 'English' } : {}),
      ...(input.pages !== undefined ? { pages: input.pages ?? null } : {}),
      ...(input.publisher !== undefined
        ? { publisher: input.publisher ? input.publisher : null }
        : {}),
      ...(input.format !== undefined ? { format: input.format || 'PDF' } : {}),
      ...(input.rating !== undefined ? { rating: input.rating ?? null } : {}),
      ...(input.googleDriveUrl !== undefined
        ? { googleDriveUrl: input.googleDriveUrl ? input.googleDriveUrl : null }
        : {}),
      ...(input.isEbook !== undefined ? { isEbook: input.isEbook } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.isBestSeller !== undefined ? { isBestSeller: input.isBestSeller } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: bookInclude,
  });
  return serializeAdminBook(book);
}

export async function softDeleteBook(id: string): Promise<void> {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw new AppError(404, 'NOT_FOUND', 'Book not found');
  }
  await prisma.book.update({ where: { id }, data: { isActive: false } });
}

export async function addBookImages(bookId: string, files: Express.Multer.File[]) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { images: true },
  });
  if (!book) {
    throw new AppError(404, 'NOT_FOUND', 'Book not found');
  }
  if (files.length === 0) {
    throw new AppError(400, 'NO_FILES', 'At least one image is required');
  }

  const hasPrimary = book.images.some((image) => image.isPrimary);
  const maxSortOrder = book.images.reduce(
    (max, image) => Math.max(max, image.sortOrder),
    -1
  );

  const created = await prisma.$transaction(
    files.map((file, index) =>
      prisma.bookImage.create({
        data: {
          bookId,
          path: path.relative(process.cwd(), file.path),
          isPrimary: !hasPrimary && index === 0,
          sortOrder: maxSortOrder + 1 + index,
        },
      })
    )
  );

  return created.map((image) => ({
    id: image.id,
    path: image.path,
    isPrimary: image.isPrimary,
    sortOrder: image.sortOrder,
  }));
}

export async function deleteBookImage(bookId: string, imageId: string): Promise<void> {
  const image = await prisma.bookImage.findFirst({ where: { id: imageId, bookId } });
  if (!image) {
    throw new AppError(404, 'NOT_FOUND', 'Image not found');
  }

  await prisma.bookImage.delete({ where: { id: image.id } });
  await deleteUploadedFile(image.path);

  if (image.isPrimary) {
    const next = await prisma.bookImage.findFirst({
      where: { bookId },
      orderBy: { sortOrder: 'asc' },
    });
    if (next) {
      await prisma.bookImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }
}

export async function setPrimaryBookImage(bookId: string, imageId: string) {
  const image = await prisma.bookImage.findFirst({ where: { id: imageId, bookId } });
  if (!image) {
    throw new AppError(404, 'NOT_FOUND', 'Image not found');
  }

  await prisma.$transaction([
    prisma.bookImage.updateMany({ where: { bookId }, data: { isPrimary: false } }),
    prisma.bookImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  return { id: imageId, isPrimary: true };
}

export async function reorderBookImages(bookId: string, input: ReorderImagesInput) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { images: true },
  });
  if (!book) {
    throw new AppError(404, 'NOT_FOUND', 'Book not found');
  }

  const ownedIds = new Set(book.images.map((image) => image.id));
  const unknown = input.images.filter((image) => !ownedIds.has(image.id));
  if (unknown.length > 0) {
    throw new AppError(400, 'INVALID_IMAGE', 'One or more images do not belong to this book');
  }

  await prisma.$transaction(
    input.images.map((image) =>
      prisma.bookImage.update({
        where: { id: image.id },
        data: { sortOrder: image.sortOrder },
      })
    )
  );

  return prisma.bookImage.findMany({
    where: { bookId },
    orderBy: { sortOrder: 'asc' },
  });
}
