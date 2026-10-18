'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { FoodItem, FoodOptionGroup, FoodOptionItem, Review } from '@/types';
import { reviewService } from '@/services/reviewService';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/stores/languageStore';
import { localizeCategory } from '@/locales';

interface FoodDetailModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    food: FoodItem,
    quantity: number,
    selectedOptionItemIds?: number[],
    selectedOptions?: string,
    specialInstructions?: string
  ) => Promise<void>;
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
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<number, number[]>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedRecently, setAddedRecently] = useState(false);

  // Initialize options and fetch reviews when food opens
  useEffect(() => {
    if (isOpen && food) {
      setQuantity(1);
      setSpecialInstructions('');
      setAddedRecently(false);
      setLoadingReviews(true);

      // Initialize default options
      const initialMap: Record<number, number[]> = {};
      if (food.optionGroups && food.optionGroups.length > 0) {
        food.optionGroups.forEach((group) => {
          const defaultOpt =
            group.options.find((o) => o.isDefault) ||
            (group.required && group.options.length > 0 ? group.options[0] : null);

          if (defaultOpt) {
            initialMap[group.id] = [defaultOpt.id];
          } else {
            initialMap[group.id] = [];
          }
        });
      }
      setSelectedOptionsMap(initialMap);

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

  // Handle escape key
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

  // Calculate modifier pricing
  const additionalPriceTotal = useMemo(() => {
    if (!food?.optionGroups) return 0;
    let total = 0;
    for (const group of food.optionGroups) {
      const selectedIds = selectedOptionsMap[group.id] || [];
      for (const opt of group.options) {
        if (selectedIds.includes(opt.id)) {
          total += Number(opt.additionalPrice || 0);
        }
      }
    }
    return total;
  }, [food, selectedOptionsMap]);

  const unitPrice = (food?.price || 0) + additionalPriceTotal;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  // Validate required groups
  const missingRequiredGroup = useMemo(() => {
    if (!food?.optionGroups) return null;
    for (const group of food.optionGroups) {
      if (group.required) {
        const selected = selectedOptionsMap[group.id] || [];
        const min = group.minSelect || 1;
        if (selected.length < min) {
          return group;
        }
      }
    }
    return null;
  }, [food, selectedOptionsMap]);

  if (!isOpen || !food) return null;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  // Toggle option selection
  const handleSelectOption = (group: FoodOptionGroup, option: FoodOptionItem) => {
    const isSingleSelect = group.maxSelect === 1;
    const current = selectedOptionsMap[group.id] || [];

    if (isSingleSelect) {
      setSelectedOptionsMap((prev) => ({
        ...prev,
        [group.id]: [option.id],
      }));
    } else {
      // Multi-select
      const isAlreadySelected = current.includes(option.id);
      let updated: number[];
      if (isAlreadySelected) {
        updated = current.filter((id) => id !== option.id);
      } else {
        const max = group.maxSelect || Infinity;
        if (current.length >= max) {
          return; // reached limit
        }
        updated = [...current, option.id];
      }
      setSelectedOptionsMap((prev) => ({
        ...prev,
        [group.id]: updated,
      }));
    }
  };

  const handleAdd = async () => {
    if (!food.available || missingRequiredGroup) return;
    try {
      setIsAdding(true);

      // Gather option item IDs
      const allSelectedIds = Object.values(selectedOptionsMap).flat();

      // Format human-readable string
      const optionLabels: string[] = [];
      if (food.optionGroups) {
        food.optionGroups.forEach((group) => {
          const selectedInGroup = selectedOptionsMap[group.id] || [];
          const selectedItems = group.options.filter((o) => selectedInGroup.includes(o.id));
          if (selectedItems.length > 0) {
            const itemTexts = selectedItems.map((item) => {
              const priceStr =
                Number(item.additionalPrice) > 0 ? ` (+$${Number(item.additionalPrice).toFixed(2)})` : '';
              return `${item.name}${priceStr}`;
            });
            optionLabels.push(`${group.name}: ${itemTexts.join(', ')}`);
          }
        });
      }
      const formattedOptions = optionLabels.join(' • ');

      await onAddToCart(
        food,
        quantity,
        allSelectedIds,
        formattedOptions || undefined,
        specialInstructions.trim() || undefined
      );

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 z-10 flex flex-col max-h-[92vh]">
        {/* Header Image & Overlays */}
        <div className="relative h-56 sm:h-64 w-full shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={
              food.imageUrl ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
            }
            alt={food.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/30" />

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

          {/* Rating and Base Price on Image Bottom */}
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
              <span className="text-xs uppercase tracking-wider text-slate-300 block font-semibold">
                Base Price
              </span>
              <span className="text-2xl font-black text-white drop-shadow-sm">
                ${food.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Title & Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5A1F]">
              <Store className="w-3.5 h-3.5" />
              <span>{food.restaurantName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {food.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {food.description || t.foodModal.defaultDescription}
            </p>

            {inCartQuantity > 0 && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-3.5 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 mt-2">
                <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t.foodModal.inBasketNotice.replace('{count}', String(inCartQuantity))}</span>
              </div>
            )}
          </div>

          {/* Option Groups (Modifiers) */}
          {food.optionGroups && food.optionGroups.length > 0 && (
            <div className="pt-4 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Customize Your Meal
                </h3>
              </div>

              {food.optionGroups.map((group) => {
                const selectedInGroup = selectedOptionsMap[group.id] || [];
                const isSingle = group.maxSelect === 1;

                return (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {group.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isSingle
                            ? 'Choose 1 option'
                            : group.maxSelect
                            ? `Choose up to ${group.maxSelect} options`
                            : 'Choose any number of options'}
                        </p>
                      </div>

                      {group.required ? (
                        <span className="shrink-0 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#FF5A1F] text-[10px] font-bold px-2 py-0.5 border border-orange-200 dark:border-orange-900/60">
                          Required
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold px-2 py-0.5">
                          Optional
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="space-y-1.5">
                      {group.options.map((opt) => {
                        const isSelected = selectedInGroup.includes(opt.id);
                        const addPrice = Number(opt.additionalPrice || 0);

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectOption(group, opt)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                              isSelected
                                ? 'border-[#FF5A1F] bg-[#FFF1EB]/50 dark:bg-orange-950/30 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Radio or Checkbox indicator */}
                              <div
                                className={`flex items-center justify-center w-4 h-4 transition-all ${
                                  isSingle
                                    ? `rounded-full border ${
                                        isSelected
                                          ? 'border-[#FF5A1F] bg-[#FF5A1F] text-white'
                                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                      }`
                                    : `rounded-md border ${
                                        isSelected
                                          ? 'border-[#FF5A1F] bg-[#FF5A1F] text-white'
                                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                      }`
                                }`}
                              >
                                {isSelected && (
                                  isSingle ? (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  ) : (
                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                  )
                                )}
                              </div>
                              <span>{opt.name}</span>
                            </div>

                            <span
                              className={`text-[11px] font-bold ${
                                addPrice > 0
                                  ? 'text-[#FF5A1F]'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {addPrice > 0 ? `+ $${addPrice.toFixed(2)}` : 'Included'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="pt-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Special Instructions
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra spicy, sauce on the side, no onions please..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
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
              <div className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                {t.foodModal.loadingReviews}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                {t.foodModal.noReviews}
              </p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-2.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {rev.customerName}
                      </span>
                      <div className="flex items-center text-amber-400 gap-0.5 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer Bar with Quantity and Add Button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
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
            <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-slate-100">
              {quantity}
            </span>
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
            variant={food.available && !missingRequiredGroup ? 'primary' : 'outline'}
            disabled={!food.available || isAdding || !!missingRequiredGroup}
            onClick={handleAdd}
            className="flex-1 rounded-2xl justify-between px-5 font-bold shadow-md shadow-[#FF5A1F]/20"
          >
            {addedRecently ? (
              <span className="w-full flex items-center justify-center gap-2 text-white">
                <Check className="w-4 h-4" /> {t.foodModal.addedToBasket}
              </span>
            ) : isAdding ? (
              <span className="w-full text-center text-white">{t.foodModal.adding}</span>
            ) : missingRequiredGroup ? (
              <span className="w-full text-center text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Select {missingRequiredGroup.name}
              </span>
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
