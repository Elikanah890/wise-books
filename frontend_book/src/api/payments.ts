import type { Paginated } from '../types/api';
import type { AdminPayment } from '../types/order';
import { api } from './client';

export interface AdminPaymentQuery {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const paymentsApi = {
  initiate: (orderId: string) =>
    api.post<{
      orderId: string;
      orderStatus: string;
      paymentStatus: string;
      paymentReference: string;
    }>('/payments/selcom/initiate', { orderId }),
};

export const adminPaymentsApi = {
  list: (query: AdminPaymentQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return api.get<Paginated<AdminPayment>>(`/admin/payments${qs ? `?${qs}` : ''}`, true);
  },
};
