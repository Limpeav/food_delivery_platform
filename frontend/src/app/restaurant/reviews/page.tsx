'use client';

import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { reviewService } from '@/services/reviewService';
import { Review, Restaurant } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/Pagination';

export default function RestaurantReviewsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const rest = await restaurantService.getMyRestaurant();
      setRestaurant(rest);
      if (rest?.id) {
        const revPage = await reviewService.getRestaurantReviews(rest.id, { page, size: 20 });
        setReviews(revPage.content || []);
        setTotalPages(revPage.totalPages || 0);
        setTotalElements(revPage.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullPage message="Loading customer reviews..." />;

  const ratingAvg = restaurant?.rating || 0;
  const reviewCount = restaurant?.reviewCount || reviews.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          Customer Ratings & Reviews
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor diner satisfaction and customer impressions of your kitchen
        </p>
      </div>

      {/* Summary Score Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-8">
        <div className="text-center sm:text-left sm:pr-8 sm:border-r border-slate-100">
          <span className="text-5xl font-black text-slate-900">
            {ratingAvg.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 text-amber-500 mt-1 justify-center sm:justify-start">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(ratingAvg) ? 'fill-amber-500' : 'text-slate-200 fill-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Based on {reviewCount} customer reviews
          </p>
        </div>

        <div className="flex-1 text-xs text-slate-600 space-y-2 max-w-md">
          <p className="font-semibold text-slate-800">Quality Reputation Insight:</p>
          <p className="text-slate-500 leading-relaxed">
            Maintaining an average rating above 4.5 grants your dishes priority promotion in nearby customer search queries and increases repeat orders.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recent Customer Feedback</h2>

        {reviews.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 bg-white text-xs text-slate-400">
            No customer reviews published yet. Completed orders will appear here once rated.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5A1F] flex items-center justify-center font-bold text-xs">
                      {rev.customerName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.customerName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-500' : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                    &quot;{rev.comment}&quot;
                  </p>
                )}

                {rev.foodItemName && (
                  <span className="inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Item: {rev.foodItemName}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={20}
          onPageChange={(p) => setPage(p - 1)}
          className="px-6 py-4 bg-slate-50/50"
        />
      </div>
    </div>
  );
}
