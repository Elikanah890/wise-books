export interface TrustBadge {
  icon: string;
  title: string;
  text: string;
}

export interface SiteSettings {
  site: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    location: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  trustBadges: TrustBadge[];
}
