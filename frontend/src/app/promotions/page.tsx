'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Check, Sparkles, Copy, Percent, DollarSign } from 'lucide-react';
import { couponService } from '@/services/couponService';
import { promotionService } from '@/services/promotionService';
import { Coupon, Promotion } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cList, pList] = await Promise.all([
          couponService.getActiveCoupons().catch(() => []),
          promotionService.getActivePromotions().catch(() => []),
        ]);
        setCoupons(cList);
        setPromotions(pList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return <Loading fullPage message="Loading promotional deals..." />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-3 py-1 text-xs font-bold text-[#FF5A1F] mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Deals & Vouchers
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Exclusive Offers & Coupons
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Apply these coupon vouchers during checkout to save money on your meals and delivery fees
        </p>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((cp) => (
          <div
            key={cp.id}
            className="rounded-3xl border border-dashed border-orange-200 bg-gradient-to-br from-white to-orange-50/30 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5A1F] flex items-center justify-center font-black">
                  {cp.discountType === 'PERCENTAGE' ? (
                    <Percent className="w-5 h-5" />
                  ) : (
                    <DollarSign className="w-5 h-5" />
                  )}
                </div>
                <Badge variant="primary" size="sm">
                  {cp.discountType}
                </Badge>
              </div>

              <h3 className="text-xl font-black text-slate-900">
                {cp.discountType === 'PERCENTAGE'
                  ? `${cp.discountValue}% OFF`
                  : `$${cp.discountValue} OFF`}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Min. spend ${cp.minimumOrderAmount.toFixed(2)}
                {cp.maximumDiscount ? ` • Max cap $${cp.maximumDiscount.toFixed(2)}` : ''}
              </p>
            </div>

            {/* Voucher Code Box */}
            <div className="mt-6 pt-4 border-t border-orange-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Promo Code
                </span>
                <span className="font-mono text-sm font-black text-slate-800 tracking-wider">
                  {cp.code}
                </span>
              </div>

              <button
                onClick={() => handleCopy(cp.code)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all cursor-pointer shadow-2xs"
              >
                {copiedCode === cp.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
