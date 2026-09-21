'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RestaurantRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/restaurant/dashboard');
  }, [router]);

  return null;
}
