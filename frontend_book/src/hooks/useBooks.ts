import { useEffect, useState } from 'react';
import { booksApi, type BookQuery } from '../api/books';
import { ApiError } from '../api/client';
import type { Pagination } from '../types/api';
import type { Book } from '../types/book';

interface UseBooksResult {
  books: Book[];
  pagination: Pagination;
  loading: boolean;
  error: string;
}

const EMPTY_PAGINATION: Pagination = { page: 1, limit: 12, total: 0, totalPages: 1 };

export function useBooks(query: BookQuery): UseBooksResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(query);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    booksApi
      .list(query)
      .then((result) => {
        if (!active) return;
        setBooks(result.items);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (!active) return;
        setBooks([]);
        setError(err instanceof ApiError ? err.message : 'Could not load books');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { books, pagination, loading, error };
}
