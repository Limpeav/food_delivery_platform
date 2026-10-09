'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, Star, Clock, Bike } from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant, RestaurantCategory } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useTranslation } from '@/stores/languageStore';
import { localizeCategory } from '@/locales';

// ─── Helper ───────────────────────────────────────────────────────────────────

function isRestaurantOpen(openingTime: string, closingTime: string): boolean {
  const now = new Date();
  const [oh, om] = openingTime.split(':').map(Number);
  const [ch, cm] = closingTime.split(':').map(Number);
  const current = now.getHours() * 60 + now.getMinutes();
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  if (open <= close) return current >= open && current < close;
  return current >= open || current < close;
}

// ─── Debounce hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Main content ─────────────────────────────────────────────────────────────

function RestaurantsContent() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const initialCategory = searchParams.get('categoryId')
    ? Number(searchParams.get('categoryId'))
    : undefined;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategory);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'fee'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    restaurantService
      .getCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, minRating]);

  // Fetch restaurants — all filters passed server-side
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        setLoading(true);
        const res = await restaurantService.getRestaurants({
          search: debouncedSearch || undefined,
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
  }, [debouncedSearch, selectedCategory, minRating, currentPage]);

  // Filter & sort
  let displayRestaurants = minRating
    ? restaurants.filter((r) => r.rating >= minRating)
    : [...restaurants];

  if (onlyOpen) {
    displayRestaurants = displayRestaurants.filter((r) =>
      isRestaurantOpen(r.openingTime, r.closingTime)
    );
  }

  if (sortBy === 'rating') {
    displayRestaurants.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'fee') {
    displayRestaurants.sort((a, b) => a.deliveryFee - b.deliveryFee);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.restaurants.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.restaurants.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Quick Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            id="restaurant-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.restaurants.searchPlaceholder}
            aria-label={t.restaurants.searchAria}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Open Now Toggle */}
          <button
            type="button"
            onClick={() => setOnlyOpen(!onlyOpen)}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              onlyOpen
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyOpen ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            {t.restaurants.openNow}
          </button>

          {/* Rating Filter */}
          <select
            id="restaurant-rating-filter"
            value={minRating || ''}
            onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Filter by minimum rating"
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
          >
            <option value="">{t.restaurants.allRatings}</option>
            <option value="4.5">★ 4.5 {t.restaurants.andUp}</option>
            <option value="4.0">★ 4.0 {t.restaurants.andUp}</option>
            <option value="3.5">★ 3.5 {t.restaurants.andUp}</option>
          </select>

          {/* Sort Selector */}
          <select
            id="restaurant-sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort restaurants"
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
          >
            <option value="featured">{t.restaurants.sortFeatured}</option>
            <option value="rating">{t.restaurants.sortRating}</option>
            <option value="fee">{t.restaurants.sortFee}</option>
          </select>
        </div>
      </div>

      {/* Category Chip Filters */}
      {categories.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(undefined)}
            aria-pressed={selectedCategory === undefined}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === undefined
                ? 'border-[#FF5A1F] bg-[#FFF1EB] dark:bg-orange-950/40 text-[#FF5A1F] shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            🍽️ {t.restaurants.allCuisines}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)
              }
              aria-pressed={selectedCategory === cat.id}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'border-[#FF5A1F] bg-[#FFF1EB] dark:bg-orange-950/40 text-[#FF5A1F] shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  width={16}
                  height={16}
                  className="rounded-sm object-cover"
                />
              ) : null}
              {localizeCategory(cat.name, language)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Loading message={t.restaurants.loading} />
      ) : displayRestaurants.length === 0 ? (
        <EmptyState
          title={t.restaurants.emptyTitle}
          description={t.restaurants.emptyDesc}
          actionLabel={t.restaurants.clearFilters}
          onAction={() => {
            setSearch('');
            setSelectedCategory(undefined);
            setMinRating(undefined);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayRestaurants.map((restaurant) => {
            const open = isRestaurantOpen(restaurant.openingTime, restaurant.closingTime);
            return (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={
                      restaurant.coverImageUrl ||
                      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={restaurant.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge variant="primary" size="sm" className="font-bold">
                      {localizeCategory(restaurant.categoryName, language)}
                    </Badge>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        open ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/80 text-white/80'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          open ? 'bg-white animate-pulse' : 'bg-white/50'
                        }`}
                      />
                      {open ? t.common.open : t.common.closed}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-lg bg-black/70 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {restaurant.openingTime.slice(0, 5)} – {restaurant.closingTime.slice(0, 5)}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {restaurant.description || restaurant.address}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{restaurant.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        ({restaurant.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>${restaurant.deliveryFee.toFixed(2)} {t.restaurants.deliverySuffix}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && displayRestaurants.length > 0 && (
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
