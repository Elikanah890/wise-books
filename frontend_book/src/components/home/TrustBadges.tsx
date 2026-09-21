import { BadgeCheck, BookOpen, ShieldCheck, Star, Truck, type LucideIcon } from 'lucide-react';
import { useT } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { resolveTrustIcon } from '../../utils/icons';
import { StaggerGroup, StaggerItem } from '../motion';

interface Badge {
  Icon: LucideIcon;
  title: string;
  text: string;
}

export default function TrustBadges() {
  const t = useT();
  const settings = useSettings((state) => state.settings);

  const badges: Badge[] =
    settings && settings.trustBadges.length > 0
      ? settings.trustBadges.map((badge) => ({
          Icon: resolveTrustIcon(badge.icon),
          title: badge.title,
          text: badge.text,
        }))
      : [
          { Icon: ShieldCheck, title: t.trust.securePayment, text: t.trust.securePaymentDesc },
          { Icon: Truck, title: t.trust.freeDelivery, text: t.trust.freeDeliveryDesc },
          { Icon: BadgeCheck, title: t.trust.satisfaction, text: t.trust.satisfactionDesc },
          { Icon: BookOpen, title: t.trust.books, text: t.trust.booksDesc },
          { Icon: Star, title: t.trust.rating, text: t.trust.ratingDesc },
        ];

  return (
    <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <StaggerGroup className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8">
        {badges.map(({ Icon, title, text }) => (
          <StaggerItem key={title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{text}</span>
            </span>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
