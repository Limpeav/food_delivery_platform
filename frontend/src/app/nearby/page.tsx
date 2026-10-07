'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  Star,
  Clock,
  Bike,
  Sparkles,
  MapPin,
  Compass,
  ArrowRight,
  Plus,
  Flame,
  Check,
  RotateCcw,
} from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { NearbyRestaurant, FoodItem, NearbyRecommendationResponse } from '@/types';
import { NearbyRestaurantMap } from '@/components/ui/NearbyRestaurantMap';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';

// Default center: Phnom Penh
const DEFAULT_LAT = 11.5564;
const DEFAULT_LNG = 104.9282;

export default function NearbyRestaurantsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, addItem, clearCart } = useCartStore();

  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    address: 'Phnom Penh Center, Cambodia',
  });
  const [radiusKm, setRadiusKm] = useState<number>(5.0);

  // Recommendations data
  const [data, setData] = useState<NearbyRecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  // Filters & Sorting
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'rating'>('recommended');

  // Cart conflict modal
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingFoodItem, setPendingFoodItem] = useState<FoodItem | null>(null);

  // Try auto-detecting geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
        },
        () => {
          // Fall back gracefully to Phnom Penh center
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Fetch nearby recommendations from backend whenever coordinates or radius change
  useEffect(() => {
    let isCancelled = false;
    async function fetchNearby() {
      try {
        setLoading(true);
        const res = await restaurantService.getNearbyRecommendations({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radiusKm,
          limit: 30,
        });
        if (!isCancelled) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to fetch nearby restaurants:', err);
        if (!isCancelled) {
          toast.error('Could not load nearby restaurants for this location.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchNearby();
    return () => {
      isCancelled = true;
    };
  }, [userLocation.lat, userLocation.lng, radiusKm]);

  // Handle Add to Cart
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

  // Filter & Sort restaurant list
  const restaurants = data?.restaurants;
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    let list = [...restaurants];

    if (filterOpenNow) {
      list = list.filter((r) => r.isOpen);
    }

    if (filterTopRated) {
      list = list.filter((r) => r.rating >= 4.5);
    }

    if (filterFastDelivery) {
      list = list.filter((r) => r.estimatedDeliveryMinutes <= 25);
    }

    if (sortBy === 'distance') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => b.recommendationScore - a.recommendationScore);
    }

    return list;
  }, [restaurants, filterOpenNow, filterTopRated, filterFastDelivery, sortBy]);

  const resetToDefaultCenter = () => {
    setUserLocation({
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
      address: 'Phnom Penh Center, Cambodia',
    });
    setRadiusKm(5.0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#FF5A1F]/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-300 backdrop-blur-md">
            <Compass className="h-3.5 w-3.5 text-[#FF5A1F]" />
            <span>5km Hyper-Local Delivery Radar</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Restaurants Near You <span className="text-[#FF5A1F]">Within {radiusKm}km</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300">
            Pin your location anywhere on the map or tap GPS to instantly uncover verified restaurants,
            real-time delivery distances, and chef-recommended dishes ready for fast delivery.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>{data?.totalFound ?? 0} spots nearby</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Delivery within ~15-30 min</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Proximity Recommendations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Discovery Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#FF5A1F]" />
              Live 5km Radar Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Drag your blue pin or click on the map to change your position. Green/orange markers represent nearby spots.
            </p>
          </div>

          <button
            type="button"
            onClick={resetToDefaultCenter}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to City Center
          </button>
        </div>

        <NearbyRestaurantMap
          userLocation={userLocation}
          onLocationChange={setUserLocation}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          restaurants={data?.restaurants || []}
          selectedRestaurantId={selectedRestaurantId}
          onSelectRestaurant={(r) => setSelectedRestaurantId(r.id)}
          height={420}
        />
      </section>

      {/* Recommended Dishes To Buy Near You Section */}
      {data && data.topRecommendedFoods && data.topRecommendedFoods.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
                <Flame className="w-4 h-4 text-[#FF5A1F]" />
                Customer Recommendations
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Top Dishes to Buy Within {radiusKm}km
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Highest rated dishes from nearby kitchens
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.topRecommendedFoods.map((food) => (
              <div
                key={food.id}
                className="group flex flex-col rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-orange-200"
              >
                {/* Food Image */}
                <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                    alt={food.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{food.rating.toFixed(1)}</span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 rounded-xl bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white">
                    ⏱ {food.preparationTime} min prep
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between pt-3 space-y-2">
                  <div>
                    <Link
                      href={`/restaurants/${food.restaurantId}`}
                      className="text-[11px] font-bold text-[#FF5A1F] hover:underline truncate block"
                    >
                      {food.restaurantName}
                    </Link>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#FF5A1F] transition-colors">
                      {food.name}
                    </h3>
                    {food.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {food.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-slate-900">
                        ${food.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(food)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#FF5A1F] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e04a12] active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter and Restaurant Directory Section */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Nearby Restaurants ({filteredRestaurants.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ordered by recommendation score (proximity, ratings, and open status)
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterOpenNow((v) => !v)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterOpenNow
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              ● Open Now
            </button>
            <button
              type="button"
              onClick={() => setFilterTopRated((v) => !v)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterTopRated
                  ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              ★ 4.5+ Rating
            </button>
            <button
              type="button"
              onClick={() => setFilterFastDelivery((v) => !v)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterFastDelivery
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              ⚡ Fast Delivery (&lt;25m)
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              aria-label="Sort restaurants by"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
            >
              <option value="recommended">Best Match (Recommended)</option>
              <option value="distance">Closest Distance</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRestaurants.length === 0 && (
          <EmptyState
            title="No restaurants found within this radius"
            description={`Try expanding the radius to 8km or 10km, or click on the map to center on Phnom Penh downtown.`}
            actionLabel="Reset to City Center (5km)"
            onAction={resetToDefaultCenter}
          />
        )}

        {/* Restaurants Grid */}
        {!loading && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => {
              const isSelected = selectedRestaurantId === restaurant.id;
              return (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurantId(restaurant.id)}
                  className={`group relative flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    isSelected
                      ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]/30 bg-orange-50/20'
                      : 'border-slate-200/90 hover:border-orange-200'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Restaurant Cover Image */}
                    <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={
                          restaurant.coverImageUrl ||
                          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'
                        }
                        alt={restaurant.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Distance Pill Overlay */}
                      <div className="absolute top-3 left-3 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{restaurant.distanceKm} km away</span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md backdrop-blur-md ${
                            restaurant.isOpen
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800/90 text-slate-300'
                          }`}
                        >
                          {restaurant.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>

                      {/* Estimated Delivery Time */}
                      <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>~{restaurant.estimatedDeliveryMinutes} min delivery</span>
                      </div>
                    </div>

                    {/* Restaurant Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-[#FF5A1F] transition-colors truncate">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{restaurant.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-amber-500 font-normal">
                            ({restaurant.reviewCount})
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {restaurant.categoryName || 'Restaurant'} • {restaurant.address}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-slate-400" />
                          ${restaurant.deliveryFee.toFixed(2)} delivery
                        </span>
                        <span>•</span>
                        <span>Min ${restaurant.minimumOrder.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Recommended Dishes from this restaurant */}
                    {restaurant.recommendedFoods && restaurant.recommendedFoods.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Chef&apos;s Recommended Dishes:
                        </span>
                        <div className="space-y-2">
                          {restaurant.recommendedFoods.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 hover:bg-orange-50/60 p-2 border border-slate-100 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                <p className="text-[11px] font-semibold text-[#FF5A1F]">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(item);
                                }}
                                className="shrink-0 flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-800 hover:bg-[#FF5A1F] hover:text-white hover:border-[#FF5A1F] transition-all cursor-pointer shadow-2xs"
                              >
                                <Plus className="w-3 h-3" />
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-[#FF5A1F] text-white py-2.5 px-4 text-xs font-bold transition-all duration-200 shadow-xs"
                    >
                      <span>Explore Full Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Switch Restaurant Conflict Modal */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        title="Start a new basket?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Your cart contains items from another restaurant. Would you like to clear your existing cart
            and start a new order with this item?
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConflictModalOpen(false);
                setPendingFoodItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={confirmSwitchRestaurant}
            >
              Clear Cart & Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
