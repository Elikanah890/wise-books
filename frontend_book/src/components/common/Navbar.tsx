import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage, useT } from '../../contexts/LanguageContext';
import { APP_NAME } from '../../utils/constants';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  to: string;
  label: string;
}

export default function Navbar() {
  const t = useT();
  const language = useLanguage((state) => state.language);
  const setLanguage = useLanguage((state) => state.setLanguage);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navItems: NavItem[] = [
    { to: '/', label: t.nav.home },
    { to: '/books', label: t.nav.books },
    { to: '/categories', label: t.nav.categories },
    { to: '/best-sellers', label: t.nav.bestSellers },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = search.trim();
    navigate(trimmed ? `/books?search=${encodeURIComponent(trimmed)}` : '/books');
    setMenuOpen(false);
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 dark:text-indigo-400'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/85 backdrop-blur transition-all duration-300 dark:bg-gray-900/85 ${
        scrolled
          ? 'border-gray-200 py-1 shadow-sm dark:border-gray-800'
          : 'border-transparent py-2'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex flex-shrink-0 items-center gap-2" aria-label={`${APP_NAME} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {APP_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClasses}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form
          onSubmit={submitSearch}
          className={`ml-auto hidden transition-all duration-300 md:block ${
            searchOpen ? 'w-72' : 'w-48'
          }`}
          role="search"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              placeholder={t.nav.search}
              aria-label={t.nav.search}
              className="w-full rounded-full border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <div
            className="hidden items-center rounded-full border border-gray-200 p-0.5 text-xs font-semibold sm:flex dark:border-gray-700"
            role="group"
            aria-label={t.nav.language}
          >
            {(['en', 'sw'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                aria-pressed={language === code}
                className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
                  language === code
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <ThemeToggle />

          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label={`${t.nav.cart} (0)`}
            className="relative rounded-xl p-2 text-gray-400 dark:text-gray-500"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-300 px-1 text-[10px] font-bold text-gray-700 dark:bg-gray-600 dark:text-gray-200">
              0
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-gray-200 bg-white lg:hidden dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="space-y-3 px-4 py-4 sm:px-6">
              <form onSubmit={submitSearch} role="search" className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.nav.search}
                  aria-label={t.nav.search}
                  className="w-full rounded-full border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-4 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </form>

              <nav className="flex flex-col" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div
                className="flex items-center gap-1 rounded-full border border-gray-200 p-0.5 text-xs font-semibold dark:border-gray-700"
                role="group"
                aria-label={t.nav.language}
              >
                {(['en', 'sw'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    aria-pressed={language === code}
                    className={`flex-1 rounded-full px-2.5 py-1.5 uppercase transition-colors ${
                      language === code
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {code === 'en' ? 'English' : 'Kiswahili'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
