import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { useT } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { Reveal } from '../components/motion';

export default function Contact() {
  const t = useT();
  const settings = useSettings((state) => state.settings);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const phone = settings?.site.phone || '255688138821';
  const email = settings?.site.email || 'wisemuhasbookclub@gmail.com';
  const location = settings?.site.location || t.contact.locationValue;

  const details = [
    {
      Icon: Phone,
      label: t.contact.phone,
      value: phone,
      href: `tel:+${phone.replace(/\D/g, '')}`,
    },
    {
      Icon: Mail,
      label: t.contact.email,
      value: email,
      href: `mailto:${email}`,
    },
    {
      Icon: MapPin,
      label: t.contact.location,
      value: location,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <Reveal className="text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t.contact.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
          {t.contact.subtitle}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Reveal className="space-y-4">
          {details.map(({ Icon, label, value, href }) => {
            const content = (
              <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift dark:border-gray-700 dark:bg-gray-800">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {label}
                  </div>
                  <div className="break-words font-medium text-gray-900 dark:text-white">
                    {value}
                  </div>
                </div>
              </div>
            );
            return href ? (
              <a key={label} href={href} className="block">
                {content}
              </a>
            ) : (
              <div key={label}>{content}</div>
            );
          })}
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={submit}
            className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder={t.contact.name}
                aria-label={t.contact.name}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder={t.contact.yourEmail}
                aria-label={t.contact.yourEmail}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <input
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
              placeholder={t.contact.subject}
              aria-label={t.contact.subject}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <textarea
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder={t.contact.message}
              aria-label={t.contact.message}
              rows={5}
              required
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {t.contact.send}
            </button>
            {sent && (
              <p role="status" className="text-center text-sm text-green-600 dark:text-green-400">
                {t.contact.sent}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </div>
  );
}
