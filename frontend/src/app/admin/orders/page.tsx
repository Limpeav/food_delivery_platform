'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Clock, Store, MapPin, ArrowRight } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrdersAdmin({ page, size: 20 });
      setOrders(res.content);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (s: OrderStatus) => {
    switch (s) {
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
      case 'REJECTED':
        return 'danger';
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Global Orders Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete cross-merchant audit trail of all transactions and fulfillment statuses
        </p>
      </div>

      {loading ? (
        <Loading message="Loading all orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No orders logged"
          description="Platform orders will be listed here as customers order."
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {orders.map((o) => (
            <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    #{o.id.toString().padStart(6, '0')}
                  </span>
                  <Badge variant={getStatusVariant(o.status)} size="sm">
                    {o.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800">
                  {o.restaurantName} → {o.customerName || 'Customer'}
                </p>

                <p className="text-xs text-slate-500">
                  {o.items.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    ${o.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {o.paymentMethod.replace(/_/g, ' ')}
                  </span>
                </div>

                <Link href={`/orders/${o.id}`}>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={20}
            onPageChange={(p) => setPage(p - 1)}
            className="px-6 py-4 bg-slate-50/50"
          />
        </div>
      )}
    </div>
  );
}
