import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  orderId: z.string().uuid('A valid order is required'),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
