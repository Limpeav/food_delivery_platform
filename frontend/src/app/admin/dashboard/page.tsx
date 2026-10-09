'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Bike,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { AdminDashboardStats } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/stores/languageStore';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats().catch(() => null);
        setStats(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <Loading fullPage message={t.common.loading} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t.admin.overview}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t.admin.systemMetrics}
        </p>
      </div>

      {/* Pending Approvals Notice */}
      {((stats?.pendingRestaurants ?? 0) > 0 || (stats?.pendingDrivers ?? 0) > 0) && (
        <div className="rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">{t.admin.pendingApprovals}</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {stats?.pendingRestaurants ?? 0} {t.admin.restaurants} & {stats?.pendingDrivers ?? 0} {t.admin.drivers} {t.admin.pendingApprovalsDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(stats?.pendingRestaurants ?? 0) > 0 && (
              <Link href="/admin/restaurants">
                <Button size="sm" variant="secondary" className="rounded-xl text-xs font-bold">
                  {t.admin.reviewRestaurants}
                </Button>
              </Link>
            )}
            {(stats?.pendingDrivers ?? 0) > 0 && (
              <Link href="/admin/drivers">
                <Button size="sm" variant="secondary" className="rounded-xl text-xs font-bold">
                  {t.admin.reviewDrivers}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">{t.admin.totalCustomers}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalCustomers ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.roles.CUSTOMER}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">{t.admin.totalRestaurants}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalRestaurants ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.roles.RESTAURANT_OWNER}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">{t.admin.activeDrivers}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalDrivers ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.roles.DRIVER}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Bike className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">{t.admin.totalOrders}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t.common.status}: {stats?.todayOrders ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF5A1F] dark:text-[#FF7A45] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Today&apos;s GMV</p>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ${stats?.todayRevenue?.toFixed(2) ?? '0.00'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gross food and delivery volume today</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Monthly GMV</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            ${stats?.monthlyRevenue?.toFixed(2) ?? '0.00'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Trailing 30-day processed transactions</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Lifetime Platform Volume</p>
          <h3 className="text-3xl font-black text-[#FF5A1F] dark:text-[#FF7A45]">
            ${stats?.totalRevenue?.toFixed(2) ?? '0.00'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cumulative platform order sales</p>
        </div>
      </div>

      {/* Order Status Breakdown Distribution */}
      {stats?.orderStatusDistribution && Object.keys(stats.orderStatusDistribution).length > 0 && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Status Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(stats.orderStatusDistribution).map(([status, count]) => (
              <div key={status} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                  {status.replace(/_/g, ' ')}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
