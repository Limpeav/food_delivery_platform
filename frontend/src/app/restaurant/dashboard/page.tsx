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

export default function RestaurantDashboardPage() {
  const router = useRouter();
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
    return <Loading fullPage message="Loading restaurant metrics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-5 h-5 text-[#FF5A1F]" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {restaurant?.name || 'Restaurant Dashboard'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Monitor real-time kitchen operations, orders, and sales performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/restaurant/orders">
            <Button variant="primary" size="sm" className="rounded-xl text-xs gap-1.5 font-bold">
              <ShoppingBag className="w-4 h-4" /> Live Orders View
            </Button>
          </Link>
          <Link href="/restaurant/menu">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 font-bold">
              <Utensils className="w-4 h-4" /> Manage Menu
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Orders */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today&apos;s Orders
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.todayOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Completed: {stats?.completedOrders ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today&apos;s Revenue
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ${stats?.todayRevenue?.toFixed(2) ?? '0.00'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Gross food sales</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Action Required
            </p>
            <h3 className="text-2xl font-black text-amber-500 mt-1">
              {stats?.pendingOrders ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Pending kitchen approval</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Store Rating
            </p>
            <div className="flex items-center gap-1 mt-1">
              <h3 className="text-2xl font-black text-slate-900">
                {stats?.rating?.toFixed(1) ?? '5.0'}
              </h3>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Based on {stats?.reviewCount ?? 0} reviews
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Top Selling Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Orders</h2>
              <p className="text-xs text-slate-500">Recent customer requests</p>
            </div>
            <Link
              href="/restaurant/orders"
              className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No orders received yet today.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
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
                    <p className="text-xs text-slate-600">
                      {o.items.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
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
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Popular Menu Items</h2>
            <p className="text-xs text-slate-500">Highest grossing dishes</p>
          </div>

          {!stats?.topSellingFoods || stats.topSellingFoods.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Sales statistics will accumulate as customers order.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.topSellingFoods.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.foodName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {item.totalQuantity} units sold
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600">
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
