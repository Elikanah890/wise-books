import BookSection from '../components/home/BookSection';
import Hero from '../components/home/Hero';
import Newsletter from '../components/home/Newsletter';
import ShopByCategory from '../components/home/ShopByCategory';
import Testimonials from '../components/home/Testimonials';
import TrustBadges from '../components/home/TrustBadges';
import { useT } from '../contexts/LanguageContext';

export default function Home() {
  const t = useT();

  return (
    <div>
      <Hero />
      <TrustBadges />
      <ShopByCategory />

      <BookSection
        title={t.bestSellers.heading}
        subtitle={t.bestSellers.subheading}
        actionLabel={t.bestSellers.viewAll}
        actionTo="/best-sellers"
        query={{ bestSeller: 'true', limit: 8 }}
      />

      <BookSection
        title={t.featured.heading}
        subtitle={t.featured.subheading}
        actionLabel={t.featured.viewAll}
        actionTo="/books?ebook=true"
        query={{ ebook: 'true', limit: 8 }}
        tone="muted"
      />

      <BookSection
        title={t.newArrivals.heading}
        subtitle={t.newArrivals.subheading}
        actionLabel={t.newArrivals.viewAll}
        actionTo="/new-arrivals"
        query={{ limit: 8, sort: 'newest' }}
      />

      <Testimonials />
      <Newsletter />
    </div>
  );
}
