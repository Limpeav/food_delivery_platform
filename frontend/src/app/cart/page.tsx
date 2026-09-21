'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, Store, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, authLoading, router, fetchCart]);

  if (isLoading && !cart) {
    return <Loading fullPage message="Loading your cart..." />;
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your cart is empty"
          description="Looks like you haven't added any delicious food to your cart yet."
          actionLabel="Explore Restaurants"
          onAction={() => router.push('/restaurants')}
        />
      </div>
    );
  }

  const minOrderMet = (cart?.subtotal || 0) >= (cart?.restaurantMinimumOrder || 0);
  const diffToMin = (cart?.restaurantMinimumOrder || 0) - (cart?.subtotal || 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your selected dishes before proceeding to checkout
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Restaurant Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-[#FFF1EB]/50 p-4">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-[#FF5A1F]" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Ordering from</p>
                <h3 className="text-sm font-bold text-slate-900">
                  {cart?.restaurantName || 'Restaurant'}
                </h3>
              </div>
            </div>
            {cart?.restaurantId && (
              <Link
                href={`/restaurants/${cart.restaurantId}`}
                className="text-xs font-bold text-[#FF5A1F] hover:underline"
              >
                + Add more items
              </Link>
            )}
          </div>

          {/* Minimum Order Warning */}
          {!minOrderMet && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Minimum order is ${cart?.restaurantMinimumOrder?.toFixed(2)}. Add $
                {diffToMin.toFixed(2)} more to place your order.
              </span>
            </div>
          )}

          {/* Items */}
          <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                {item.foodImageUrl && (
                  <img
                    src={item.foodImageUrl}
                    alt={item.foodName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {item.foodName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ${item.unitPrice.toFixed(2)} each
                  </p>
                </div>

                {/* Quantity Controller */}
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1 bg-slate-50">
                  <button
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[60px]">
                  <span className="text-sm font-black text-slate-900">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({cart?.totalItems} items)</span>
              <span className="font-semibold text-slate-800">
                ${cart?.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery Fee</span>
              <span className="font-semibold text-slate-800">
                ${cart?.deliveryFee.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold text-slate-900">
              <span>Estimated Total</span>
              <span className="text-base font-black text-[#FF5A1F]">
                ${cart?.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <Link href="/checkout" className="block">
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-2xl gap-2 font-bold"
              disabled={!minOrderMet}
            >
              Checkout Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {!minOrderMet && (
            <p className="text-[11px] text-center text-amber-600 font-medium">
              Add more items to satisfy minimum order
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
