import { prisma } from '../lib/prisma';
import type { SiteSettingsInput } from '../validators/settings.validator';

/**
 * Site-wide content that the Owner can edit from the admin dashboard.
 * These defaults are used until the Owner saves their own values, and as a
 * fallback for any field that is missing from the stored record.
 */
export const DEFAULT_SETTINGS: SiteSettingsInput = {
  site: {
    name: 'WiseBook',
    tagline:
      'Your trusted destination for books and ebooks in Tanzania. Discover thousands of titles across all genres.',
    phone: '255688138821',
    email: 'wisemuhasbookclub@gmail.com',
    location: 'Dar es Salaam, Tanzania',
  },
  hero: {
    title: 'Discover Your Next Favorite Book at WiseBook',
    subtitle: 'Your trusted destination for books and ebooks in Tanzania.',
  },
  trustBadges: [
    { icon: 'ShieldCheck', title: 'Secure Payment', text: 'SSL encrypted checkout' },
    { icon: 'Truck', title: 'Free Delivery', text: 'On orders over TSh 50,000' },
    { icon: 'BadgeCheck', title: '100% Satisfaction', text: 'Money-back guarantee' },
    { icon: 'BookOpen', title: '10,000+ Books', text: 'Largest online collection' },
    { icon: 'Star', title: '4.8/5 Rating', text: 'Trusted by thousands' },
  ],
};

export const DEFAULT_COMMENTS = [
  {
    name: 'Amina Hassan',
    location: 'Dar es Salaam',
    quote:
      'Payment was instant and my e-book downloaded right away. WiseBook makes buying books so easy — no account needed.',
    sortOrder: 0,
  },
  {
    name: 'Joseph Mwakalinga',
    location: 'Arusha',
    quote:
      'I bought three school books for my children and received them immediately. The prices are fair and the selection is great.',
    sortOrder: 1,
  },
  {
    name: 'Neema Petro',
    location: 'Mwanza',
    quote:
      'The download link came straight after payment and the PDF worked on my phone. Very reliable service.',
    sortOrder: 2,
  },
  {
    name: 'David Kimaro',
    location: 'Dodoma',
    quote:
      'WiseBook has books you cannot easily find in local shops. I will definitely buy here again.',
    sortOrder: 3,
  },
];

function merge(stored: unknown): SiteSettingsInput {
  if (!stored || typeof stored !== 'object') return DEFAULT_SETTINGS;
  const data = stored as Partial<SiteSettingsInput>;
  return {
    site: { ...DEFAULT_SETTINGS.site, ...(data.site ?? {}) },
    hero: { ...DEFAULT_SETTINGS.hero, ...(data.hero ?? {}) },
    trustBadges: data.trustBadges ?? DEFAULT_SETTINGS.trustBadges,
  };
}

export async function getSettings(): Promise<SiteSettingsInput> {
  const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  return row ? merge(row.data) : DEFAULT_SETTINGS;
}

export async function updateSettings(data: SiteSettingsInput): Promise<SiteSettingsInput> {
  const row = await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { data },
    create: { id: 1, data },
  });
  return merge(row.data);
}
