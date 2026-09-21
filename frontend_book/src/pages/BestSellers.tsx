import { Trophy } from 'lucide-react';
import { useState } from 'react';
import BookGrid from '../components/books/BookGrid';
import Pagination from '../components/books/Pagination';
import { useT } from '../contexts/LanguageContext';
import { useBooks } from '../hooks/useBooks';

export default function BestSellers() {
  const t = useT();
  const [page, setPage] = useState(1);
  const { books, pagination, loading, error } = useBooks({
    page,
    limit: 12,
    bestSeller: 'true',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white">
          <Trophy className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t.bestSellers.heading}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.bestSellers.subheading}</p>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <BookGrid
        books={books}
        loading={loading}
        emptyText={t.books.noResults}
        skeletonCount={12}
      />

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  );
}
