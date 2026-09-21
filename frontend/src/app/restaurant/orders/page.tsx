'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bike,
  AlertCircle,
  MapPin,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PREPARING' | 'COMPLETED'>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadOrders = async () => {
    try {
      const res = await orderService.getRestaurantOrders({ page, size: 20 });
      setOrders(res.content);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
      setPermissionError(null);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setPermissionError('Access denied: A registered Restaurant Owner account is required to access kitchen orders.');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        console.error('Failed to load restaurant orders:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    intervalRef.current = setInterval(loadOrders, 8000); // Polling for incoming orders
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [page]);

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    setActionLoading(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'PENDING') return o.status === 'PENDING';
    if (activeTab === 'PREPARING') return ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status);
    if (activeTab === 'COMPLETED') return ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Live Kitchen & Order Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept orders, prepare meals, and hand off to delivery riders
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          className="rounded-xl text-xs gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {permissionError && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-amber-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-amber-950">{permissionError}</p>
            <p className="text-amber-800 mt-1 leading-relaxed">
              Your active session lacks permissions to manage kitchen orders for this restaurant. Please sign in with the registered restaurant owner credentials.
            </p>
          </div>
          <Link
            href="/restaurant/login?switch=true"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
          >
            Switch Account
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'PENDING', 'PREPARING', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#FF5A1F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <Loading message="Loading incoming orders..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No orders in this queue"
          description="Incoming orders will automatically show up here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-black text-slate-900">
                      #{order.id.toString().padStart(6, '0')}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <Badge
                    variant={
                      order.status === 'DELIVERED'
                        ? 'success'
                        : order.status === 'CANCELLED' || order.status === 'REJECTED'
                        ? 'danger'
                        : 'primary'
                    }
                    size="sm"
                  >
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Items List */}
                <div className="py-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        <span className="font-bold text-[#FF5A1F]">{item.quantity}×</span> {item.foodName}
                      </span>
                      <span className="text-slate-500 font-mono">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Notes if any */}
                {order.notes && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 font-medium">
                    <span className="font-bold">Customer Note:</span> {order.notes}
                  </div>
                )}

                {/* Total & Delivery Address */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    Total: ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Pipeline Buttons */}
              <div className="pt-2">
                {order.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                      isLoading={actionLoading === order.id}
                      className="flex-1 rounded-xl text-xs font-bold gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept Order
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                      isLoading={actionLoading === order.id}
                      className="rounded-xl text-xs font-bold gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}

                {order.status === 'CONFIRMED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    isLoading={actionLoading === order.id}
                    className="w-full rounded-xl text-xs font-bold gap-1.5"
                  >
                    <ChefHat className="w-4 h-4" /> Start Cooking / Preparing
                  </Button>
                )}

                {order.status === 'PREPARING' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                    isLoading={actionLoading === order.id}
                    className="w-full rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Bike className="w-4 h-4" /> Food Ready (Dispatch Rider)
                  </Button>
                )}

                {order.status === 'READY_FOR_PICKUP' && (
                  <div className="text-center py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl">
                    Waiting for Rider Pickup
                  </div>
                )}

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <div className="text-center py-2 text-xs font-bold text-amber-600 bg-amber-50 rounded-xl">
                    Rider en route to Customer
                  </div>
                )}

                {order.status === 'DELIVERED' && (
                  <div className="text-center py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">
                    Order Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page + 1}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={20}
        onPageChange={(p) => setPage(p - 1)}
        className="px-2"
      />
    </div>
  );
}
