'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Star, Clock, Bike, SlidersHorizontal } from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant, RestaurantCategory } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await restaurantService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, minRating]);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        const res = await restaurantService.getRestaurants({
          search: search || undefined,
          categoryId: selectedCategory,
          page: currentPage - 1,
          size: pageSize,
        });
        setRestaurants(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, [search, selectedCategory, minRating, currentPage]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          All Restaurants
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore curated places with high hygiene standards and delicious cuisines
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants by name or address..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory || ''}
            onChange={(e) =>
              setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)
            }
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#FF5A1F]"
          >
            <option value="">All Cuisines</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Rating Dropdown */}
          <select
            value={minRating || ''}
            onChange={(e) =>
              setMinRating(e.target.value ? Number(e.target.value) : undefined)
            }
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#FF5A1F]"
          >
            <option value="">All Ratings</option>
            <option value="4.5">★ 4.5 & up</option>
            <option value="4.0">★ 4.0 & up</option>
            <option value="3.5">★ 3.5 & up</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading message="Loading restaurants..." />
      ) : restaurants.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="Try broadening your search term or clearing cuisine filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory(undefined);
            setMinRating(undefined);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants
            .filter((r) => !minRating || r.rating >= minRating)
            .map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="group rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={
                    restaurant.coverImageUrl ||
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={restaurant.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="primary" size="sm" className="font-bold">
                    {restaurant.categoryName}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="rounded-lg bg-black/70 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {restaurant.openingTime.slice(0, 5)} - {restaurant.closingTime.slice(0, 5)}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {restaurant.description || restaurant.address}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({restaurant.reviewCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-slate-400" />
                    <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && restaurants.length > 0 && (
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<Loading message="Loading..." />}>
      <RestaurantsContent />
    </Suspense>
  );
}
