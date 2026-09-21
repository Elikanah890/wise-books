import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Download, Loader2, RefreshCw, Smartphone, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { paymentsApi, type PaymentStatusView } from '../api/payments';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useT } from '../contexts/LanguageContext';
import { formatCurrency } from '../utils/helpers';
import { EASE } from '../components/motion';

const POLL_INTERVAL_MS = 5000;
const TIMEOUT_MS = 15 * 60 * 1000;

export default function PaymentStatus() {
  const t = useT();
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<PaymentStatusView | null>(null);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const startedAtRef = useRef(Date.now());

  const poll = useCallback(
    async (manual = false) => {
      if (!paymentId) return;
      if (manual) setChecking(true);
      if (timerRef.current) clearTimeout(timerRef.current);

      try {
        const result = await paymentsApi.status(paymentId);
        setPayment(result);

        if (result.status === 'PENDING') {
          if (manual) setTimedOut(false);
          if (!manual && Date.now() - startedAtRef.current >= TIMEOUT_MS) {
            setTimedOut(true);
          } else {
            timerRef.current = setTimeout(() => void poll(), POLL_INTERVAL_MS);
          }
        }
      } catch {
        // Transient error: keep retrying until the timeout window closes.
        if (Date.now() - startedAtRef.current < TIMEOUT_MS) {
          timerRef.current = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        } else {
          setTimedOut(true);
        }
      } finally {
        setLoading(false);
        if (manual) setChecking(false);
      }
    },
    [paymentId]
  );

  useEffect(() => {
    startedAtRef.current = Date.now();
    setTimedOut(false);
    void poll();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  if (loading) return <LoadingSpinner size="lg" />;

  const status = payment?.status ?? 'PENDING';
  const token = payment?.downloadToken ?? null;

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
          {payment && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {payment.bookTitle} — {formatCurrency(payment.amount)}
            </p>
          )}
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t.book.loading}
          </div>
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

      {status === 'COMPLETED' && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: EASE }}>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
            {t.download.confirmed}
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            {payment?.bookTitle
              ? t.download.ready.replace('{title}', payment.bookTitle)
              : t.payment.instruction}
          </p>
          {token ? (
            <Link to={`/download/${token}`} className="mt-8 inline-block">
              <Button size="lg" leftIcon={<Download className="h-5 w-5" aria-hidden="true" />}>
                {t.download.downloadPdf}
              </Button>
            </Link>
          ) : (
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Please wait, preparing your download…
            </p>
          )}
        </motion.div>
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

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {status === 'PENDING' && (
          <Button
            variant="outline"
            isLoading={checking}
            onClick={() => void poll(true)}
            leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
          >
            {t.payment.checkStatus}
          </Button>
        )}
        {(status === 'FAILED' || timedOut) && payment?.bookId && (
          <Link to={`/checkout/${payment.bookId}`}>
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
