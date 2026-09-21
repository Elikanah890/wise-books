import type { Category } from '../types/category';
import { api } from './client';

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
};

export const adminCategoriesApi = {
  list: () => api.get<Category[]>('/admin/categories', true),
  create: (body: { name: string; description?: string }) =>
    api.post<Category>('/admin/categories', body, true),
  update: (id: string, body: { name?: string; description?: string }) =>
    api.patch<Category>(`/admin/categories/${id}`, body, true),
  remove: (id: string) => api.delete<{ id: string }>(`/admin/categories/${id}`, true),
};
