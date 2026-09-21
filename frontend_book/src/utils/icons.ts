import {
  Award,
  BadgeCheck,
  BookOpen,
  Clock,
  CreditCard,
  Gift,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  type LucideIcon,
} from 'lucide-react';

/** Icons the Owner can choose from when managing trust badges. */
export const TRUST_ICON_OPTIONS: Array<{ value: string; label: string; Icon: LucideIcon }> = [
  { value: 'ShieldCheck', label: 'Shield (check)', Icon: ShieldCheck },
  { value: 'Shield', label: 'Shield', Icon: Shield },
  { value: 'Truck', label: 'Delivery truck', Icon: Truck },
  { value: 'BadgeCheck', label: 'Verified badge', Icon: BadgeCheck },
  { value: 'BookOpen', label: 'Open book', Icon: BookOpen },
  { value: 'Star', label: 'Star', Icon: Star },
  { value: 'Heart', label: 'Heart', Icon: Heart },
  { value: 'Award', label: 'Award', Icon: Award },
  { value: 'Clock', label: 'Clock', Icon: Clock },
  { value: 'CreditCard', label: 'Card', Icon: CreditCard },
  { value: 'Gift', label: 'Gift', Icon: Gift },
  { value: 'ThumbsUp', label: 'Thumbs up', Icon: ThumbsUp },
  { value: 'Sparkles', label: 'Sparkles', Icon: Sparkles },
  { value: 'Phone', label: 'Phone', Icon: Phone },
  { value: 'Mail', label: 'Mail', Icon: Mail },
  { value: 'MapPin', label: 'Location pin', Icon: MapPin },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  TRUST_ICON_OPTIONS.map((option) => [option.value, option.Icon])
);

export function resolveTrustIcon(name: string | undefined): LucideIcon {
  if (!name) return ShieldCheck;
  return ICON_MAP[name] ?? ShieldCheck;
}
