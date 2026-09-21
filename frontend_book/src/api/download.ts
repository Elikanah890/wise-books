import { api } from './client';

export const downloadApi = {
  resolve: (token: string) => api.get<{ title: string; url: string }>(`/download/${token}`),
};
