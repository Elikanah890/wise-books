import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Download,
  FileText,
  Globe,
  Layers,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { booksApi } from '../api/books';
import { ApiError } from '../api/client';
import Button from '../components/ui/Button';
import { BookCardSkeleton } from '../components/common/Skeletons';
import { useT } from '../contexts/LanguageContext';
import type { Book } from '../types/book';
import { formatCurrency, getImageUrl, slugify } from '../utils/helpers';
import { EASE } from '../components/motion';

function Rating({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-4 w-4 flex-shrink-0 fill-accent-400 text-accent-400" />
          ))}
        </span>
      </span>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

export default function BookDetail() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'description' | 'details' | 'reviews'>('description');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setTab('description');
    booksApi
      .get(id)
      .then((result) => {
        setBook(result);
        setActiveImage(result.coverImage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the book'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-xl">
            <BookCardSkeleton />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-gray-500 dark:text-gray-400">{error || t.book.notFound}</p>
        <Link to="/books" className="mt-4 inline-block text-indigo-600 hover:underline">
          {t.book.backToBooks}
        </Link>
      </div>
    );
  }

  const images = book.images.length > 0 ? book.images : [];
  const isFree = book.price === 0;

  const tabs = [
    { id: 'description' as const, label: t.book.description },
    { id: 'details' as const, label: t.book.details },
    { id: 'reviews' as const, label: t.book.reviewsTab },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-indigo-600">
          {t.nav.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        {book.category && (
          <>
            <Link to={`/categories/${slugify(book.category.name)}`} className="hover:text-indigo-600">
              {book.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </>
        )}
        <span className="line-clamp-1 font-medium text-gray-900 dark:text-white">{book.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <AnimatePresence mode="wait">
              {activeImage ? (
                <motion.img
                  key={activeImage}
                  src={getImageUrl(activeImage)}
                  alt={`${book.title} cover`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600"
                >
                  <BookOpen className="h-16 w-16" aria-hidden="true" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(image.path)}
                  aria-label={`View image ${image.sortOrder + 1}`}
                  className={`h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === image.path
                      ? 'border-indigo-600'
                      : 'border-transparent hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={getImageUrl(image.path)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {book.category && (
            <Link
              to={`/categories/${slugify(book.category.name)}`}
              className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              {book.category.name}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            {t.book.by} {book.author}
          </p>

          {book.rating != null && (
            <div className="mt-4">
              <Rating value={book.rating} />
            </div>
          )}

          <p className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isFree ? t.book.free : formatCurrency(book.price)}
          </p>

          <Button
            size="lg"
            className="mt-6 w-full sm:w-auto"
            onClick={() => navigate(`/checkout/${book.id}`)}
          >
            {isFree ? t.book.free : t.book.buyNow}
          </Button>

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              {t.book.securePayment}
            </span>
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              {t.book.instantDownload}
            </span>
          </div>

          <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-6" role="tablist">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={`relative pb-3 text-sm font-semibold transition-colors ${
                    tab === item.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {item.label}
                  {tab === item.id && (
                    <motion.span
                      layoutId="book-tab-underline"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            {tab === 'description' && (
              <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
                {book.description?.trim() || t.book.descriptionEmpty}
              </p>
            )}

            {tab === 'details' && (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <FileText className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{t.book.format}</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {book.format}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Globe className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{t.book.language}</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {book.language}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Layers className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{t.book.pages}</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {book.pages ?? '—'}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <BookOpen className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">{t.book.publisher}</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {book.publisher ?? '—'}
                    </dd>
                  </div>
                </div>
              </dl>
            )}

            {tab === 'reviews' && (
              <p className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {t.book.noReviews}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
