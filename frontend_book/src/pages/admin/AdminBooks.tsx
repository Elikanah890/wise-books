import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminBooksApi } from '../../api/books';
import { ApiError } from '../../api/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { AdminBook } from '../../types/book';
import { formatCurrency, getImageUrl } from '../../utils/helpers';

export default function AdminBooks() {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminBooksApi
      .list({ search: search || undefined, limit: 100 })
      .then((result) => setBooks(result.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load books'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (book: AdminBook) => {
    if (!window.confirm(`Deactivate "${book.title}"?`)) return;
    try {
      await adminBooksApi.remove(book.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not deactivate the book');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Books</h1>
        <Link to="/admin/books/new">
          <Button>Add book</Button>
        </Link>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          load();
        }}
        className="flex gap-2"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search books"
          className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Cover</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Drive URL</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No books yet.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-3">
                        <div className="h-14 w-10 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                          {book.coverImage && (
                            <img src={getImageUrl(book.coverImage)} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{book.title}</p>
                        <p className="text-xs text-gray-500">{book.author}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {book.category?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(book.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            book.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {book.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {book.googleDriveUrl ? (
                          <span className="text-green-600" title={book.googleDriveUrl}>Set</span>
                        ) : (
                          <span className="text-red-500">Missing</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/books/${book.id}/edit`}>
                            <Button size="sm" variant="outline">Edit</Button>
                          </Link>
                          {book.isActive && (
                            <Button size="sm" variant="danger" onClick={() => remove(book)}>
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
