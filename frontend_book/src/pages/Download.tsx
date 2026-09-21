import { AlertCircle, CheckCircle2, Download as DownloadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { downloadApi } from '../api/download';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useT } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { EASE } from '../components/motion';

export default function Download() {
  const t = useT();
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ title: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    downloadApi
      .resolve(token)
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : t.download.notFound)
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) return <LoadingSpinner size="lg" />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-red-600">{t.download.unavailable}</h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">{error || t.download.invalid}</p>
        <Link to="/books" className="mt-6 inline-block text-indigo-600 hover:underline">
          {t.book.backToBooks}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: EASE }}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
          {t.download.confirmed}
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          {t.download.ready.replace('{title}', data.title)}
        </p>
        <a href={data.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block">
          <Button size="lg" leftIcon={<DownloadIcon className="h-5 w-5" aria-hidden="true" />}>
            {t.download.downloadPdf}
          </Button>
        </a>
        <p className="mt-4 text-xs text-gray-400">{t.download.newTab}</p>
      </motion.div>
    </div>
  );
}
