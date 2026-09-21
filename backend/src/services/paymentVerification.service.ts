import { env } from '../config/env';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from '../utils/constants';
import {
  amountIsAcceptable,
  isPaymeSuccess,
  markPaymentCompleted,
  markPaymentFailed,
  referenceForOrder,
} from './payment.service';
import * as payme from './payme.service';

const STALE_PENDING_MS = 30 * 1000;

/**
 * Fallback reconciliation: webhooks can be blocked by networks, so we poll
 * PayMe for payments that are still PENDING. We only ever mark PAID when the
 * provider query confirms payment_status SUCCESS/COMPLETED and the returned
 * amount is within tolerance of the order amount.
 */
export async function pollPendingPayments(): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_PENDING_MS);
  const payments = await prisma.payment.findMany({
    where: {
      status: PAYMENT_STATUS.PENDING,
      provider: PAYMENT_PROVIDER,
      createdAt: { lt: cutoff },
    },
    include: { order: true },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  logger.info({ candidates: payments.length }, 'PayMe polling run');

  for (const payment of payments) {
    const attempts = Math.floor(
      (Date.now() - payment.createdAt.getTime()) / (env.PAYME_QUERY_INTERVAL_SECONDS * 1000)
    );
    if (attempts > env.PAYME_QUERY_MAX_ATTEMPTS) {
      logger.warn({ paymentId: payment.id }, 'Giving up polling after max attempts');
      continue;
    }

    try {
      const reference = payment.paymentReference ?? referenceForOrder(payment.orderId);
      const result = await payme.queryTransaction(reference);

      // Live PayMe returns payment_status = "SUCCESS" for a settled payment and
      // may report provider_checked = false, so trust the status value.
      if (isPaymeSuccess(result.payment_status)) {
        const received = Number(result.amount);
        if (!amountIsAcceptable(received, payment.order.amount)) {
          logger.warn(
            { paymentId: payment.id, expected: payment.order.amount, received: result.amount },
            'Polling amount mismatch — refusing to mark PAID'
          );
          await markPaymentFailed(
            payment.orderId,
            `Amount mismatch (poll): expected ${payment.order.amount}, received ${result.amount}`,
            result
          );
          continue;
        }
        await markPaymentCompleted(payment.orderId, result);
        logger.info({ paymentId: payment.id }, 'Polling reconciled a completed payment');
      } else if (String(result.payment_status ?? '').toUpperCase() === 'FAILED') {
        await markPaymentFailed(payment.orderId, 'Provider reported a failed payment (poll)', result);
      }
    } catch (error) {
      logger.warn({ paymentId: payment.id, err: (error as Error).message }, 'Payment polling failed');
    }
  }
}
