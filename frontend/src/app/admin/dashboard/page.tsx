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

export default function AdminDashboardPage() {
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
    return <Loading fullPage message="Loading platform metrics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Platform Overview
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time enterprise metrics, marketplace revenue, and partner approval queues
        </p>
      </div>

      {/* Pending Approvals Notice */}
      {((stats?.pendingRestaurants ?? 0) > 0 || (stats?.pendingDrivers ?? 0) > 0) && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Partner Applications Pending Approval</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                {stats?.pendingRestaurants ?? 0} restaurant(s) and {stats?.pendingDrivers ?? 0} driver(s) awaiting your review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(stats?.pendingRestaurants ?? 0) > 0 && (
              <Link href="/admin/restaurants">
                <Button size="sm" variant="secondary" className="rounded-xl text-xs font-bold">
                  Review Restaurants
                </Button>
              </Link>
            )}
            {(stats?.pendingDrivers ?? 0) > 0 && (
              <Link href="/admin/drivers">
                <Button size="sm" variant="secondary" className="rounded-xl text-xs font-bold">
                  Review Drivers
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.totalCustomers ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Registered customers</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Restaurants</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.totalRestaurants ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Active merchant stores</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Fleet</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.totalDrivers ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Active registered riders</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bike className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.totalOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Today: {stats?.todayOrders ?? 0} orders
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today&apos;s GMV</p>
          <h3 className="text-3xl font-black text-emerald-600">
            ${stats?.todayRevenue?.toFixed(2) ?? '0.00'}
          </h3>
          <p className="text-xs text-slate-500">Gross food and delivery volume today</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly GMV</p>
          <h3 className="text-3xl font-black text-slate-900">
            ${stats?.monthlyRevenue?.toFixed(2) ?? '0.00'}
          </h3>
          <p className="text-xs text-slate-500">Trailing 30-day processed transactions</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifetime Platform Volume</p>
          <h3 className="text-3xl font-black text-[#FF5A1F]">
            ${stats?.totalRevenue?.toFixed(2) ?? '0.00'}
          </h3>
          <p className="text-xs text-slate-500">Cumulative platform order sales</p>
        </div>
      </div>

      {/* Order Status Breakdown Distribution */}
      {stats?.orderStatusDistribution && Object.keys(stats.orderStatusDistribution).length > 0 && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Order Status Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(stats.orderStatusDistribution).map(([status, count]) => (
              <div key={status} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block truncate">
                  {status.replace(/_/g, ' ')}
                </span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
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
