import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Restaurants',
  description:
    'Explore all top-rated restaurants near you. Filter by cuisine, rating, and more. Fast delivery in Phnom Penh.',
};

export default function RestaurantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
