export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface OrderStatusView {
  id: string;
  status: OrderStatus;
  amount: number;
  bookId: string;
  bookTitle: string;
  downloadToken: string | null;
}

export interface AdminOrder {
  id: string;
  bookId: string;
  amount: number;
  status: OrderStatus;
  buyerEmail: string;
  buyerPhone: string;
  downloadCount: number;
  createdAt: string;
  book: { id: string; title: string; author: string };
  payment: {
    id: string;
    status: PaymentStatus;
    provider: string;
    transactionReference: string | null;
    paidAt: string | null;
  } | null;
}

export interface AdminPayment {
  id: string;
  orderId: string;
  provider: string;
  transactionReference: string | null;
  paymentReference: string | null;
  amount: number;
  status: PaymentStatus;
  rawResponse: unknown;
  paidAt: string | null;
  createdAt: string;
  order: {
    id: string;
    buyerEmail: string;
    buyerPhone: string;
    book: { id: string; title: string };
  };
}
