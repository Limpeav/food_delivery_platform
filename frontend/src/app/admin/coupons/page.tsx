'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, Percent, DollarSign } from 'lucide-react';
import { couponService } from '@/services/couponService';
import { Coupon } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('15');
  const [minOrder, setMinOrder] = useState('10');
  const [maxDiscount, setMaxDiscount] = useState('5');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAllCouponsAdmin();
      setCoupons(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const created = await couponService.createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minimumOrderAmount: parseFloat(minOrder) || 0,
        maxDiscountAmount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 500,
      });
      setCoupons([...coupons, created]);
      setModalOpen(false);
      setCode('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create coupon voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading vouchers..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Voucher & Coupon Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure campaign discount codes, percentage caps, and minimum basket requirements
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="rounded-xl text-xs gap-1.5 font-bold self-start"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((cp) => (
          <div
            key={cp.id}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-black text-slate-900 bg-orange-50 text-[#FF5A1F] px-2.5 py-1 rounded-lg border border-orange-200">
                  {cp.code}
                </span>
                <Badge variant="primary" size="sm">
                  {cp.discountType}
                </Badge>
              </div>

              <h3 className="text-xl font-black text-slate-900 mt-2">
                {cp.discountType === 'PERCENTAGE'
                  ? `${cp.discountValue}% OFF`
                  : `$${cp.discountValue} OFF`}
              </h3>

              <div className="space-y-1 text-xs text-slate-500 mt-2">
                <p>Min Spend: ${cp.minimumOrderAmount.toFixed(2)}</p>
                {cp.maximumDiscount && (
                  <p>Max Cap: ${cp.maximumDiscount.toFixed(2)}</p>
                )}
                <p>Usage: {cp.usedCount || 0} times</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => handleDeleteCoupon(cp.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete voucher"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Promotional Coupon"
        description="Issue a new voucher code for user orders"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 pt-2">
          <Input
            label="Coupon Code"
            placeholder="e.g. FLASH20"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENTAGE')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  discountType === 'PERCENTAGE'
                    ? 'border-[#FF5A1F] bg-[#FFF1EB] text-[#FF5A1F]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('FIXED')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  discountType === 'FIXED'
                    ? 'border-[#FF5A1F] bg-[#FFF1EB] text-[#FF5A1F]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Fixed Amount ($)
              </button>
            </div>
          </div>

          <Input
            label={discountType === 'PERCENTAGE' ? 'Discount Value (%)' : 'Discount Value ($)'}
            type="number"
            step="0.01"
            placeholder="15"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Order ($)"
              type="number"
              step="0.01"
              placeholder="10"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              required
            />
            <Input
              label="Max Cap ($)"
              type="number"
              step="0.01"
              placeholder="5"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              Create Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
