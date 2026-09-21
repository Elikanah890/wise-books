import type { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import type { InitiatePaymentInput } from '../validators/payment.validator';

export const initiate = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validated?.body as InitiatePaymentInput;
  const result = await paymentService.initiatePayment(body.orderId);
  return sendSuccess(res, result);
});

export const callback = asyncHandler(async (req: Request, res: Response) => {
  if (!req.rawBody) {
    throw new AppError(400, 'INVALID_CALLBACK', 'Missing raw request body');
  }
  const signature =
    (req.headers['x-selcom-signature'] as string | undefined) ??
    (req.headers['x-signature'] as string | undefined);
  const timestamp =
    (req.headers['x-selcom-timestamp'] as string | undefined) ??
    (req.headers['timestamp'] as string | undefined);

  await paymentService.handleCallback(req.rawBody, signature, timestamp);
  return sendSuccess(res, { received: true });
});
