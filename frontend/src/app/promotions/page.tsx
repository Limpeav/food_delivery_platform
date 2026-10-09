'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Check, Sparkles, Copy, Percent, DollarSign } from 'lucide-react';
import { couponService } from '@/services/couponService';
import { promotionService } from '@/services/promotionService';
import { Coupon, Promotion } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from '@/stores/languageStore';

export default function PromotionsPage() {
  const { t } = useTranslation();
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
    return <Loading fullPage message={t.promotionsPage.loadingDeals} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-3 py-1 text-xs font-bold text-[#FF5A1F] mb-2">
          <Sparkles className="w-3.5 h-3.5" /> {t.promotionsPage.badge}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          {t.promotionsPage.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.promotionsPage.subtitle}
        </p>
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <EmptyState
          title={t.promotionsPage.noCoupons}
          description={t.promotionsPage.noCouponsDesc}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((cp) => (
            <div
              key={cp.id}
              className="rounded-3xl border border-dashed border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-white dark:from-slate-900 to-orange-50/30 dark:to-orange-950/20 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#FF5A1F] flex items-center justify-center font-black">
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

                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {cp.discountType === 'PERCENTAGE'
                    ? `${cp.discountValue}% ${t.promotionsPage.percentOff}`
                    : `$${cp.discountValue} ${t.promotionsPage.percentOff}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.promotionsPage.minSpend} ${cp.minimumOrderAmount.toFixed(2)}
                  {cp.maximumDiscount ? ` • ${t.promotionsPage.maxCap} $${cp.maximumDiscount.toFixed(2)}` : ''}
                </p>
              </div>

              {/* Voucher Code Box */}
              <div className="mt-6 pt-4 border-t border-orange-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {t.promotionsPage.promoCode}
                  </span>
                  <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-200 tracking-wider">
                    {cp.code}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(cp.code)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all cursor-pointer shadow-2xs"
                >
                  {copiedCode === cp.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> {t.promotionsPage.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> {t.promotionsPage.copyCode}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
