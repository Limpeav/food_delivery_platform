'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Store,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { cart, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, fetchCart]);

  // Lock body scroll and listen for escape key
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

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const minimumOrder = cart?.restaurantMinimumOrder || 0;
  const subtotal = cart?.subtotal || 0;
  const minOrderMet = subtotal >= minimumOrder;
  const diffToMin = Math.max(0, minimumOrder - subtotal);
  const minOrderProgress =
    minimumOrder > 0 ? Math.min(100, Math.round((subtotal / minimumOrder) * 100)) : 100;

  return (
    <div
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over Panel (Right to Left) */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] md:w-[490px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1EB] text-[#FF5A1F]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">Your Basket</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {cart && cart.totalItems > 0
                    ? `${cart.totalItems} ${cart.totalItems === 1 ? 'item' : 'items'} added`
                    : 'No items in basket'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEmpty && (
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart drawer"
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Minimum Order Progress Bar */}
          {!isEmpty && minimumOrder > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                {minOrderMet ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Minimum order reached (${minimumOrder.toFixed(2)})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Add <strong className="text-slate-900">${diffToMin.toFixed(2)}</strong> more to reach min. order
                  </span>
                )}
                <span className="font-bold text-slate-400 text-[11px]">{minOrderProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    minOrderMet ? 'bg-emerald-500' : 'bg-[#FF5A1F]'
                  }`}
                  style={{ width: `${minOrderProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Banner */}
        {!isEmpty && cart?.restaurantName && (
          <div className="px-6 py-2.5 bg-[#FFF1EB]/50 border-b border-[#FF5A1F]/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate">
                {cart.restaurantName}
              </span>
            </div>
            {cart.restaurantId && (
              <Link
                href={`/restaurants/${cart.restaurantId}`}
                onClick={onClose}
                className="text-[11px] font-bold text-[#FF5A1F] hover:underline shrink-0 ml-2"
              >
                + Add more
              </Link>
            )}
          </div>
        )}

        {/* Drawer Body (Items List or Empty State) */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 divide-y divide-slate-100">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center shadow-inner">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-900 text-xs font-black ring-2 ring-white">
                  0
                </span>
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h3 className="text-base font-black text-slate-900">Your basket is empty</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Discover delicious dishes from top rated restaurants and add them to your order.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  router.push('/restaurants');
                }}
                className="rounded-2xl px-6 font-bold shadow-md shadow-[#FF5A1F]/20"
              >
                Browse Restaurants
              </Button>
            </div>
          ) : (
            <div className="py-3 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center gap-3.5 group transition-colors"
                >
                  {/* Item Image */}
                  <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
                    <img
                      src={
                        item.foodImageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={item.foodName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                      {item.foodName}
                    </h4>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      ${item.unitPrice.toFixed(2)} each
                    </p>

                    {/* Quantity Stepper */}
                    <div className="mt-2 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Remove Action */}
                  <div className="text-right flex flex-col items-end justify-between h-16 py-0.5">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove from basket"
                      aria-label={`Remove ${item.foodName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black text-slate-900">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer (Sticky Actions & Summary) */}
        {!isEmpty && (
          <div className="p-5 sm:p-6 bg-white border-t border-slate-100 shadow-xl space-y-4 shrink-0">
            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">${cart?.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-bold text-slate-800">${cart?.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200/80 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-[#FF5A1F] text-lg">${cart?.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2.5 pt-1">
              <Button
                size="lg"
                variant="primary"
                disabled={!minOrderMet}
                onClick={() => {
                  onClose();
                  router.push('/checkout');
                }}
                className="w-full rounded-2xl py-3.5 font-black text-sm justify-between px-6 shadow-md shadow-[#FF5A1F]/25 cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to Checkout</span>
                <span className="flex items-center gap-1.5 font-bold">
                  ${cart?.totalAmount.toFixed(2)}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>

              <Link
                href="/cart"
                onClick={onClose}
                className="block text-center py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                View Full Cart Page
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                100% Secure Checkout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Fast Live Delivery
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
