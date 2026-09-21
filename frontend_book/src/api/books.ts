import type { Paginated } from '../types/api';
import type { AdminBook, Book } from '../types/book';
import { api } from './client';

export interface BookQuery {
  search?: string;
  category?: string;
  categoryId?: string;
  featured?: 'true' | 'false';
  bestSeller?: 'true' | 'false';
  ebook?: 'true' | 'false';
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title';
}

function toQueryString(query: BookQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const booksApi = {
  list: (query: BookQuery = {}) => api.get<Paginated<Book>>(`/books${toQueryString(query)}`),
  get: (id: string) => api.get<Book>(`/books/${id}`),
};

export const adminBooksApi = {
  list: (query: BookQuery & { isActive?: 'true' | 'false' } = {}) =>
    api.get<Paginated<AdminBook>>(`/admin/books${toQueryString(query)}`, true),
  get: (id: string) => api.get<AdminBook>(`/admin/books/${id}`, true),
  create: (body: unknown) => api.post<AdminBook>('/admin/books', body, true),
  update: (id: string, body: unknown) => api.patch<AdminBook>(`/admin/books/${id}`, body, true),
  remove: (id: string) => api.delete<{ id: string; isActive: boolean }>(`/admin/books/${id}`, true),
  uploadImages: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.upload<AdminBook['images']>(`/admin/books/${id}/images`, formData);
  },
  deleteImage: (bookId: string, imageId: string) =>
    api.delete<{ id: string; deleted: boolean }>(
      `/admin/books/${bookId}/images/${imageId}`,
      true
    ),
  setPrimaryImage: (bookId: string, imageId: string) =>
    api.patch<{ id: string; isPrimary: boolean }>(
      `/admin/books/${bookId}/images/${imageId}/primary`,
      {},
      true
    ),
  reorderImages: (bookId: string, images: Array<{ id: string; sortOrder: number }>) =>
    api.patch(`/admin/books/${bookId}/images/reorder`, { images }, true),
};
