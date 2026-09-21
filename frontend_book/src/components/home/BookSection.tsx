import { useEffect, useState } from 'react';
import { booksApi, type BookQuery } from '../../api/books';
import type { Book } from '../../types/book';
import BookCard from '../common/BookCard';
import SectionHeading from '../common/SectionHeading';
import { BookGridSkeleton } from '../common/Skeletons';
import { StaggerGroup, StaggerItem } from '../motion';

interface BookSectionProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionTo: string;
  query: BookQuery;
  tone?: 'default' | 'muted';
}

export default function BookSection({
  title,
  subtitle,
  actionLabel,
  actionTo,
  query,
  tone = 'default',
}: BookSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    booksApi
      .list(query)
      .then((result) => {
        if (active) setBooks(result.items);
      })
      .catch(() => {
        if (active) setBooks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)]);

  return (
    <section
      className={
        tone === 'muted'
          ? 'bg-gray-50 dark:bg-gray-900/40'
          : 'bg-transparent'
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          actionLabel={actionLabel}
          actionTo={actionTo}
        />

        {loading ? (
          <BookGridSkeleton count={4} />
        ) : books.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No books available yet.
          </p>
        ) : (
          <StaggerGroup className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <StaggerItem key={book.id}>
                <BookCard book={book} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
}
