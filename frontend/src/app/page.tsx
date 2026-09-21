'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  Clock,
  Bike,
  Sparkles,
  ArrowRight,
  Plus,
  Check,
  Tag,
  ShieldCheck,
  Zap,
  Award,
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
    if (searchQuery.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/restaurants');
    }
  };

  const handleAddToCart = async (food: FoodItem) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if cart has items from a different restaurant
    if (cart && cart.items.length > 0 && cart.restaurantId !== food.restaurantId) {
      setPendingFoodItem(food);
      setConflictModalOpen(true);
      return;
    }

    try {
      await addItem(food.id, 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const confirmSwitchRestaurant = async () => {
    if (pendingFoodItem) {
      await clearCart();
      await addItem(pendingFoodItem.id, 1);
      setConflictModalOpen(false);
      setPendingFoodItem(null);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-white pt-10 pb-16 lg:py-20 border-b border-orange-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-[#FF5A1F] shadow-xs backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Super Fast Delivery in Phnom Penh</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                Craving Delicious Food? We Deliver In{' '}
                <span className="text-[#FF5A1F]">Minutes</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover the best local restaurants, gourmet burgers, fresh sushi, and refreshing drinks delivered hot straight to your doorstep.
              </p>

              {/* Instant Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-xl mx-auto lg:mx-0 flex items-center rounded-2xl bg-white p-2 shadow-lg shadow-orange-950/5 border border-slate-200/80 focus-within:border-[#FF5A1F] focus-within:ring-2 focus-within:ring-[#FF5A1F]/20 transition-all"
              >
                <div className="pl-3 pr-2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for restaurants, burgers, pizza, coffee..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <Button type="submit" variant="primary" size="md" className="shrink-0 rounded-xl">
                  Search
                </Button>
              </form>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
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
                <div className="absolute -top-6 -right-6 w-48 h-48 bg-orange-300/30 rounded-full blur-2xl -z-10" />
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl -z-10" />

                <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur-md">
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80"
                      alt="Gourmet Burger"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 (1,200+)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Double Flame Whopper</h4>
                      <p className="text-xs text-slate-500">Burger King BKK1 • Fast Food</p>
                    </div>
                    <span className="text-lg font-black text-[#FF5A1F]">$7.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Explore Cuisines</h2>
            <p className="text-xs text-slate-500">Find meals that match your cravings</p>
          </div>
          <Link
            href="/restaurants"
            className="flex items-center gap-1 text-xs font-bold text-[#FF5A1F] hover:underline"
          >
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex flex-col items-center justify-center min-w-[90px] p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategory === null
                ? 'border-[#FF5A1F] bg-[#FFF1EB] text-[#FF5A1F] font-bold shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg mb-1.5">
              🍽️
            </div>
            <span className="text-xs">All Dishes</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center justify-center min-w-[90px] p-3 rounded-2xl border transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'border-[#FF5A1F] bg-[#FFF1EB] text-[#FF5A1F] font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg mb-1.5 overflow-hidden">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
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
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Featured Restaurants</h2>
            <p className="text-xs text-slate-500">Popular spots delivering right now</p>
          </div>
          <Link
            href="/restaurants"
            className="flex items-center gap-1 text-xs font-bold text-[#FF5A1F] hover:underline"
          >
            View all restaurants <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants
            .filter((r) => selectedCategory === null || r.categoryId === selectedCategory)
            .map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="group rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col"
              >
                {/* Cover Image */}
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

                {/* Info */}
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
      </section>

      {/* Popular Food Items Carousel/Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Trending Dishes</h2>
            <p className="text-xs text-slate-500">Most ordered foods this week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularFoods.map((food) => (
            <Link
              key={food.id}
              href={`/restaurants/${food.restaurantId}?foodId=${food.id}`}
              className="group cursor-pointer rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-lg hover:border-[#FF5A1F]/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={
                      food.imageUrl ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={food.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {food.rating ? food.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {food.restaurantName}
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1 group-hover:text-[#FF5A1F] transition-colors">
                    {food.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {food.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-slate-900">
                    ${food.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium group-hover:text-[#FF5A1F] transition-colors">
                    View dish details →
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="primary"
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
            You can only order from one restaurant at a time. Do you want to clear your current cart and add <span className="font-bold text-slate-900">{pendingFoodItem?.name}</span>?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConflictModalOpen(false)}
            >
              Keep Current Cart
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmSwitchRestaurant}
            >
              Start New Cart
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
