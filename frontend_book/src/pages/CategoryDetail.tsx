import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import BookGrid from '../components/books/BookGrid';
import Pagination from '../components/books/Pagination';
import CategoryIcon from '../components/common/CategoryIcon';
import { useT } from '../contexts/LanguageContext';
import { useBooks } from '../hooks/useBooks';
import type { Category } from '../types/category';
import { categorySlug } from '../utils/helpers';

export default function CategoryDetail() {
  const t = useT();
  const { slug } = useParams<{ slug: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'title'>('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  const matchedCategory = categories.find((item) => categorySlug(item) === slug);

  const name = matchedCategory?.name ?? null;
  const description = matchedCategory?.description ?? `${name ?? ''} books`;

  const query = useMemo(
    () => ({ categoryId: matchedCategory?.id ?? undefined, sort, page, limit: 12 }),
    [matchedCategory?.id, sort, page]
  );
  const { books, pagination, loading, error } = useBooks(query);

  const sortOptions = [
    { value: 'newest' as const, label: t.books.sortNewest },
    { value: 'price_asc' as const, label: t.books.sortPriceAsc },
    { value: 'price_desc' as const, label: t.books.sortPriceDesc },
    { value: 'title' as const, label: t.books.sortTitle },
  ];

  if (!name) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
          {t.common.pageNotFound}
        </h1>
        <Link to="/categories" className="mt-4 inline-block text-indigo-600 hover:underline">
          {t.categories.viewAll}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-indigo-600">
          {t.nav.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to="/categories" className="hover:text-indigo-600">
          {t.nav.categories}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-medium text-gray-900 dark:text-white">{name}</span>
      </nav>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <CategoryIcon name={name} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pagination.total} {t.categories.bookCount}
            </p>
          </div>
        </div>

        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as typeof sort);
            setPage(1);
          }}
          aria-label={t.books.sortBy}
          className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {sortOptions.map((option) => (
            <option key={`${option.value}-${option.label}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-8 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{description}</p>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <BookGrid books={books} loading={loading} emptyText={t.categories.noBooks} skeletonCount={8} />

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
    </div>
  );
}
