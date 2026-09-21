export type AdminRole = 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
}

export interface DashboardData {
  totals: {
    totalBooks: number;
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  recentOrders: Array<{
    id: string;
    amount: number;
    status: string;
    buyerEmail: string;
    createdAt: string;
    book: { id: string; title: string };
  }>;
  salesLast7Days: Array<{ date: string; revenue: number; orders: number }>;
}

export interface RevenueData {
  revenue: { today: number; week: number; month: number; allTime: number };
  topBooks: Array<{
    bookId: string;
    title: string;
    author: string;
    orders: number;
    revenue: number;
  }>;
}
