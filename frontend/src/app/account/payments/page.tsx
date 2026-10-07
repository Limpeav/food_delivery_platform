'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  ArrowLeft,
  Receipt,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { orderService, PaymentInfo } from '@/services/orderService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else if (user.role !== 'CUSTOMER') {
        if (user.role === 'ADMIN') router.push('/admin/dashboard');
        else if (user.role === 'RESTAURANT_OWNER') router.push('/restaurant/dashboard');
        else if (user.role === 'DRIVER') router.push('/driver/dashboard');
      } else {
        loadPayments();
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyPaymentHistory();
      setPayments(data || []);
    } catch (err) {
      console.error('Failed to load payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </span>
              Payment History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View your transaction records and receipts for all delivered and active orders.
            </p>
          </div>

          <Link href="/help">
            <Button variant="outline" size="sm" className="rounded-2xl gap-2 text-xs">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              Payment FAQ
            </Button>
          </Link>
        </div>

        {/* Cash On Delivery Policy Notice */}
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-950">Cash on Delivery Platform Policy</h2>
              <p className="text-xs text-amber-800 mt-0.5">
                All platform orders are completed via Cash on Delivery (COD). Transactions are marked as pending upon checkout and verified as successful once paid to the courier.
              </p>
            </div>
          </div>
          <Badge variant="warning" size="sm" className="shrink-0">COD ONLY</Badge>
        </div>

        {/* Transactions Section */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading message="Loading your payment records..." />
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No payment transactions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              You haven&apos;t placed any orders yet. Once you make an order, your transaction receipts will be archived here.
            </p>
            <Link href="/restaurants">
              <Button size="sm" className="rounded-2xl">
                Browse Restaurants
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                All Transactions ({payments.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {payments.map((p) => {
                const isSuccess = p.status === 'SUCCESS';
                const isFailed = p.status === 'FAILED';

                return (
                  <div
                    key={p.id}
                    className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-600'
                            : isFailed
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isFailed ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-900">
                            ${p.amount.toFixed(2)}
                          </span>
                          <Badge
                            variant={isSuccess ? 'success' : isFailed ? 'danger' : 'warning'}
                            size="sm"
                          >
                            {p.status}
                          </Badge>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {p.paymentMethod === 'ONLINE_PAYMENT' ? 'Bakong KHQR' : 'Cash on Delivery'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Ref: <strong className="font-mono text-slate-700">{p.transactionReference}</strong></span>
                          <span>&bull;</span>
                          <span>{formatDateTime(p.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Link href={`/orders/${p.orderId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs gap-1.5 hover:border-amber-300 hover:text-amber-700"
                        >
                          Order #{p.orderId}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
