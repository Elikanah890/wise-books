import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { ORDER_STATUS, PAYMENT_PROVIDER, PAYMENT_STATUS } from '../utils/constants';

export interface DownloadResult {
  title: string;
  url: string;
}

export async function resolveDownload(token: string): Promise<DownloadResult> {
  const order = await prisma.order.findUnique({
    where: { downloadToken: token },
    include: { book: true, payment: true },
  });

  if (!order) {
    throw new AppError(404, 'NOT_FOUND', 'Download link not found');
  }
  if (order.status !== ORDER_STATUS.PAID) {
    throw new AppError(403, 'FORBIDDEN', 'This order has not been paid');
  }

  // Re-verify at delivery time: the payment must be a completed PayMe payment
  // whose amount equals the order amount.
  const payment = order.payment;
  if (
    !payment ||
    payment.provider !== PAYMENT_PROVIDER ||
    payment.status !== PAYMENT_STATUS.COMPLETED ||
    payment.amount !== order.amount
  ) {
    throw new AppError(403, 'FORBIDDEN', 'Payment could not be verified');
  }

  if (!order.book.googleDriveUrl) {
    throw new AppError(404, 'NOT_FOUND', 'No file is available for this book');
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { downloadCount: { increment: 1 } },
  });

  return { title: order.book.title, url: order.book.googleDriveUrl };
}
