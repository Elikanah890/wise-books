import { motion } from 'framer-motion';
import { BookOpen, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useT } from '../../contexts/LanguageContext';
import type { Book } from '../../types/book';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { EASE } from '../motion';

export default function BookCard({ book }: { book: Book }) {
  const t = useT();
  const cover = getImageUrl(book.coverImage);
  const isFree = book.price === 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="h-full"
    >
      <Link
        to={`/books/${book.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft transition-shadow hover:shadow-lift dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          {cover ? (
            <img
              src={cover}
              alt={`${book.title} cover`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
              <BookOpen className="h-14 w-14" aria-hidden="true" />
            </div>
          )}

          {isFree && (
            <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
              {t.book.free}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {book.category && (
            <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {book.category.name}
            </span>
          )}
          <h3 className="line-clamp-2 font-semibold text-gray-900 dark:text-white">{book.title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{book.author}</p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              {isFree ? t.book.free : formatCurrency(book.price)}
            </span>
            <span
              className={`inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 ${
                isFree
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
                  : 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900/30 dark:text-indigo-300 dark:group-hover:bg-indigo-600 dark:group-hover:text-white'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
              {isFree ? t.book.free : t.book.buyNow}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
