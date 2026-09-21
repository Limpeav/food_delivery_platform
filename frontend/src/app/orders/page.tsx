'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Store,
  ArrowRight,
  Package,
  CheckCircle2,
  AlertCircle,
  Bike,
  ChefHat,
  Search,
  Receipt,
  Sparkles,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { useAuthStore } from '@/stores/authStore';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, authLoading, router, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders({ page, size: 20 });
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const isActiveStatus = (status: OrderStatus) => {
    return !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(status);
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const activeCount = orders.filter((o) => isActiveStatus(o.status)).length;
    const completedCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const totalSpent = orders
      .filter((o) => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { activeCount, completedCount, totalSpent };
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 animate-pulse">
            <Bike className="w-3.5 h-3.5 text-blue-600" />
            Out for Delivery
          </span>
        );
      case 'PREPARING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/80">
            <ChefHat className="w-3.5 h-3.5 text-orange-600" />
            In Kitchen
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            Ready for Pickup
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            {status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending confirmation
          </span>
        );
    }
  };

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'CONFIRMED':
      case 'PREPARING':
        return 2;
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Filter by tab
      if (filter === 'active' && !isActiveStatus(o.status)) return false;
      if (filter === 'completed' && o.status !== 'DELIVERED') return false;
      if (filter === 'cancelled' && !['CANCELLED', 'REJECTED'].includes(o.status)) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRestaurant = o.restaurantName?.toLowerCase().includes(query);
        const matchesItems = o.items.some((i) => i.foodName.toLowerCase().includes(query));
        const matchesId = o.id.toString().includes(query);
        return matchesRestaurant || matchesItems || matchesId;
      }

      return true;
    });
  }, [orders, filter, searchQuery]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Metrics */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            My Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track live deliveries in real-time, review meal receipts, and reorder your favorites
          </p>
        </div>

        {/* Clean Summary KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Deliveries
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {metrics.activeCount}
                </span>
                {metrics.activeCount > 0 && (
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Completed Orders
              </span>
              <span className="text-2xl font-black text-slate-900 block">
                {metrics.completedCount}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Meals Enjoyed
              </span>
              <span className="text-2xl font-black text-[#FF5A1F] block">
                ${metrics.totalSpent.toFixed(2)}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#FF5A1F] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search restaurant or food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-full sm:w-60 focus:bg-white focus:outline-none focus:border-[#FF5A1F] transition-all"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <Loading message="Loading orders..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title={
            filter === 'all'
              ? 'You haven’t placed any orders yet'
              : `No ${filter} orders found`
          }
          description={
            filter === 'all'
              ? 'Explore our curated selection of local restaurants and start your order today!'
              : 'Try changing your search or filters to see past orders.'
          }
          actionLabel="Explore Restaurants"
          onAction={() => router.push('/restaurants')}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const active = isActiveStatus(order.status);
            const step = getStepProgress(order.status);

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-5"
              >
                {/* Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center font-black text-base shrink-0 border border-orange-100">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">
                          {order.restaurantName}
                        </h3>
                        <span className="font-mono text-xs font-bold text-slate-400">
                          #{order.id.toString().padStart(6, '0')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Active Order Progress Stepper Bar */}
                {active && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className={step >= 1 ? 'text-[#FF5A1F]' : ''}>Order Placed</span>
                      <span className={step >= 2 ? 'text-[#FF5A1F]' : ''}>In Kitchen</span>
                      <span className={step >= 3 ? 'text-[#FF5A1F]' : ''}>Rider Dispatched</span>
                      <span className={step >= 4 ? 'text-[#FF5A1F]' : ''}>Delivered</span>
                    </div>

                    {/* Progress Track */}
                    <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#FF5A1F] transition-all duration-500"
                        style={{
                          width:
                            step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Items Preview List */}
                <div className="space-y-2 py-1">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                      >
                        <span className="font-extrabold text-[#FF5A1F]">
                          {item.quantity}×
                        </span>
                        <span>{item.foodName}</span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          (${item.subtotal.toFixed(2)})
                        </span>
                      </span>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded-xl">
                      <span className="font-bold">Special Note:</span> {order.notes}
                    </p>
                  )}
                </div>

                {/* Card Bottom Row: Pricing & Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Total Amount ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                      {order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : 'Cash'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {active ? (
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-xl gap-1.5 font-extrabold shadow-sm"
                        >
                          <Bike className="w-4 h-4" />
                          Track Live Delivery
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href={`/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs gap-1.5 font-bold"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-400" />
                            View Receipt
                          </Button>
                        </Link>

                        {order.restaurantId && (
                          <Link href={`/restaurants/${order.restaurantId}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="rounded-xl text-xs gap-1.5 font-bold bg-[#FFF1EB] text-[#FF5A1F] hover:bg-[#FFE3D6]"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Order Again
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={20}
            onPageChange={(p) => setPage(p - 1)}
            className="px-2"
          />
        </div>
      )}
    </div>
  );
}
