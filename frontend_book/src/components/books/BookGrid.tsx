import { BookOpen } from 'lucide-react';
import type { Book } from '../../types/book';
import BookCard from '../common/BookCard';
import { BookGridSkeleton } from '../common/Skeletons';
import { StaggerGroup, StaggerItem } from '../motion';

interface BookGridProps {
  books: Book[];
  loading: boolean;
  skeletonCount?: number;
  emptyText?: string;
  columns?: string;
}

export default function BookGrid({
  books,
  loading,
  skeletonCount = 8,
  emptyText = 'No books found.',
  columns = 'grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4',
}: BookGridProps) {
  if (loading) {
    return <BookGridSkeleton count={skeletonCount} />;
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
        <BookOpen className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" aria-hidden="true" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
      </div>
    );
  }

  return (
    <StaggerGroup className={`grid ${columns}`} stagger={0.06}>
      {books.map((book) => (
        <StaggerItem key={book.id}>
          <BookCard book={book} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
