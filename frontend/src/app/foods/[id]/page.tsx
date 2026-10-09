'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { foodService } from '@/services/foodService';
import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/stores/languageStore';
import Link from 'next/link';

export default function FoodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const foodId = Number(resolvedParams.id);
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (foodId) {
      foodService
        .getFoodById(foodId)
        .then((food) => {
          if (food && food.restaurantId) {
            router.replace(`/restaurants/${food.restaurantId}?foodId=${food.id}`);
          } else {
            setError(true);
          }
        })
        .catch(() => {
          setError(true);
        });
    }
  }, [foodId, router]);

  if (error) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.foodModal.dishNotFound}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.foodModal.dishNotFoundDesc}
        </p>
        <Link href="/restaurants" className="mt-4 inline-block text-sm font-bold text-[#FF5A1F]">
          {t.foodModal.browseRestaurants}
        </Link>
      </div>
    );
  }

  return <Loading fullPage message={t.foodModal.loadingDish} />;
}
