import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { ORDER_STATUS, PAYMENT_STATUS, type PaymentStatus } from '../utils/constants';
import { generateDownloadToken } from '../utils/token';
import * as selcom from './selcom.service';

const CALLBACK_MAX_AGE_MS = 5 * 60 * 1000;
const STALE_PENDING_MS = 3 * 60 * 1000;

export async function initiatePayment(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { book: true },
  });
  if (!order) {
    throw new AppError(404, 'NOT_FOUND', 'Order not found');
  }
  if (order.status !== ORDER_STATUS.PENDING) {
    throw new AppError(409, 'ORDER_NOT_PENDING', 'This order is not awaiting payment');
  }

  // Throws SELCOM_NOT_CONFIGURED (503) while the integration awaits official docs.
  const result = await selcom.createOrder({
    orderId: order.id,
    amount: order.amount,
    buyerEmail: order.buyerEmail,
    buyerPhone: order.buyerPhone,
    bookTitle: order.book.title,
  });

  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {
      provider: 'selcom',
      paymentReference: result.paymentReference,
      transactionReference: result.transactionReference ?? null,
      amount: order.amount,
      rawResponse: result.raw as Prisma.InputJsonValue,
    },
    create: {
      orderId: order.id,
      provider: 'selcom',
      paymentReference: result.paymentReference,
      transactionReference: result.transactionReference ?? null,
      amount: order.amount,
      status: PAYMENT_STATUS.PENDING,
      rawResponse: result.raw as Prisma.InputJsonValue,
    },
  });

  return {
    orderId: order.id,
    orderStatus: order.status,
    paymentStatus: payment.status,
    paymentReference: payment.paymentReference,
  };
}

interface CompletionInput {
  transactionReference?: string;
  paymentReference?: string;
  raw?: unknown;
}

/** Marks a verified payment as completed. Idempotent. */
export async function completePayment(
  orderId: string,
  input: CompletionInput
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }
    if (order.status === ORDER_STATUS.PAID) {
      return;
    }

    const rawJson = input.raw === undefined ? undefined : (input.raw as Prisma.InputJsonValue);

    await tx.payment.upsert({
      where: { orderId },
      update: {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: new Date(),
        ...(input.transactionReference ? { transactionReference: input.transactionReference } : {}),
        ...(input.paymentReference ? { paymentReference: input.paymentReference } : {}),
        ...(rawJson !== undefined ? { rawResponse: rawJson } : {}),
      },
      create: {
        orderId,
        provider: 'selcom',
        status: PAYMENT_STATUS.COMPLETED,
        amount: order.amount,
        paidAt: new Date(),
        transactionReference: input.transactionReference ?? null,
        paymentReference: input.paymentReference ?? null,
        ...(rawJson !== undefined ? { rawResponse: rawJson } : {}),
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.PAID,
        downloadToken: order.downloadToken ?? generateDownloadToken(),
      },
    });
  });
}

function assertFreshTimestamp(timestamp: string | undefined): void {
  if (!timestamp) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Missing callback timestamp');
  }
  const parsed = Number(timestamp) < 1e12 ? Number(timestamp) * 1000 : Number(timestamp);
  if (!Number.isFinite(parsed)) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Invalid callback timestamp');
  }
  if (Date.now() - parsed > CALLBACK_MAX_AGE_MS) {
    throw new AppError(401, 'STALE_CALLBACK', 'Callback timestamp is too old');
  }
}

/**
 * Handles a Selcom callback.
 *
 * Signature and timestamp are verified here. Field mapping for the callback
 * payload is intentionally left unimplemented until the official documentation
 * is provided — we must not invent field names.
 */
export async function handleCallback(
  rawBody: Buffer,
  signature: string | undefined,
  timestamp: string | undefined
): Promise<void> {
  if (!env.selcomConfigured) {
    throw new AppError(503, 'SELCOM_NOT_CONFIGURED', 'Selcom integration is not configured yet');
  }

  assertFreshTimestamp(timestamp);

  const isValid = selcom.verifyCallbackSignature(rawBody, signature, timestamp);
  if (!isValid) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Callback signature verification failed');
  }

  // TODO(official-docs): parse the documented callback payload, extract the
  // order/payment references, re-query Selcom with queryOrderStatus(), and call
  // completePayment() only when Selcom confirms success.
  throw new AppError(
    501,
    'SELCOM_NOT_IMPLEMENTED',
    'Callback processing awaits the official Selcom API documentation'
  );
}

/** Polls Selcom for orders stuck in PENDING (callbacks can be blocked by networks). */
export async function pollStalePendingOrders(): Promise<void> {
  if (!env.selcomConfigured) return;

  const cutoff = new Date(Date.now() - STALE_PENDING_MS);
  const staleOrders = await prisma.order.findMany({
    where: { status: ORDER_STATUS.PENDING, createdAt: { lt: cutoff } },
    include: { payment: true },
    take: 25,
  });

  for (const order of staleOrders) {
    try {
      const status = await selcom.queryOrderStatus(order.id);
      if (status.paid) {
        await completePayment(order.id, {
          transactionReference: status.transactionReference,
          paymentReference: status.paymentReference,
          raw: status.raw,
        });
        logger.info({ orderId: order.id }, 'Polling reconciled a paid order');
      }
    } catch (error) {
      logger.warn({ err: error, orderId: order.id }, 'Order status polling failed');
    }
  }
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
