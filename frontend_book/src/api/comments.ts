import type { Comment } from '../types/comment';
import { api } from './client';

export interface CommentInput {
  name: string;
  location?: string;
  quote: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const commentsApi = {
  list: () => api.get<Comment[]>('/comments'),
};

export const adminCommentsApi = {
  list: () => api.get<Comment[]>('/admin/comments', true),
  create: (body: CommentInput) => api.post<Comment>('/admin/comments', body, true),
  update: (id: string, body: Partial<CommentInput>) =>
    api.patch<Comment>(`/admin/comments/${id}`, body, true),
  remove: (id: string) => api.delete<{ id: string; deleted: boolean }>(`/admin/comments/${id}`, true),
};
