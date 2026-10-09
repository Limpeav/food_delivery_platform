'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Star,
  Clock,
  ArrowRight,
  AlertCircle,
  Utensils,
  Store,
} from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { orderService } from '@/services/orderService';
import { RestaurantDashboardStats, Order, Restaurant } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/stores/languageStore';

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState<RestaurantDashboardStats | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [dashStats, myRest, ordersPage] = await Promise.all([
          restaurantService.getRestaurantDashboard().catch(() => null),
          restaurantService.getMyRestaurant().catch(() => null),
          orderService.getRestaurantOrders({ page: 0, size: 5 }).catch(() => ({ content: [] })),
        ]);
        if (myRest && myRest.status === 'PENDING') {
          router.push('/restaurant/pending');
          return;
        }
        setStats(dashStats);
        setRestaurant(myRest);
        setRecentOrders(ordersPage.content);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <Loading fullPage message={t.common.loading} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-5 h-5 text-[#FF5A1F]" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {restaurant?.name || t.restaurant.dashboard}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.restaurant.operationalTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/restaurant/orders">
            <Button variant="primary" size="sm" className="rounded-xl text-xs gap-1.5 font-bold shadow-xs">
              <ShoppingBag className="w-4 h-4" /> {t.restaurant.viewLiveOrders}
            </Button>
          </Link>
          <Link href="/restaurant/menu">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs">
              <Utensils className="w-4 h-4" /> {t.restaurant.manageMenu}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Orders */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.restaurant.todayOrders}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.todayOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t.common.status}: {stats?.completedOrders ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#FF5A1F] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.restaurant.todayRevenue}
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ${stats?.todayRevenue?.toFixed(2) ?? '0.00'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.roles.RESTAURANT_OWNER}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.restaurant.activeOrders}
            </p>
            <h3 className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
              {stats?.pendingOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.common.pending}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.restaurant.reviews}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.rating?.toFixed(1) ?? '5.0'}
              </h3>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Based on {stats?.reviewCount ?? 0} reviews
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Top Selling Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t.restaurant.liveOrders}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.restaurant.recentOrders}</p>
            </div>
            <Link
              href="/restaurant/orders"
              className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
            >
              {t.common.all} {t.restaurant.liveOrders} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              {t.common.noData}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        #{o.id.toString().padStart(6, '0')}
                      </span>
                      <Badge
                        variant={
                          o.status === 'DELIVERED'
                            ? 'success'
                            : o.status === 'CANCELLED' || o.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {o.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {o.items.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      ${o.totalAmount.toFixed(2)}
                    </span>
                    <Link
                      href="/restaurant/orders"
                      className="text-[11px] font-bold text-[#FF5A1F] hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Top Selling Dishes */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Popular Menu Items</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Highest grossing dishes</p>
          </div>

          {!stats?.topSellingFoods || stats.topSellingFoods.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              Sales statistics will accumulate as customers order.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.topSellingFoods.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.foodName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.totalQuantity} units sold
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    ${item.totalRevenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
