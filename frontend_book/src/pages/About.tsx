import { BookOpen, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';
import { Reveal, StaggerGroup, StaggerItem } from '../components/motion';

const ICONS = [BookOpen, Heart, ShieldCheck, Sparkles];

export default function About() {
  const t = useT();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <Reveal className="text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t.about.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">{t.about.intro}</p>
      </Reveal>

      <Reveal className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-lift">
        <h2 className="font-serif text-2xl font-bold">{t.about.missionTitle}</h2>
        <p className="mt-3 text-indigo-100">{t.about.mission}</p>
      </Reveal>

      <div className="mt-14">
        <h2 className="mb-6 text-center font-serif text-2xl font-bold text-gray-900 dark:text-white">
          {t.about.valuesTitle}
        </h2>
        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {t.about.values.map((value, index) => {
            const Icon = ICONS[index] ?? BookOpen;
            return (
              <StaggerItem key={value.title}>
                <div className="flex h-full gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-700 dark:bg-gray-800">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{value.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{value.text}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </div>
  );
}
