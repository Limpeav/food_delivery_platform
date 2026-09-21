'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Phone,
  Heart,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { foodService } from '@/services/foodService';
import { favoriteService } from '@/services/favoriteService';
import { reviewService } from '@/services/reviewService';
import { Restaurant, MenuCategory, FoodItem, Review } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FoodDetailModal } from '@/components/shared/FoodDetailModal';

function RestaurantDetailContent({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isAuthenticated } = useAuthStore();
  const { cart, addItem, clearCart, openDrawer } = useCartStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selected food item for detail modal
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  // Switch restaurant conflict modal
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingFoodItem, setPendingFoodItem] = useState<FoodItem | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [rest, menuCats, menuFoods, revsRes] = await Promise.all([
        restaurantService.getRestaurantById(restaurantId),
        restaurantService.getMenuCategories(restaurantId),
        foodService.getFoodsByRestaurant(restaurantId),
        reviewService.getRestaurantReviews(restaurantId).catch(() => ({ content: [] })),
      ]);
      setRestaurant(rest);
      setCategories(menuCats);
      setFoods(menuFoods);
      setReviews(revsRes.content || []);

      if (isAuthenticated) {
        const favs = await favoriteService.getFavoriteRestaurants().catch(() => []);
        setIsFavorite(favs.some((f) => f.id === restaurantId));
      }
    } catch (err: any) {
      console.error('Failed to load restaurant data:', err);
      setLoadError(
        err?.message?.includes('Network Error')
          ? 'Unable to connect to server. Please verify your connection or backend server status.'
          : (err?.response?.data?.message || 'Failed to load restaurant details.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId, isAuthenticated]);

  // Deep-link check for foodId query param
  const foodIdParam = searchParams.get('foodId') || searchParams.get('food');
  useEffect(() => {
    if (foods.length > 0 && foodIdParam) {
      const match = foods.find((f) => String(f.id) === foodIdParam);
      if (match) {
        setSelectedFood(match);
      }
    }
  }, [foods, foodIdParam]);

  const handleOpenFoodModal = (food: FoodItem) => {
    setSelectedFood(food);
    const url = new URL(window.location.href);
    url.searchParams.set('foodId', String(food.id));
    window.history.replaceState({}, '', url.toString());
  };

  const handleCloseFoodModal = () => {
    setSelectedFood(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('foodId');
    url.searchParams.delete('food');
    window.history.replaceState({}, '', url.toString());
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      if (isFavorite) {
        await favoriteService.removeFavoriteRestaurant(restaurantId);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavoriteRestaurant(restaurantId);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (food: FoodItem, quantity: number = 1) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (cart && cart.items.length > 0 && cart.restaurantId !== food.restaurantId) {
      setPendingFoodItem(food);
      setPendingQuantity(quantity);
      setConflictModalOpen(true);
      return;
    }

    try {
      await addItem(food.id, quantity);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const confirmSwitchRestaurant = async () => {
    if (pendingFoodItem) {
      await clearCart();
      await addItem(pendingFoodItem.id, pendingQuantity);
      setConflictModalOpen(false);
      setPendingFoodItem(null);
      setPendingQuantity(1);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading restaurant details..." />;
  }

  if (!restaurant) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Restaurant not found</h2>
        <Link href="/restaurants" className="mt-4 inline-block text-sm font-bold text-[#FF5A1F]">
          ← Browse other restaurants
        </Link>
      </div>
    );
  }

  const filteredFoods =
    activeCategoryId === 'all'
      ? foods
      : foods.filter((f) => f.menuCategoryId === activeCategoryId);

  const cartItemCount = cart && cart.restaurantId === restaurantId ? cart.totalItems : 0;
  const cartSubtotal = cart && cart.restaurantId === restaurantId ? cart.subtotal : 0;

  return (
    <div className="pb-24">
      {/* Restaurant Hero Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
        <img
          src={
            restaurant.coverImageUrl ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'
          }
          alt={restaurant.name}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">
                  {restaurant.categoryName}
                </Badge>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {restaurant.openingTime.slice(0, 5)} - {restaurant.closingTime.slice(0, 5)}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{restaurant.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                {restaurant.description || restaurant.address}
              </p>
            </div>

            {/* Favorite & Ratings Card */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleFavorite}
                aria-label="Save restaurant to favorites"
                className={`p-3 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                  isFavorite
                    ? 'bg-rose-500 border-rose-400 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>

              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2.5 text-center">
                <div className="flex items-center justify-center gap-1 font-black text-amber-400 text-lg leading-tight">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium">
                  {restaurant.reviewCount} reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF5A1F]" />
                {restaurant.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-[#FF5A1F]" />
                Delivery: ${restaurant.deliveryFee.toFixed(2)}
              </span>
              <span className="hidden md:flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400" />
                Min Order: ${restaurant.minimumOrder.toFixed(2)}
              </span>
            </div>
            {restaurant.phone && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                {restaurant.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu Categories Tab Navigation */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategoryId === 'all'
                ? 'bg-[#FF5A1F] text-white shadow-sm shadow-[#FF5A1F]/30'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            All Items ({foods.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategoryId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryId === c.id
                  ? 'bg-[#FF5A1F] text-white shadow-sm shadow-[#FF5A1F]/30'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Menu Dishes</h2>
            <p className="text-xs text-slate-500">Click on any dish to view its details and customer reviews</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filteredFoods.length} {filteredFoods.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => {
            const inCart = cart?.items.find((i) => i.foodItemId === food.id);

            return (
              <div
                key={food.id}
                onClick={() => handleOpenFoodModal(food)}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs hover:shadow-lg hover:border-[#FF5A1F]/40 hover:-translate-y-0.5 transition-all flex gap-4 relative overflow-hidden"
              >
                {/* Food Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-wider">
                        {food.menuCategoryName || 'Specialty'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#FF5A1F] transition-colors leading-snug">
                      {food.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {food.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-slate-900">
                        ${food.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium group-hover:text-[#FF5A1F] transition-colors">
                        Click for details →
                      </span>
                    </div>

                    {food.available ? (
                      <Button
                        size="sm"
                        variant={inCart ? 'secondary' : 'primary'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(food, 1);
                        }}
                        className="rounded-xl gap-1 text-xs shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {inCart ? `Add (${inCart.quantity})` : 'Add'}
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Sold out</span>
                    )}
                  </div>
                </div>

                {/* Food Image */}
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={
                      food.imageUrl ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={food.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {food.rating ? (
                    <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {food.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-14 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{r.customerName}</span>
                    <div className="flex items-center text-amber-400 text-xs font-bold gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{r.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">&ldquo;{r.comment}&rdquo;</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Mini-Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 inset-x-0 mx-auto max-w-xl px-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-2xl flex items-center justify-between border border-slate-800">
            <button
              type="button"
              onClick={openDrawer}
              className="flex items-center gap-3 pl-2 text-left cursor-pointer group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5A1F] text-white font-bold text-xs group-hover:scale-105 transition-transform">
                {cartItemCount}
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-[#FF5A1F] transition-colors">Your Basket</p>
                <p className="text-[11px] text-slate-400">Subtotal: ${cartSubtotal.toFixed(2)}</p>
              </div>
            </button>

            <Button
              size="sm"
              variant="primary"
              onClick={openDrawer}
              className="rounded-xl gap-1.5 font-bold cursor-pointer"
            >
              View Basket <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Switch Restaurant Modal */}
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
              Cancel
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

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFood}
        isOpen={!!selectedFood}
        onClose={handleCloseFoodModal}
        onAddToCart={handleAddToCart}
        inCartQuantity={
          selectedFood
            ? cart?.items.find((i) => i.foodItemId === selectedFood.id)?.quantity || 0
            : 0
        }
      />
    </div>
  );
}

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const restaurantId = Number(resolvedParams.id);

  return (
    <Suspense fallback={<Loading fullPage message="Loading restaurant details..." />}>
      <RestaurantDetailContent restaurantId={restaurantId} />
    </Suspense>
  );
}
