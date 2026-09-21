import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import CategoryIcon from '../components/common/CategoryIcon';
import { LineSkeleton } from '../components/common/Skeletons';
import { Reveal } from '../components/motion';
import { useT } from '../contexts/LanguageContext';
import type { Category } from '../types/category';
import { EASE, StaggerGroup, StaggerItem } from '../components/motion';
import { categorySlug } from '../utils/helpers';

export default function Categories() {
  const t = useT();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t.categories.allTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-500 dark:text-gray-400">
          {t.categories.allSubtitle}
        </p>
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-gray-200 p-6 dark:border-gray-700">
              <LineSkeleton className="h-12 w-12 rounded-full" />
              <LineSkeleton className="mt-4 h-4 w-1/2" />
              <LineSkeleton className="mt-3 h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          No categories available yet.
        </p>
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <StaggerItem key={category.id}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.25, ease: EASE }}>
                <Link
                  to={`/categories/${categorySlug(category)}`}
                  className="group flex h-full items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-lift dark:border-gray-700 dark:bg-gray-800"
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white transition-transform duration-300 group-hover:scale-110">
                    <CategoryIcon name={category.name} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-1 block line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {category.description ?? `${category.name} books`}
                    </span>
                    <span className="mt-2 block text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                      {category.bookCount} {t.categories.bookCount}
                    </span>
                  </span>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
