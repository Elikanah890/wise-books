import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { ORDER_STATUS } from '../utils/constants';
import type { CreateOrderInput, OrderListQuery } from '../validators/order.validator';

export interface OrderStatusView {
  id: string;
  status: string;
  amount: number;
  bookId: string;
  bookTitle: string;
  downloadToken: string | null;
}

export async function createOrder(input: CreateOrderInput) {
  const book = await prisma.book.findFirst({
    where: { id: input.bookId, isActive: true },
  });
  if (!book) {
    throw new AppError(404, 'BOOK_NOT_FOUND', 'The selected book is not available');
  }

  const order = await prisma.order.create({
    data: {
      bookId: book.id,
      amount: book.price,
      buyerEmail: input.buyerEmail.toLowerCase(),
      buyerPhone: input.buyerPhone,
      status: ORDER_STATUS.PENDING,
    },
  });

  return {
    id: order.id,
    bookId: order.bookId,
    amount: order.amount,
    status: order.status,
    buyerEmail: order.buyerEmail,
  };
}

export async function getOrderStatus(id: string): Promise<OrderStatusView> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { book: { select: { title: true } } },
  });
  if (!order) {
    throw new AppError(404, 'NOT_FOUND', 'Order not found');
  }

  return {
    id: order.id,
    status: order.status,
    amount: order.amount,
    bookId: order.bookId,
    bookTitle: order.book.title,
    downloadToken: order.status === ORDER_STATUS.PAID ? order.downloadToken : null,
  };
}

export async function listOrders(query: OrderListQuery) {
  const where: Prisma.OrderWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.email) where.buyerEmail = { contains: query.email };
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  const skip = (query.page - 1) * query.limit;
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
      include: {
        book: { select: { id: true, title: true, author: true } },
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            transactionReference: true,
            paidAt: true,
          },
        },
      },
    }),
  ]);

  return {
    items: orders,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
