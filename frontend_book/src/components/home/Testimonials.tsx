import { Quote, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { commentsApi } from '../../api/comments';
import { useT } from '../../contexts/LanguageContext';
import type { Comment } from '../../types/comment';
import SectionHeading from '../common/SectionHeading';

export default function Testimonials() {
  const t = useT();
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    let active = true;
    commentsApi
      .list()
      .then((result) => {
        if (active) setComments(result);
      })
      .catch(() => {
        if (active) setComments([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (comments.length === 0) return null;

  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...comments, ...comments];

  return (
    <section className="overflow-hidden bg-gradient-to-br from-indigo-700 to-violet-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="[&_h2]:text-white [&_p]:text-indigo-100">
          <SectionHeading
            title={t.testimonials.heading}
            subtitle={t.testimonials.subheading}
            align="center"
          />
        </div>
      </div>

      <div
        className="group relative overflow-hidden pb-16"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex w-max animate-marquee gap-6 px-3 group-hover:[animation-play-state:paused]">
          {loop.map((comment, index) => (
            <article
              key={`${comment.id}-${index}`}
              className="flex w-[300px] flex-shrink-0 flex-col rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur sm:w-[340px]"
            >
              <Quote className="mb-3 h-7 w-7 text-white/40" aria-hidden="true" />
              <p className="flex-1 text-sm leading-relaxed text-white/95 sm:text-base">
                &ldquo;{comment.quote}&rdquo;
              </p>
              <div className="mt-5 flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="h-3.5 w-3.5 fill-accent-400 text-accent-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="mt-3">
                <p className="font-semibold text-white">{comment.name}</p>
                {comment.location && <p className="text-sm text-indigo-200">{comment.location}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
