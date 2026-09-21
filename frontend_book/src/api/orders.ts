import type { AdminOrder, OrderStatusView } from '../types/order';
import type { Paginated } from '../types/api';
import { api } from './client';

export interface AdminOrderQuery {
  status?: string;
  email?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = {
  create: (body: { bookId: string; buyerEmail: string; buyerPhone: string }) =>
    api.post<{ id: string; bookId: string; amount: number; status: string }>('/orders', body),
  status: (id: string) => api.get<OrderStatusView>(`/orders/${id}/status`),
};

export const adminOrdersApi = {
  list: (query: AdminOrderQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return api.get<Paginated<AdminOrder>>(`/admin/orders${qs ? `?${qs}` : ''}`, true);
  },
};
