import type { Book, BookImage, Category } from '@prisma/client';

type BookWithRelations = Book & { category?: Category | null; images?: BookImage[] };

function coverPath(images: BookImage[] | undefined): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((image) => image.isPrimary);
  return (primary ?? images[0])?.path ?? null;
}

/** Public shape. Never includes googleDriveUrl. */
export function serializePublicBook(book: BookWithRelations) {
  return {
    id: book.id,
    categoryId: book.categoryId,
    category: book.category ? { id: book.category.id, name: book.category.name } : null,
    title: book.title,
    author: book.author,
    description: book.description,
    price: book.price,
    language: book.language,
    pages: book.pages,
    publisher: book.publisher,
    format: book.format,
    rating: book.rating,
    isEbook: book.isEbook,
    isFeatured: book.isFeatured,
    isBestSeller: book.isBestSeller,
    coverImage: coverPath(book.images),
    images: (book.images ?? []).map((image) => ({
      id: image.id,
      path: image.path,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    })),
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}

/** Admin shape. Includes googleDriveUrl. */
export function serializeAdminBook(book: BookWithRelations) {
  return {
    ...serializePublicBook(book),
    isActive: book.isActive,
    googleDriveUrl: book.googleDriveUrl,
  };
}
