import { Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { booksApi } from '../api/books';
import { ApiError } from '../api/client';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useT } from '../contexts/LanguageContext';
import type { Book } from '../types/book';
import { formatCurrency, getImageUrl } from '../utils/helpers';

export default function Checkout() {
  const t = useT();
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    booksApi
      .get(bookId)
      .then(setBook)
      .catch(() => setError(t.book.notFound))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!book) return;
    setError('');
    setSubmitting(true);
    const normalizedPhone = `+255${buyerPhone.replace(/\D/g, '').replace(/^0+/, '')}`;
    try {
      const order = await ordersApi.create({
        bookId: book.id,
        buyerEmail: buyerEmail.trim(),
        buyerPhone: normalizedPhone,
      });
      // Ask the backend to start the PayMe collection; it returns the paymentId to poll.
      const payment = await paymentsApi.initiate(order.id);
      navigate(`/payment-status/${payment.paymentId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-gray-500">
        {t.book.notFound}{' '}
        <Link to="/books" className="text-indigo-600 hover:underline">
          {t.book.backToBooks}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {t.checkout.title}
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-soft dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t.checkout.orderSummary}
          </h2>
          <div className="flex gap-4">
            <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              {book.coverImage ? (
                <img
                  src={getImageUrl(book.coverImage)}
                  alt={`${book.title} cover`}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 font-semibold text-gray-900 dark:text-white">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
              <p className="mt-2 font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(book.price)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="checkout-email"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t.checkout.email}
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="checkout-email"
                type="email"
                value={buyerEmail}
                onChange={(event) => setBuyerEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="checkout-phone"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t.checkout.phone}
            </label>
            <div className="flex">
              <span className="inline-flex items-center gap-1 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <Phone className="h-4 w-4" aria-hidden="true" />
                +255
              </span>
              <input
                id="checkout-phone"
                type="tel"
                inputMode="numeric"
                value={buyerPhone}
                onChange={(event) => setBuyerPhone(event.target.value)}
                placeholder="688 138 821"
                required
                className="w-full rounded-r-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <p className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" aria-hidden="true" />
            {t.checkout.noAccount}
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Lock className="h-4 w-4" aria-hidden="true" />
            )}
            {t.checkout.payWithMobile}
          </button>

          <p className="text-center text-xs text-gray-400">{t.checkout.secure}</p>
        </form>
      </div>
    </div>
  );
}
