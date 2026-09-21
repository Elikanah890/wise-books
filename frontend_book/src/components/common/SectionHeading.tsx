import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '../motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({
  title,
  subtitle,
  actionLabel,
  actionTo,
  align = 'left',
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <Reveal
      className={`mb-8 flex flex-col gap-3 sm:flex-row sm:items-end ${
        centered ? 'sm:flex-col sm:items-center sm:text-center' : 'sm:justify-between'
      }`}
    >
      <div className={centered ? 'text-center' : ''}>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </Reveal>
  );
}
