import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Loader2, Smartphone, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useT } from '../contexts/LanguageContext';
import type { OrderStatusView } from '../types/order';
import { formatCurrency } from '../utils/helpers';
import { EASE } from '../components/motion';

const POLL_INTERVAL_MS = 5000;
const TIMEOUT_MS = 5 * 60 * 1000;

export default function PaymentStatus() {
  const t = useT();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const paymentError = (location.state as { paymentError?: string } | null)?.paymentError;
  const [order, setOrder] = useState<OrderStatusView | null>(null);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const startedAtRef = useRef(Date.now());

  const poll = useCallback(async () => {
    if (!orderId) return;
    try {
      const result = await ordersApi.status(orderId);
      setOrder(result);
      setLoading(false);

      if (result.status === 'PAID' && result.downloadToken) {
        navigate(`/download/${result.downloadToken}`, { replace: true });
        return;
      }

      if (result.status === 'PENDING') {
        if (Date.now() - startedAtRef.current >= TIMEOUT_MS) {
          setTimedOut(true);
          return;
        }
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    } catch {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setTimedOut(false);
    void poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  if (loading) return <LoadingSpinner size="lg" />;

  const status = order?.status ?? 'PENDING';

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      {status === 'PENDING' && !timedOut && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }}>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Smartphone className="h-8 w-8 animate-pulse text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
            {t.payment.checkPhone}
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400">{t.payment.instruction}</p>
          {order && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {order.bookTitle} — {formatCurrency(order.amount)}
            </p>
          )}
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t.book.loading}
          </div>
          {paymentError && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-accent-300 bg-accent-50 p-4 text-left text-sm text-accent-800 dark:border-accent-700 dark:bg-accent-900/20 dark:text-accent-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{paymentError}</span>
            </div>
          )}
        </motion.div>
      )}

      {status === 'PENDING' && timedOut && (
        <div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
            {t.payment.timedOut}
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400">{t.payment.timedOutDesc}</p>
        </div>
      )}

      {status === 'FAILED' && (
        <div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-red-600">{t.payment.failed}</h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400">{t.payment.failedDesc}</p>
        </div>
      )}

      {status === 'CANCELLED' && (
        <div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <XCircle className="h-8 w-8 text-gray-500" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-700 dark:text-gray-200">
            {t.payment.cancelled}
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400">{t.payment.cancelledDesc}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {(status === 'FAILED' || timedOut) && order?.bookId && (
          <Link to={`/checkout/${order.bookId}`}>
            <Button>{t.payment.retry}</Button>
          </Link>
        )}
        <Link to="/books">
          <Button variant="outline">{t.payment.backToBooks}</Button>
        </Link>
      </div>
    </div>
  );
}
