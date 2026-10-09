'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Star,
  Clock,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  Store,
  MessageSquare,
} from 'lucide-react';
import { FoodItem, Review } from '@/types';
import { reviewService } from '@/services/reviewService';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/stores/languageStore';
import { localizeCategory } from '@/locales';

interface FoodDetailModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (food: FoodItem, quantity: number) => Promise<void>;
  inCartQuantity?: number;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  isOpen,
  onClose,
  onAddToCart,
  inCartQuantity = 0,
}) => {
  const { t, language } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);

  useEffect(() => {
    if (isOpen && food) {
      setQuantity(1);
      setAddedRecently(false);
      setLoadingReviews(true);

      reviewService
        .getFoodReviews(food.id)
        .then((res) => {
          setReviews(res.content || []);
        })
        .catch(() => {
          setReviews([]);
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    }
  }, [isOpen, food?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !food) return null;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAdd = async () => {
    if (!food.available) return;
    try {
      setIsAdding(true);
      await onAddToCart(food, quantity);
      setAddedRecently(true);
      setTimeout(() => {
        setAddedRecently(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to add food to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const totalPrice = (food.price * quantity).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 z-10 flex flex-col max-h-[90vh]">
        {/* Header Image & Overlays */}
        <div className="relative h-60 sm:h-72 w-full shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={
              food.imageUrl ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
            }
            alt={food.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Floating Close Button */}
          <button
            onClick={onClose}
            aria-label={t.foodModal.close}
            className="absolute top-4 right-4 z-20 rounded-full p-2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on Banner */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FF5A1F] px-3 py-1 text-xs font-bold text-white shadow-md">
              {localizeCategory(food.menuCategoryName || 'Specialty', language)}
            </span>
            {!food.available && (
              <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                {t.foodModal.soldOut}
              </span>
            )}
          </div>

          {/* Rating and Prep Time Badges on Image Bottom */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-xl bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {food.rating ? food.rating.toFixed(1) : '5.0'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-xl bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                {food.preparationTime || 15} {t.foodModal.minsPrep}
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-white drop-shadow-sm">
                ${food.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title & Restaurant info */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5A1F] mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>{food.restaurantName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {food.name}
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.foodModal.description}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {food.description || t.foodModal.defaultDescription}
            </p>
          </div>

          {/* Existing In-Cart notification */}
          {inCartQuantity > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-3.5 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {t.foodModal.inBasketNotice.replace('{count}', String(inCartQuantity))}
              </span>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF5A1F]" />
                {t.foodModal.customerReviews} {reviews.length > 0 && `(${reviews.length})`}
              </h3>
              {food.rating ? (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{food.rating.toFixed(1)} / 5.0</span>
                </div>
              ) : null}
            </div>

            {loadingReviews ? (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">{t.foodModal.loadingReviews}</div>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                {t.foodModal.noReviews}
              </p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rev.customerName}</span>
                      <div className="flex items-center text-amber-400 gap-0.5 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-slate-600 dark:text-slate-300 italic">&ldquo;{rev.comment}&rdquo;</p>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer Bar with Quantity and Add Button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1 || !food.available}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label={t.foodModal.decreaseQuantity}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-slate-100">{quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={!food.available}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label={t.foodModal.increaseQuantity}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Basket Button */}
          <Button
            size="lg"
            variant={food.available ? 'primary' : 'outline'}
            disabled={!food.available || isAdding}
            onClick={handleAdd}
            className="flex-1 rounded-2xl justify-between px-5 font-bold shadow-md shadow-[#FF5A1F]/20"
          >
            {addedRecently ? (
              <span className="w-full flex items-center justify-center gap-2 text-white">
                <Check className="w-4 h-4" /> {t.foodModal.addedToBasket}
              </span>
            ) : isAdding ? (
              <span className="w-full text-center text-white">{t.foodModal.adding}</span>
            ) : food.available ? (
              <>
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {t.foodModal.addToBasket}
                </span>
                <span>${totalPrice}</span>
              </>
            ) : (
              <span className="w-full text-center">{t.foodModal.itemSoldOut}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
