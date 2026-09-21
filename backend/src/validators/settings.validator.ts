import { z } from 'zod';

export const siteSettingsSchema = z.object({
  site: z.object({
    name: z.string().trim().min(1).max(120),
    tagline: z.string().trim().min(1).max(400),
    phone: z.string().trim().min(1).max(40),
    email: z.string().trim().email('A valid email is required').max(191),
    location: z.string().trim().min(1).max(160),
  }),
  hero: z.object({
    title: z.string().trim().min(1).max(200),
    subtitle: z.string().trim().min(1).max(300),
  }),
  trustBadges: z
    .array(
      z.object({
        icon: z.string().trim().min(1).max(40),
        title: z.string().trim().min(1).max(80),
        text: z.string().trim().min(1).max(160),
      })
    )
    .max(8),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
