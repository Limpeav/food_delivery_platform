'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
  Bike,
  Users,
  Download,
  Calendar,
  Percent,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { AdminDashboardStats } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'monthly' | 'lifetime'>('monthly');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return <Loading fullPage message="Compiling enterprise financial reports..." />;
  }

  const getSelectedGmv = () => {
    if (!stats) return 0;
    switch (timeframe) {
      case 'today':
        return stats.todayRevenue || 0;
      case 'monthly':
        return stats.monthlyRevenue || 0;
      case 'lifetime':
        return stats.totalRevenue || 0;
    }
  };

  const selectedGmv = getSelectedGmv();
  // Standard marketplace split: 15% platform take rate, 85% merchant net
  const platformCommission = selectedGmv * 0.15;
  const merchantPayouts = selectedGmv * 0.85;

  const handleExportCsv = () => {
    if (!stats) return;
    const rows = [
      ['Metric', 'Value'],
      ['Timeframe', timeframe.toUpperCase()],
      ['Gross Merchandise Value (GMV)', `$${selectedGmv.toFixed(2)}`],
      ['Platform Commission (15%)', `$${platformCommission.toFixed(2)}`],
      ['Merchant Payouts (85%)', `$${merchantPayouts.toFixed(2)}`],
      ['Total Orders Processed', stats.totalOrders.toString()],
      ['Today Orders Processed', stats.todayOrders.toString()],
      ['Active Restaurants', stats.totalRestaurants.toString()],
      ['Active Drivers', stats.totalDrivers.toString()],
      ['Registered Customers', stats.totalCustomers.toString()],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `platform_report_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback('Report exported as CSV successfully');
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-[#FF5A1F]" />
            Financial Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform revenue reconciliation, take-rate analysis, merchant payouts, and unit economics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
            {(['today', 'monthly', 'lifetime'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                  timeframe === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'today' ? 'Today' : t === 'monthly' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="rounded-2xl text-xs font-bold flex items-center gap-1.5"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Merchandise Value</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            ${selectedGmv.toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-500">Total customer spending across all orders</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Take (15% Net)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-600">
            ${platformCommission.toFixed(2)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium">Platform gross profit retention</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Merchant Payouts (85%)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            ${merchantPayouts.toFixed(2)}
          </h3>
          <p className="text-[11px] text-slate-500">Disbursed to partner restaurant accounts</p>
        </div>
      </div>

      {/* Network Scale & Supply Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Customer Base</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalCustomers ?? 0}</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total registered consumer accounts</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Partner Restaurants</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalRestaurants ?? 0}</span>
            <Store className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.pendingRestaurants ?? 0} pending onboarding</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Couriers</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalDrivers ?? 0}</span>
            <Bike className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.pendingDrivers ?? 0} pending verification</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Lifetime Orders</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{stats?.totalOrders ?? 0}</span>
            <ShoppingBag className="w-5 h-5 text-[#FF5A1F]" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.todayOrders ?? 0} placed today</p>
        </div>
      </div>

      {/* Order Status Distribution Table & Breakdown */}
      {stats?.orderStatusDistribution && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Order Pipeline & Status Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live distribution of transaction states throughout the order fulfillment lifecycle
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Order Status</th>
                  <th className="pb-3 text-right">Volume</th>
                  <th className="pb-3 text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(stats.orderStatusDistribution).map(([status, count]) => {
                  const share = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
                  return (
                    <tr key={status} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">
                        {status.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 text-right font-black text-slate-900">
                        {count.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-500">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
