import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/constants';
import { normalizeTzPhone } from '../utils/phone';

const INVALID_PHONE_MESSAGE =
  'Enter a valid Tanzanian phone number (e.g., 0712345678 or 255712345678)';

export const createOrderSchema = z.object({
  bookId: z.string().uuid('A valid book is required'),
  buyerEmail: z.string().trim().email('A valid email is required'),
  buyerPhone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const normalized = normalizeTzPhone(value);
      if (!normalized) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: INVALID_PHONE_MESSAGE,
          params: { errorCode: 'INVALID_PHONE' },
        });
        return z.NEVER;
      }
      return normalized;
    }),
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
