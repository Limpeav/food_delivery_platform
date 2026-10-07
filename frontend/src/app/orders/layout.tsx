import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'Track your current and past food delivery orders on Cravery.',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
