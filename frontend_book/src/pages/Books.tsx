import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import BookGrid from '../components/books/BookGrid';
import Pagination from '../components/books/Pagination';
import { useT } from '../contexts/LanguageContext';
import { useBooks } from '../hooks/useBooks';
import type { Category } from '../types/category';
import type { BookQuery } from '../api/books';

export default function Books() {
  const t = useT();
  const sortOptions: Array<{ value: NonNullable<BookQuery['sort']>; label: string }> = [
    { value: 'newest', label: t.books.sortNewest },
    { value: 'oldest', label: t.books.sortOldest },
    { value: 'price_asc', label: t.books.sortPriceAsc },
    { value: 'price_desc', label: t.books.sortPriceDesc },
    { value: 'title', label: t.books.sortTitle },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = (searchParams.get('sort') as BookQuery['sort']) ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1');
  const flag = (key: string): 'true' | undefined =>
    searchParams.get(key) === 'true' ? 'true' : undefined;

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { books, pagination, loading, error } = useBooks({
    search: search || undefined,
    category: category || undefined,
    ebook: flag('ebook'),
    featured: flag('featured'),
    bestSeller: flag('bestSeller'),
    sort,
    page,
    limit: 12,
  });

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t.books.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {pagination.total} {t.categories.bookCount}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ search: searchInput.trim() || undefined });
          }}
          className="relative flex-1"
          role="search"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t.books.searchPlaceholder}
            aria-label={t.books.searchPlaceholder}
            className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </form>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={category}
            onChange={(event) => updateParams({ category: event.target.value || undefined })}
            aria-label={t.books.allCategories}
            className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">{t.books.allCategories}</option>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
            aria-label={t.books.sortBy}
            className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <BookGrid books={books} loading={loading} emptyText={t.books.noResults} skeletonCount={12} />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onChange={(nextPage) => updateParams({ page: String(nextPage) })}
      />
    </div>
  );
}
