'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CheckCircle2, Bike, Calendar, ArrowUpRight } from 'lucide-react';
import { driverService } from '@/services/driverService';
import { DriverDashboardStats } from '@/types';
import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/stores/languageStore';

export default function DriverEarningsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DriverDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverService
      .getDashboardStats()
      .then((s) => setStats(s))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading fullPage message={t.common.loading} />;

  const todayEarnings = stats?.todayEarnings || 0;
  const totalEarnings = stats?.totalEarnings || 0;
  const completedDeliveries = stats?.completedDeliveries || 0;
  const avgPerDelivery = completedDeliveries > 0 ? totalEarnings / completedDeliveries : 2.5;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          {t.driver.earnings}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.driver.payoutBreakdown}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t.driver.todayEarnings}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ${todayEarnings.toFixed(2)}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> {t.driver.shiftActiveToday}
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t.driver.lifetimeEarnings}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ${totalEarnings.toFixed(2)}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.driver.totalPayoutsProcessed}</p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t.driver.completedTrips}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {completedDeliveries}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF5A1F] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Avg ~${avgPerDelivery.toFixed(2)} / trip
          </p>
        </div>
      </div>

      {/* Compensation Policy Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bike className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {t.driver.payoutBreakdown}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">100% Delivery Fee</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Every dollar of the delivery fee charged to the customer goes directly to your courier earnings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">100% Customer Tips</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Cravery never takes commission on gratuity or direct tips provided by diners.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">Direct Weekly Payout</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Earnings are deposited weekly to your bank or mobile wallet without transfer deductions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
