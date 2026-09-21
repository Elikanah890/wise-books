import { BookOpen, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useT } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useCategories } from '../../hooks/useCategories';
import { APP_NAME } from '../../utils/constants';
import { categorySlug } from '../../utils/helpers';

export default function Footer() {
  const t = useT();
  const settings = useSettings((state) => state.settings);
  const { categories } = useCategories();
  const year = new Date().getFullYear();

  const site = settings?.site;
  const name = site?.name || APP_NAME;
  const tagline = site?.tagline || t.footer.tagline;
  const phone = site?.phone || '255688138821';
  const email = site?.email || 'wisemuhasbookclub@gmail.com';
  const location = site?.location || 'Dar es Salaam, Tanzania';

  const quickLinks = [
    { to: '/', label: t.nav.home },
    { to: '/books', label: t.books.title },
    { to: '/best-sellers', label: t.nav.bestSellers },
    { to: '/new-arrivals', label: t.nav.newArrivals },
    { to: '/contact', label: t.nav.contact },
    { to: '/about', label: t.nav.about },
    { to: '/faq', label: 'FAQ' },
  ];

  const topCategories = categories.slice(0, 7);

  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-300 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2" aria-label={`${name} home`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xl font-extrabold text-white">{name}</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">{tagline}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.categories}
            </h3>
            <ul className="space-y-2.5">
              {topCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/categories/${categorySlug(category)}`}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/categories"
                  className="text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {t.footer.viewAll}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a
                  href={`tel:+${phone.replace(/\D/g, '')}`}
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" aria-hidden="true" />
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-3 break-all transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" aria-hidden="true" />
                  <span>{email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" aria-hidden="true" />
                <span>{location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-gray-500">
            &copy; {year} {name}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to="/privacy" className="transition-colors hover:text-white">
              {t.footer.privacy}
            </Link>
            <span aria-hidden="true">|</span>
            <Link to="/terms" className="transition-colors hover:text-white">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
