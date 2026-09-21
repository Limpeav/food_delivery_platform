'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Star,
  Award,
  Calendar,
} from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { RestaurantDashboardStats } from '@/types';
import { Loading } from '@/components/ui/Loading';

export default function RestaurantReportsPage() {
  const [stats, setStats] = useState<RestaurantDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantService
      .getRestaurantDashboard()
      .then((res) => setStats(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading fullPage message="Loading sales & performance analytics..." />;

  const todayRevenue = stats?.todayRevenue || 0;
  const todayOrders = stats?.todayOrders || 0;
  const pendingOrders = stats?.pendingOrders || 0;
  const completedOrders = stats?.completedOrders || 0;
  const topSelling = stats?.topSellingFoods || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          Business Reports & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Financial performance, volume metrics, and high-performing menu items
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today&apos;s Gross Sales
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">
              ${todayRevenue.toFixed(2)}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Real-time daily total</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today&apos;s Orders
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{todayOrders}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{completedOrders} fulfilled today</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Pending Kitchen
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-600">{pendingOrders}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Awaiting preparation</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Average Rating
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">
              {stats?.rating ? stats.rating.toFixed(1) : '5.0'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5A1F] flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-[#FF5A1F]" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{stats?.reviewCount || 0} reviews total</p>
        </div>
      </div>

      {/* Top Performing Dishes */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Top Selling Dishes by Revenue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your most popular dishes driving orders and customer retention
          </p>
        </div>

        {topSelling.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
            No sales data recorded yet for menu items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Dish Name</th>
                  <th className="pb-3 text-right">Units Sold</th>
                  <th className="pb-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSelling.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-400">#{i + 1}</td>
                    <td className="py-3 font-bold text-slate-900">{item.foodName}</td>
                    <td className="py-3 text-right text-slate-600 font-medium">
                      {item.totalQuantity} items
                    </td>
                    <td className="py-3 text-right font-black text-emerald-600">
                      ${Number(item.totalRevenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
