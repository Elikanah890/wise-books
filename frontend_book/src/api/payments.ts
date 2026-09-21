import type { Paginated } from '../types/api';
import type { AdminPayment, PaymentStatus } from '../types/order';
import { api } from './client';

export interface AdminPaymentQuery {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaymentStatusView {
  id: string;
  status: PaymentStatus;
  amount: number;
  orderId: string;
  orderStatus: string;
  bookId: string;
  bookTitle: string | null;
  downloadToken: string | null;
}

export const paymentsApi = {
  initiate: (orderId: string) =>
    api.post<{
      paymentId: string;
      orderId: string;
      status: string;
      transactionId: string | null;
      message: string;
    }>('/payments/payme/initiate', { orderId }),
  status: (paymentId: string) => api.get<PaymentStatusView>(`/payments/${paymentId}/status`),
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
