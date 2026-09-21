import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { useT } from '../../contexts/LanguageContext';
import { Reveal } from '../motion';

export default function Newsletter() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setMessage({ type: 'error', text: t.newsletter.invalid });
      return;
    }
    setMessage({ type: 'success', text: t.newsletter.success });
    setEmail('');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-12 text-center shadow-lift sm:px-12">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
          <Mail className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
          {t.newsletter.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">{t.newsletter.subheading}</p>

        <form
          onSubmit={submit}
          className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
          noValidate
        >
          <label htmlFor="newsletter-email" className="sr-only">
            {t.newsletter.placeholder}
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.newsletter.placeholder}
            className="w-full rounded-full border border-white/20 bg-white/95 px-5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {t.newsletter.button}
          </motion.button>
        </form>

        {message && (
          <p
            role="status"
            className={`mx-auto mt-4 text-sm ${
              message.type === 'success' ? 'text-green-200' : 'text-accent-200'
            }`}
          >
            {message.text}
          </p>
        )}
      </Reveal>
    </section>
  );
}
