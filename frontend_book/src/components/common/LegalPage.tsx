import { Reveal } from '../motion';

interface LegalSection {
  heading: string;
  body: string;
}

export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: readonly LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{intro}</p>
      </Reveal>

      <div className="mt-10 space-y-8">
        {sections.map((section, index) => (
          <Reveal key={section.heading} delay={index * 0.04}>
            <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              {section.heading}
            </h2>
            <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{section.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
