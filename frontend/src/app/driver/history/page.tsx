'use client';

import React, { useEffect, useState } from 'react';
import { Package, Clock, DollarSign, MapPin, Store, CheckCircle2, Bike } from 'lucide-react';
import { deliveryService } from '@/services/deliveryService';
import { DriverDashboardStats, Delivery } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export default function DriverHistoryPage() {
  const [stats, setStats] = useState<DriverDashboardStats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, delivPage] = await Promise.all([
        deliveryService.getDriverDashboard().catch(() => null),
        deliveryService.getMyDeliveries({ page, size: 20 }).catch(() => ({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
          last: true,
        })),
      ]);
      setStats(dashStats);
      setDeliveries(delivPage.content || []);
      setTotalPages(delivPage.totalPages || 0);
      setTotalElements(delivPage.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
      case 'REJECTED':
        return 'danger';
      default:
        return 'primary';
    }
  };

  if (loading && !stats) {
    return <Loading fullPage message="Loading delivery records..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Delivery Records & Payouts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your lifetime delivery activity, dispatched trips, and payouts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lifetime Completed Trips
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.completedDeliveries ?? 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Earnings Payout
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ${stats?.totalEarnings?.toFixed(2) ?? '0.00'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Deliveries History List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Trip History Log
        </h2>

        {deliveries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-2">
            <Bike className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No completed trips yet</p>
            <p className="text-[11px] text-slate-400">
              Your delivered customer orders and payouts will be listed here.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {deliveries.map((deliv) => (
              <div
                key={deliv.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-900">
                      Order #{deliv.orderId.toString().padStart(6, '0')}
                    </span>
                    <Badge variant={getStatusVariant(deliv.status)} size="sm">
                      {deliv.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {new Date(deliv.createdAt).toLocaleDateString()} at{' '}
                      {new Date(deliv.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <Store className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span>{deliv.restaurantName}</span>
                    <span className="text-slate-300">•</span>
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate max-w-xs">{deliv.deliveryAddress}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block uppercase font-bold">
                    Courier Payout
                  </span>
                  <span className="text-base font-black text-emerald-600">
                    +${deliv.deliveryFee ? deliv.deliveryFee.toFixed(2) : '2.50'}
                  </span>
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

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Your account is in good standing</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          All delivery fees are credited directly to your partner wallet upon delivery confirmation.
        </p>
      </div>
    </div>
  );
}
