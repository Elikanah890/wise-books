import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/constants';

export const createOrderSchema = z.object({
  bookId: z.string().uuid('A valid book is required'),
  buyerEmail: z.string().trim().email('A valid email is required'),
  buyerPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{9,20}$/, 'A valid phone number is required'),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid('Invalid order id'),
});

export const orderListQuerySchema = z.object({
  status: z
    .enum([
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PAID,
      ORDER_STATUS.FAILED,
      ORDER_STATUS.CANCELLED,
    ])
    .optional(),
  email: z.string().trim().min(1).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const paymentListQuerySchema = z.object({
  status: z
    .enum([PAYMENT_STATUS.PENDING, PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.FAILED])
    .optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
