import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  orderId: z.string().uuid('A valid order is required'),
});

export const paymentIdParamSchema = z.object({
  id: z.string().uuid('Invalid payment id'),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
