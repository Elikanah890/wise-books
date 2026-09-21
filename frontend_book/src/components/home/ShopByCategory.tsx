import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useT } from '../../contexts/LanguageContext';
import { useCategories } from '../../hooks/useCategories';
import { categorySlug } from '../../utils/helpers';
import CategoryIcon from '../common/CategoryIcon';
import SectionHeading from '../common/SectionHeading';
import { BookGridSkeleton } from '../common/Skeletons';
import { EASE, StaggerGroup, StaggerItem } from '../motion';

export default function ShopByCategory() {
  const t = useT();
  const { categories, loading } = useCategories();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        title={t.categories.heading}
        subtitle={t.categories.subheading}
        align="center"
      />

      {loading ? (
        <BookGridSkeleton count={6} />
      ) : categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No categories yet.
        </p>
      ) : (
        <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category) => (
            <StaggerItem key={category.id}>
              <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25, ease: EASE }}>
                <Link
                  to={`/categories/${categorySlug(category)}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-soft transition-shadow hover:shadow-lift dark:border-gray-700 dark:bg-gray-800"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white transition-transform duration-300 group-hover:scale-110">
                    <CategoryIcon name={category.name} className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {category.bookCount} {t.categories.bookCount}
                  </span>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 rounded-full border border-indigo-600 px-6 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white"
        >
          {t.categories.viewAll}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
