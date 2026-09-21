import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { RevenueData } from '../../types/admin';
import { formatCurrency } from '../../utils/helpers';

const periods = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'allTime', label: 'All time' },
] as const;

export default function AdminRevenue() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .revenue()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <p className="text-gray-500">Could not load revenue data.</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {periods.map((period) => (
          <Card key={period.key} className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{period.label}</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(data.revenue[period.key])}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top selling books</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 font-medium">Book</th>
              <th className="px-6 py-3 font-medium">Author</th>
              <th className="px-6 py-3 font-medium">Orders</th>
              <th className="px-6 py-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.topBooks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No sales yet.
                </td>
              </tr>
            ) : (
              data.topBooks.map((book) => (
                <tr key={book.bookId}>
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{book.title}</td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{book.author}</td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{book.orders}</td>
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(book.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
