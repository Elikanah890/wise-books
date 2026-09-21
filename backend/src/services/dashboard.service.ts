import { prisma } from '../lib/prisma';
import { ORDER_STATUS } from '../utils/constants';

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfWeek(): Date {
  const today = startOfToday();
  const day = today.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  return monday;
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

async function revenueSince(since: Date | undefined): Promise<number> {
  const result = await prisma.order.aggregate({
    where: { status: ORDER_STATUS.PAID, ...(since ? { createdAt: { gte: since } } : {}) },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getDashboard() {
  const sevenDaysAgo = startOfToday();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [totalBooks, totalOrders, paidOrders, pendingOrders, totalRevenue, recentOrders, paidInWindow] =
    await Promise.all([
      prisma.book.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: ORDER_STATUS.PAID } }),
      prisma.order.count({ where: { status: ORDER_STATUS.PENDING } }),
      revenueSince(undefined),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { book: { select: { id: true, title: true } } },
      }),
      prisma.order.findMany({
        where: { status: ORDER_STATUS.PAID, createdAt: { gte: sevenDaysAgo } },
        select: { amount: true, createdAt: true },
      }),
    ]);

  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(sevenDaysAgo);
    day.setDate(sevenDaysAgo.getDate() + offset);
    const key = day.toISOString().slice(0, 10);
    days.push({ date: key, revenue: 0, orders: 0 });
  }

  for (const order of paidInWindow) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = days.find((day) => day.date === key);
    if (bucket) {
      bucket.revenue += order.amount;
      bucket.orders += 1;
    }
  }

  return {
    totals: { totalBooks, totalOrders, paidOrders, pendingOrders, totalRevenue },
    recentOrders,
    salesLast7Days: days,
  };
}

export async function getRevenue() {
  const [today, week, month, allTime, topBooks] = await Promise.all([
    revenueSince(startOfToday()),
    revenueSince(startOfWeek()),
    revenueSince(startOfMonth()),
    revenueSince(undefined),
    prisma.order.groupBy({
      by: ['bookId'],
      where: { status: ORDER_STATUS.PAID },
      _count: { bookId: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    }),
  ]);

  const bookIds = topBooks.map((row) => row.bookId);
  const books = await prisma.book.findMany({
    where: { id: { in: bookIds } },
    select: { id: true, title: true, author: true },
  });
  const bookMap = new Map(books.map((book) => [book.id, book]));

  return {
    revenue: { today, week, month, allTime },
    topBooks: topBooks.map((row) => ({
      bookId: row.bookId,
      title: bookMap.get(row.bookId)?.title ?? 'Unknown',
      author: bookMap.get(row.bookId)?.author ?? '',
      orders: row._count.bookId,
      revenue: row._sum.amount ?? 0,
    })),
  };
}
