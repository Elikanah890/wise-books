import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import {
  ORDER_STATUS,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  type PaymentStatus,
} from '../utils/constants';
import { normalizeTzPhone } from '../utils/phone';
import { generateDownloadToken } from '../utils/token';
import * as payme from './payme.service';

const CALLBACK_MAX_AGE_MS = 5 * 60 * 1000;
export const PAYME_REFERENCE_PREFIX = 'ORDER_';

export function referenceForOrder(orderId: string): string {
  return `${PAYME_REFERENCE_PREFIX}${orderId}`;
}

export function orderIdFromReference(reference: string): string | null {
  if (typeof reference !== 'string' || !reference.startsWith(PAYME_REFERENCE_PREFIX)) {
    return null;
  }
  const id = reference.slice(PAYME_REFERENCE_PREFIX.length);
  return id.length > 0 ? id : null;
}

/** Starts a mobile-money collection. Amount always comes from the order, never the client. */
export async function initiatePayment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new AppError(404, 'NOT_FOUND', 'Order not found');
  }
  if (order.status !== ORDER_STATUS.PENDING) {
    throw new AppError(409, 'ORDER_NOT_PENDING', 'This order is not awaiting payment');
  }

  const reference = referenceForOrder(order.id);

  // Defence in depth: never send a non-conforming MSISDN to PayMe, even for
  // legacy orders stored before validation was tightened.
  const msisdn = normalizeTzPhone(order.buyerPhone);
  if (!msisdn) {
    throw new AppError(
      400,
      'INVALID_PHONE',
      'Enter a valid Tanzanian phone number (e.g., 0712345678 or 255712345678)'
    );
  }

  let response: payme.PaymeCollectionResponse;
  try {
    response = await payme.createCollection({
      amount: order.amount, // server-side amount only
      msisdn,
      reference,
      callbackUrl: env.PAYME_CALLBACK_URL,
    });
  } catch (error) {
    const message =
      error instanceof AppError && error.message
        ? error.message
        : 'Could not start the payment. Please try again.';
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        provider: PAYMENT_PROVIDER,
        paymentReference: reference,
        amount: order.amount,
        status: PAYMENT_STATUS.FAILED,
        rawResponse: { error: message } as Prisma.InputJsonValue,
      },
      create: {
        orderId: order.id,
        provider: PAYMENT_PROVIDER,
        paymentReference: reference,
        amount: order.amount,
        status: PAYMENT_STATUS.FAILED,
        rawResponse: { error: message } as Prisma.InputJsonValue,
      },
    });
    throw new AppError(409, 'PAYMENT_INITIATION_FAILED', message);
  }

  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {
      provider: PAYMENT_PROVIDER,
      paymentReference: reference,
      transactionReference: response.transaction_id ?? null,
      amount: order.amount,
      status: PAYMENT_STATUS.PENDING,
      rawResponse: response as Prisma.InputJsonValue,
    },
    create: {
      orderId: order.id,
      provider: PAYMENT_PROVIDER,
      paymentReference: reference,
      transactionReference: response.transaction_id ?? null,
      amount: order.amount,
      status: PAYMENT_STATUS.PENDING,
      rawResponse: response as Prisma.InputJsonValue,
    },
  });

  return {
    paymentId: payment.id,
    orderId: order.id,
    status: payment.status,
    transactionId: payment.transactionReference,
    message: 'USSD prompt sent to your phone',
  };
}

/** Marks a payment + order FAILED. Never issues a download token. */
export async function markPaymentFailed(
  orderId: string,
  reason: string,
  payload?: unknown
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUnique({ where: { orderId } });
    const merged =
      payload && typeof payload === 'object'
        ? { ...(payload as Record<string, unknown>), error: reason }
        : { error: reason };
    if (existing) {
      await tx.payment.update({
        where: { orderId },
        data: { status: PAYMENT_STATUS.FAILED, rawResponse: merged as Prisma.InputJsonValue },
      });
    }
    await tx.order.updateMany({
      where: { id: orderId, status: { not: ORDER_STATUS.PAID } },
      data: { status: ORDER_STATUS.FAILED },
    });
  });
  logger.warn({ orderId, reason }, 'Payment marked FAILED');
}

/** Marks a verified payment COMPLETED and the order PAID. Idempotent; returns the download token. */
export async function markPaymentCompleted(orderId: string, payload: unknown): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }

    await tx.payment.updateMany({
      where: { orderId },
      data: {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
        rawResponse: payload as Prisma.InputJsonValue,
      },
    });

    const token = order.downloadToken ?? generateDownloadToken();
    await tx.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.PAID, downloadToken: token },
    });
    return token;
  });
}

/**
 * Returns true when the amount confirmed by PayMe is acceptable for the order.
 * Exact match always passes. A configured tolerance allows for the provider's
 * transaction fee, but anything below (amount - tolerance) is rejected.
 */
export function amountIsAcceptable(received: number, expected: number): boolean {
  if (!Number.isFinite(received)) return false;
  if (received === expected) return true;
  const tolerance = Math.round((expected * env.PAYME_AMOUNT_TOLERANCE_PERCENT) / 100);
  return received >= expected - tolerance && received <= expected;
}

function assertFreshTimestamp(timestamp: string | undefined): void {
  if (!timestamp) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Missing callback timestamp');
  }
  const parsedNumber = Number(timestamp);
  const parsed = parsedNumber < 1e12 ? parsedNumber * 1000 : parsedNumber;
  if (!Number.isFinite(parsed)) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Invalid callback timestamp');
  }
  if (Date.now() - parsed > CALLBACK_MAX_AGE_MS) {
    throw new AppError(401, 'STALE_CALLBACK', 'Callback timestamp is too old');
  }
}

interface PaymeWebhookPayload {
  transid?: string;
  reference?: string;
  result?: string;
  payment_status?: string;
  amount?: string | number;
  msisdn?: string;
  [key: string]: unknown;
}

export type PaymeWebhookOutcome = 'FAILED' | 'PENDING' | 'COMPLETED';

/**
 * PayMe uses "SUCCESS" for a settled payment (the documented "COMPLETED" never
 * appears in the live responses). We accept both so the code works whether the
 * provider reports SUCCESS or COMPLETED.
 */
export function isPaymeSuccess(status: unknown): boolean {
  const value = String(status ?? '').toUpperCase();
  return value === 'SUCCESS' || value === 'COMPLETED';
}

/**
 * Classifies a PayMe webhook. A webhook may only be treated as COMPLETED when
 * PayMe reports payment_status = SUCCESS or COMPLETED. The "wallet push
 * successful" notification arrives with result=SUCCESS but payment_status
 * =PENDING and MUST be treated as PENDING (otherwise the book is released
 * before the customer has actually paid).
 */
export function classifyWebhook(payload: {
  result?: string;
  payment_status?: string;
}): PaymeWebhookOutcome {
  const status = String(payload.payment_status ?? '').toUpperCase();
  const result = String(payload.result ?? '').toUpperCase();
  if (isPaymeSuccess(status)) return 'COMPLETED';
  if (status === 'FAILED' || result === 'FAILED') return 'FAILED';
  return 'PENDING';
}

/**
 * Handles a PayMe webhook. Signature + timestamp are verified before any state
 * change, and the returned amount must match the order amount exactly.
 */
export async function handleCallback(
  rawBody: Buffer,
  signature: string | undefined,
  timestamp: string | undefined
): Promise<{ received: true; idempotent?: boolean; pending?: boolean }> {
  assertFreshTimestamp(timestamp);

  if (!payme.verifyWebhookSignature(rawBody, signature, timestamp)) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Callback signature verification failed');
  }

  let payload: PaymeWebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString('utf8')) as PaymeWebhookPayload;
  } catch {
    throw new AppError(400, 'INVALID_CALLBACK', 'Malformed callback body');
  }

  const orderId = orderIdFromReference(String(payload.reference ?? ''));
  if (!orderId) {
    throw new AppError(404, 'NOT_FOUND', 'Unknown payment reference');
  }

  const payment = await prisma.payment.findFirst({
    where: { paymentReference: referenceForOrder(orderId) },
    include: { order: true },
  });
  if (!payment) {
    throw new AppError(404, 'NOT_FOUND', 'Payment not found');
  }

  // Idempotent replay.
  if (payment.status === PAYMENT_STATUS.COMPLETED) {
    return { received: true, idempotent: true };
  }

  // CRITICAL: only a provider-CONFIRMED 'COMPLETED' status may release the book.
  // PayMe also sends a "wallet push" notification with result=SUCCESS but
  // payment_status=PENDING the moment the USSD prompt is sent — that must NOT
  // mark the order PAID. Anything that is not COMPLETED is acknowledged only.
  const outcome = classifyWebhook(payload);

  if (outcome === 'FAILED') {
    await markPaymentFailed(orderId, 'Provider reported a failed payment', payload);
    throw new AppError(400, 'PAYMENT_FAILED', 'Payment was not successful');
  }

  if (outcome === 'PENDING') {
    return { received: true, pending: true };
  }

  const receivedAmount = Number(payload.amount);
  if (!amountIsAcceptable(receivedAmount, payment.order.amount)) {
    logger.warn(
      {
        reference: payment.paymentReference,
        expected: payment.order.amount,
        received: payload.amount,
        tolerancePercent: env.PAYME_AMOUNT_TOLERANCE_PERCENT,
      },
      'Payment amount mismatch — refusing to mark PAID'
    );
    await markPaymentFailed(
      orderId,
      `Amount mismatch: expected ${payment.order.amount}, received ${payload.amount}`,
      payload
    );
    throw new AppError(400, 'AMOUNT_MISMATCH', 'Payment amount does not match the order');
  }

  // Second, independent confirmation straight from PayMe before releasing the
  // download. The webhook is signed, but we only mark PAID once the live query
  // reports provider_checked === true and payment_status === COMPLETED.
  const reference = payment.paymentReference ?? referenceForOrder(orderId);
  let verification: payme.PaymeQueryResponse;
  try {
    verification = await payme.queryTransaction(reference);
  } catch (error) {
    logger.warn(
      { reference, err: (error as Error).message },
      'Could not verify webhook with PayMe — leaving PENDING for polling'
    );
    return { received: true, pending: true };
  }

  // NOTE: live PayMe /query returns payment_status = "SUCCESS" (not "COMPLETED")
  // and may return provider_checked = false even for a settled payment, so we
  // trust the payment_status value itself.
  if (!isPaymeSuccess(verification.payment_status)) {
    logger.warn(
      { reference, verifiedStatus: verification.payment_status },
      'Webhook said completed but PayMe query did not confirm — leaving PENDING'
    );
    return { received: true, pending: true };
  }

  const verifiedAmount = Number(verification.amount);
  if (!amountIsAcceptable(verifiedAmount, payment.order.amount)) {
    logger.warn(
      { reference, expected: payment.order.amount, received: verification.amount },
      'Verified amount mismatch — refusing to mark PAID'
    );
    await markPaymentFailed(
      orderId,
      `Amount mismatch (verified): expected ${payment.order.amount}, received ${verification.amount}`,
      verification
    );
    throw new AppError(400, 'AMOUNT_MISMATCH', 'Payment amount does not match the order');
  }

  await markPaymentCompleted(orderId, verification);
  return { received: true };
}

export async function getPaymentStatus(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          amount: true,
          bookId: true,
          downloadToken: true,
          book: { select: { title: true } },
        },
      },
    },
  });
  if (!payment) {
    throw new AppError(404, 'NOT_FOUND', 'Payment not found');
  }

  return {
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    orderId: payment.orderId,
    orderStatus: payment.order.status,
    bookId: payment.order.bookId,
    bookTitle: payment.order.book?.title ?? null,
    downloadToken: payment.order.status === ORDER_STATUS.PAID ? payment.order.downloadToken : null,
  };
}

export async function listPayments(query: {
  status?: PaymentStatus;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.PaymentWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  const skip = (query.page - 1) * query.limit;
  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
      include: {
        order: {
          select: {
            id: true,
            buyerEmail: true,
            buyerPhone: true,
            book: { select: { id: true, title: true } },
          },
        },
      },
    }),
  ]);

  return {
    items: payments,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
