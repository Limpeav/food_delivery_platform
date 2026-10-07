'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Banknote,
  Tag,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { addressService } from '@/services/addressService';
import { couponService } from '@/services/couponService';
import { orderService } from '@/services/orderService';
import { Address } from '@/types';

type CouponValidationResult = {
  code: string;
  discount: number;
  valid: boolean;
  message?: string;
};
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { LocationPicker, LocationPickerValue } from '@/components/ui/LocationPicker';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { cart, fetchCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newCity, setNewCity] = useState('Phnom Penh');
  const [newLocation, setNewLocation] = useState<LocationPickerValue>({
    lat: 11.5564,
    lng: 104.9282,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchCart();
      loadAddresses();
    }
  }, [isAuthenticated, authLoading, router, fetchCart]);

  const loadAddresses = async () => {
    try {
      const list = await addressService.getAddresses();
      setAddresses(list);
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await couponService.validateCoupon(couponCode.trim(), cart.subtotal);
      if (res.valid) {
        setCouponResult(res);
      } else {
        setCouponError('Invalid coupon code');
        setCouponResult(null);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon code');
      setCouponResult(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newPhone || !newAddressLine) return;
    setSavingAddress(true);
    try {
      const created = await addressService.createAddress({
        label: newLabel,
        recipientName: newRecipient,
        phoneNumber: newPhone,
        addressLine: newAddressLine,
        city: newCity,
        latitude: newLocation.lat,
        longitude: newLocation.lng,
        isDefault: addresses.length === 0,
      });
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setAddressModalOpen(false);
      setNewAddressLine('');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setOrderError('Please select or add a delivery address');
      return;
    }
    setSubmitting(true);
    setOrderError(null);
    try {
      const order = await orderService.createOrder({
        addressId: selectedAddressId,
        paymentMethod: 'CASH_ON_DELIVERY',
        couponCode: couponResult?.valid ? couponCode : undefined,
        notes: orderNotes.trim() || undefined,
      });
      // Refresh cart
      await fetchCart();
      // Navigate to order details / live tracking
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart) {
    return <Loading fullPage message="Loading checkout details..." />;
  }

  const subtotal = cart.subtotal;
  const deliveryFee = cart.deliveryFee;
  const discount = couponResult?.discount || 0;
  const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Checkout
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Complete your delivery details and choose payment method
        </p>
      </div>

      {orderError && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 text-xs font-semibold text-rose-700 dark:rose-300">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Delivery Address */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF5A1F]" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Delivery Address
                </h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewRecipient(user?.name || '');
                  setNewPhone(user?.phoneNumber || '');
                  setAddressModalOpen(true);
                }}
                className="rounded-xl text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  No saved addresses found. Please add a delivery address to proceed.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setNewRecipient(user?.name || '');
                    setNewPhone(user?.phoneNumber || '');
                    setAddressModalOpen(true);
                  }}
                  className="rounded-xl"
                >
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#FF5A1F] bg-[#FFF1EB]/40 dark:bg-orange-950/20 ring-1 ring-[#FF5A1F]'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {addr.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {addr.recipientName} ({addr.phoneNumber})
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {addr.addressLine}, {addr.city}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#FF5A1F]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Payment Method
              </h2>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-300 dark:ring-emerald-700/60">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Cash on Delivery</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Pay cash to the courier upon arrival</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0" />
            </div>
          </div>

          {/* Section 3: Delivery Notes */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Drop-off Instructions (Optional)
              </label>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                'Leave at door',
                'Meet outside / downstairs',
                'Leave at lobby / reception',
                'Call upon arrival',
                'Ring doorbell',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setOrderNotes((prev) =>
                      prev ? `${prev}, ${preset}` : preset
                    );
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-200 dark:hover:border-orange-900 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#FF5A1F] transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Ring doorbell, leave food at condo lobby, extra napkins..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FF5A1F]" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Voucher / Promo Code</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs uppercase font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleApplyCoupon}
                isLoading={validatingCoupon}
                className="rounded-xl text-xs"
              >
                Apply
              </Button>
            </div>

            {couponResult?.valid && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Coupon &apos;{couponCode}&apos; applied (-${couponResult.discount.toFixed(2)})
              </p>
            )}

            {couponError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {couponError}
              </p>
            )}
          </div>

          {/* Order Totals Card */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Total Breakdown</h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${deliveryFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
                <span>Final Total</span>
                <span className="text-lg font-black text-[#FF5A1F]">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              isLoading={submitting}
              className="w-full rounded-2xl gap-2 font-bold"
            >
              Confirm & Place Order <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Pinpoint Delivery Address"
        description="Pin your exact location on the map and enter street details"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
          {/* Map Pin Location Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Pin Delivery Location on Map
            </label>
            <LocationPicker
              value={newLocation}
              onChange={(loc) => {
                setNewLocation(loc);
                if (loc.address && !newAddressLine) {
                  setNewAddressLine(loc.address);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Label"
              placeholder="Home, Office, Apartment..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
            />
            <Input
              label="City"
              placeholder="Phnom Penh"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Recipient Name"
              placeholder="John Doe"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+855 12 345 678"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Street Address / Building / Unit"
            placeholder="Street 240, Unit 4B, Sky Villa"
            value={newAddressLine}
            onChange={(e) => setNewAddressLine(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={savingAddress}
            >
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
