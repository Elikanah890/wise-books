import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { DashboardData } from '../../types/admin';
import { formatCurrency, formatDate, orderStatusClasses } from '../../utils/helpers';

const statCards = [
  { key: 'totalBooks', label: 'Active books' },
  { key: 'totalOrders', label: 'Total orders' },
  { key: 'paidOrders', label: 'Paid orders' },
  { key: 'pendingOrders', label: 'Pending orders' },
] as const;

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <p className="text-gray-500">Could not load the dashboard.</p>;

  const maxRevenue = Math.max(1, ...data.salesLast7Days.map((day) => day.revenue));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.key} className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {data.totals[card.key].toLocaleString()}
            </p>
          </Card>
        ))}
        <Card className="p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total revenue</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(data.totals.totalRevenue)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          Sales — last 7 days
        </h2>
        <div className="flex h-48 items-end gap-3">
          {data.salesLast7Days.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-blue-500"
                  style={{ height: `${Math.max(4, (day.revenue / maxRevenue) * 100)}%` }}
                  title={`${formatCurrency(day.revenue)} • ${day.orders} orders`}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {day.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium">Book</th>
                <th className="px-6 py-3 font-medium">Buyer</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{order.book.title}</td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{order.buyerEmail}</td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${orderStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
