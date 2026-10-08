'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  Clock,
  Bike,
  Sparkles,
  ArrowRight,
  Plus,
  Tag,
  ShieldCheck,
  Zap,
  Award,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { foodService } from '@/services/foodService';
import { couponService } from '@/services/couponService';
import { Restaurant, FoodItem, RestaurantCategory, Coupon } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Skeleton components ──────────────────────────────────────────────────────

function RestaurantCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col">
      <div className="h-44 w-full skeleton-shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 skeleton-shimmer rounded-lg" />
        <div className="h-3 w-full skeleton-shimmer rounded-lg" />
        <div className="h-3 w-1/2 skeleton-shimmer rounded-lg" />
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
          <div className="h-3 w-12 skeleton-shimmer rounded-lg" />
          <div className="h-3 w-20 skeleton-shimmer rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function FoodCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col">
      <div className="h-40 w-full skeleton-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/2 skeleton-shimmer rounded-lg" />
        <div className="h-4 w-3/4 skeleton-shimmer rounded-lg" />
        <div className="h-3 w-full skeleton-shimmer rounded-lg" />
        <div className="h-3 w-2/3 skeleton-shimmer rounded-lg" />
      </div>
      <div className="p-4 pt-0 flex justify-between items-center">
        <div className="h-5 w-14 skeleton-shimmer rounded-lg" />
        <div className="h-8 w-16 skeleton-shimmer rounded-xl" />
      </div>
    </div>
  );
}

// ─── Coupon copy button ───────────────────────────────────────────────────────

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      toast.success(`Code "${coupon.code}" copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const discountLabel =
    coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountValue}% OFF`
      : `$${coupon.discountValue.toFixed(2)} OFF`;

  const maxCap =
    coupon.discountType === 'PERCENTAGE' && coupon.maximumDiscount
      ? ` (up to $${coupon.maximumDiscount})`
      : '';

  return (
    <div className="relative flex-shrink-0 w-64 rounded-2xl border border-dashed border-[#FF5A1F]/40 bg-gradient-to-br from-[#FFF7F4] dark:from-orange-950/20 to-white dark:to-slate-900 overflow-hidden p-4 shadow-xs hover:shadow-md hover:border-[#FF5A1F]/60 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF5A1F]">
            Coupon
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
            {discountLabel}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{maxCap}</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Min order: ${coupon.minimumOrderAmount.toFixed(2)}
          </p>
        </div>
        <Tag className="w-8 h-8 text-[#FF5A1F]/30 shrink-0 mt-1" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {coupon.code}
        </code>
        <button
          onClick={handleCopy}
          aria-label={`Copy coupon code ${coupon.code}`}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-[#FF5A1F] hover:text-[#FF5A1F]'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
        Expires {new Date(coupon.expirationDate).toLocaleDateString()}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, addItem, clearCart } = useCartStore();

  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Switch restaurant conflict modal
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingFoodItem, setPendingFoodItem] = useState<FoodItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catsRes, restsRes, foodsRes, couponsRes] = await Promise.allSettled([
          restaurantService.getCategories(),
          restaurantService.getRestaurants({ page: 0, size: 8 }),
          foodService.getPopularFoods(),
          couponService.getActiveCoupons(),
        ]);
        if (catsRes.status === 'fulfilled') setCategories(catsRes.value);
        if (restsRes.status === 'fulfilled') setRestaurants(restsRes.value.content);
        if (foodsRes.status === 'fulfilled') setPopularFoods(foodsRes.value);
        if (couponsRes.status === 'fulfilled') setCoupons(couponsRes.value || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (searchQuery.trim()) qs.set('search', searchQuery.trim());
    if (selectedCategory) qs.set('categoryId', String(selectedCategory));
    router.push(`/restaurants?${qs.toString()}`);
  };

  const handleAddToCart = async (food: FoodItem) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (cart && cart.items.length > 0 && cart.restaurantId !== food.restaurantId) {
      setPendingFoodItem(food);
      setConflictModalOpen(true);
      return;
    }

    try {
      await addItem(food.id, 1);
      toast.success(`${food.name} added to cart!`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      toast.error('Failed to add item. Please try again.');
    }
  };

  const confirmSwitchRestaurant = async () => {
    if (pendingFoodItem) {
      await clearCart();
      await addItem(pendingFoodItem.id, 1);
      toast.success(`${pendingFoodItem.name} added to cart!`);
      setConflictModalOpen(false);
      setPendingFoodItem(null);
    }
  };

  // Hero featured food — use first popular food dynamically, fall back to static
  const heroFood = popularFoods[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-white dark:from-slate-950 dark:via-orange-950/20 dark:to-slate-900 pt-10 pb-16 lg:py-20 border-b border-orange-100/60 dark:border-slate-800/80 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-800/60 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 text-xs font-bold text-[#FF5A1F] shadow-xs backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Super Fast Delivery in Phnom Penh</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Craving Delicious Food? We Deliver In{' '}
                <span className="text-[#FF5A1F]">Minutes</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover the best local restaurants, gourmet burgers, fresh sushi, and refreshing
                drinks delivered hot straight to your doorstep.
              </p>

              {/* Instant Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-xl mx-auto lg:mx-0 flex items-center rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-lg shadow-orange-950/5 border border-slate-200/80 dark:border-slate-700 focus-within:border-[#FF5A1F] focus-within:ring-2 focus-within:ring-[#FF5A1F]/20 transition-all"
              >
                <div className="pl-3 pr-2 text-slate-400 dark:text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for restaurants, burgers, pizza, coffee..."
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  aria-label="Search restaurants and foods"
                />
                <Button type="submit" variant="primary" size="md" className="shrink-0 rounded-xl">
                  Search
                </Button>
              </form>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>25-35 min Average</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-blue-500" />
                  <span>Real-time GPS Tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Top Rated Merchants</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic / Featured Dish Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -right-6 w-48 h-48 bg-orange-300/30 dark:bg-orange-600/10 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-amber-300/30 dark:bg-amber-600/10 rounded-full blur-2xl -z-10" />

                <div className="rounded-3xl border border-white/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={
                        heroFood?.imageUrl ||
                        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={heroFood?.name || 'Featured dish'}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {heroFood?.rating ? heroFood.rating.toFixed(1) : '4.9'}{' '}
                        <span className="text-white/70">(1,200+)</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {heroFood?.name || 'Double Flame Whopper'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {heroFood?.restaurantName || 'Burger King BKK1'} •{' '}
                        {heroFood?.menuCategoryName || 'Fast Food'}
                      </p>
                    </div>
                    <span className="text-lg font-black text-[#FF5A1F]">
                      ${heroFood ? heroFood.price.toFixed(2) : '7.99'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Coupons / Promo Strip */}
      {(loading || coupons.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF5A1F]" />
                Active Deals &amp; Coupons
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Copy a code and use it at checkout</p>
            </div>
            <Link
              href="/promotions"
              className="flex items-center gap-1 text-xs font-bold text-[#FF5A1F] hover:underline"
            >
              All promotions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-64 h-36 rounded-2xl skeleton-shimmer"
                  />
                ))
              : coupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} />)}
          </div>
        </section>
      )}

      {/* Categories Row */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Explore Cuisines</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Find meals that match your cravings</p>
          </div>
          <Link
            href={
              selectedCategory
                ? `/restaurants?categoryId=${selectedCategory}`
                : '/restaurants'
            }
            className="flex items-center gap-1 text-xs font-bold text-[#FF5A1F] hover:underline"
          >
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
            className={`flex flex-col items-center justify-center min-w-[90px] p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategory === null
                ? 'border-[#FF5A1F] bg-[#FFF1EB] dark:bg-orange-950/40 text-[#FF5A1F] font-bold shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-medium'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-lg mb-1.5">
              🍽️
            </div>
            <span className="text-xs">All Dishes</span>
          </button>

          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center min-w-[90px] p-3 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-10 h-10 rounded-xl skeleton-shimmer mb-1.5" />
                  <div className="h-3 w-14 skeleton-shimmer rounded" />
                </div>
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={selectedCategory === cat.id}
                  className={`flex flex-col items-center justify-center min-w-[90px] p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'border-[#FF5A1F] bg-[#FFF1EB] dark:bg-orange-950/40 text-[#FF5A1F] font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-medium'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-lg mb-1.5 overflow-hidden">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '🍔'
                    )}
                  </div>
                  <span className="text-xs truncate max-w-[80px]">{cat.name}</span>
                </button>
              ))}
        </div>
      </section>



      {/* Featured Restaurants Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Featured Restaurants
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Popular spots delivering right now</p>
          </div>
          <Link
            href={
              selectedCategory
                ? `/restaurants?categoryId=${selectedCategory}`
                : '/restaurants'
            }
            className="flex items-center gap-1 text-xs font-bold text-[#FF5A1F] hover:underline"
          >
            View all restaurants <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
            : restaurants
                .filter((r) => selectedCategory === null || r.categoryId === selectedCategory)
                .map((restaurant) => {
                  const open = isRestaurantOpen(
                    restaurant.openingTime,
                    restaurant.closingTime
                  );
                  return (
                    <Link
                      key={restaurant.id}
                      href={`/restaurants/${restaurant.id}`}
                      className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col"
                    >
                      {/* Cover Image */}
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
                            {restaurant.categoryName}
                          </Badge>
                          <span
                            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              open
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-slate-700/80 text-white/80'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                open ? 'bg-white animate-pulse' : 'bg-white/50'
                              }`}
                            />
                            {open ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="rounded-lg bg-black/70 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {restaurant.openingTime.slice(0, 5)} –{' '}
                            {restaurant.closingTime.slice(0, 5)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
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
                            <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
        </div>
      </section>

      {/* Popular Food Items Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Trending Dishes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Most ordered foods this week</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        ) : popularFoods.length === 0 ? (
          <EmptyState
            title="No trending dishes yet"
            description="Check back soon — our top dishes will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFoods.map((food) => (
              <Link
                key={food.id}
                href={`/restaurants/${food.restaurantId}?foodId=${food.id}`}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-lg hover:border-[#FF5A1F]/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={
                        food.imageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={food.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {food.rating ? food.rating.toFixed(1) : '5.0'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {food.restaurantName}
                    </p>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 line-clamp-1 group-hover:text-[#FF5A1F] transition-colors">
                      {food.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{food.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ${food.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium group-hover:text-[#FF5A1F] transition-colors">
                      View dish details →
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    aria-label={`Add ${food.name} to cart`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(food);
                    }}
                    className="rounded-xl gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Switch Restaurant Conflict Modal */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        title="Start a new basket?"
        description="Your cart already contains items from another restaurant."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            You can only order from one restaurant at a time. Do you want to clear your current
            cart and add{' '}
            <span className="font-bold text-slate-900">{pendingFoodItem?.name}</span>?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConflictModalOpen(false)}>
              Keep Current Cart
            </Button>
            <Button variant="primary" size="sm" onClick={confirmSwitchRestaurant}>
              Start New Cart
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
