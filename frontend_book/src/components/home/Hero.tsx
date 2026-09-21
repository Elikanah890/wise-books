import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Download } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { EASE } from '../motion';

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function Hero() {
  const t = useT();
  const settings = useSettings((state) => state.settings);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const heroTitle = settings?.hero.title ?? t.hero.title;
  const heroSubtitle = settings?.hero.subtitle ?? t.hero.subtitle;
  const words = heroTitle.split(' ');

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white"
    >
      <motion.div
        style={{ y: backgroundY }}
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
      </motion.div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-28 lg:px-8">
        <motion.div style={{ y: contentY, opacity: contentOpacity }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/20"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Tanzania&apos;s online bookstore
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}
            className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {words.map((word, index) => (
              <motion.span key={`${word}-${index}`} variants={wordVariants} className="mr-2 inline-block">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            className="mt-6 max-w-xl text-lg text-indigo-100"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.65 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/books"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition-colors hover:bg-indigo-50 sm:w-auto"
              >
                {t.hero.shopNow}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/books?ebooks=true"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur transition-colors hover:bg-white/15 sm:w-auto"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t.hero.browseEbooks}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating book covers */}
        <div className="relative hidden h-80 lg:block" aria-hidden="true">
          <motion.div
            style={{ y: backgroundY }}
            className="absolute left-6 top-4 h-56 w-40 rotate-[-8deg] animate-float rounded-xl bg-gradient-to-br from-white/95 to-indigo-100 p-4 shadow-2xl"
          >
            <div className="h-3 w-16 rounded bg-indigo-200" />
            <div className="mt-3 h-2 w-24 rounded bg-indigo-100" />
            <div className="mt-2 h-2 w-20 rounded bg-indigo-100" />
            <BookOpen className="mt-8 h-10 w-10 text-indigo-400" />
          </motion.div>

          <motion.div
            style={{ y: contentY }}
            className="absolute right-8 top-20 h-60 w-44 rotate-[7deg] animate-float-slow rounded-xl bg-gradient-to-br from-accent-300 to-amber-500 p-4 shadow-2xl"
          >
            <div className="h-3 w-20 rounded bg-white/60" />
            <div className="mt-3 h-2 w-28 rounded bg-white/40" />
            <div className="mt-2 h-2 w-24 rounded bg-white/40" />
            <BookOpen className="mt-10 h-10 w-10 text-white/80" />
          </motion.div>

          <motion.div
            style={{ y: backgroundY }}
            className="absolute bottom-0 left-1/3 h-48 w-36 rotate-[3deg] animate-float rounded-xl bg-gradient-to-br from-violet-200 to-violet-400 p-3 shadow-2xl"
          >
            <div className="h-2.5 w-14 rounded bg-white/70" />
            <div className="mt-2.5 h-2 w-20 rounded bg-white/50" />
            <BookOpen className="mt-8 h-8 w-8 text-white/80" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
