'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bike,
  Power,
  DollarSign,
  Package,
  MapPin,
  Store,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { deliveryService } from '@/services/deliveryService';
import { Driver, DriverDashboardStats, Delivery } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { subscribeToAvailableDeliveries } from '@/lib/websocket';
import { useTranslation } from '@/stores/languageStore';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [stats, setStats] = useState<DriverDashboardStats | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [availablePage, setAvailablePage] = useState(1);

  useEffect(() => {
    loadData();

    // Instant real-time dispatch listener via WebSocket
    const unsubscribe = subscribeToAvailableDeliveries((payload: any) => {
      console.log('Real-time delivery job alert via WebSocket:', payload);
      loadDeliveries();
    });

    const interval = setInterval(loadDeliveries, 15000); // Low-frequency fallback
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prof, dashStats, active, avail] = await Promise.all([
        deliveryService.getMyDriverProfile().catch(() => null),
        deliveryService.getDriverDashboard().catch(() => null),
        deliveryService.getActiveDelivery().catch(() => null),
        deliveryService.getAvailableDeliveries().catch(() => []),
      ]);
      setDriver(prof);
      setStats(dashStats);
      setActiveDelivery(active);
      setAvailableDeliveries(avail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      const [active, avail] = await Promise.all([
        deliveryService.getActiveDelivery().catch(() => null),
        deliveryService.getAvailableDeliveries().catch(() => []),
      ]);
      setActiveDelivery(active);
      setAvailableDeliveries(avail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const updated = await deliveryService.toggleOnline();
      setDriver(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAcceptDelivery = async (id: number) => {
    setAcceptingId(id);
    try {
      await deliveryService.acceptDelivery(id);
      router.push('/driver/deliveries');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delivery request is no longer available');
      loadDeliveries();
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <Loading fullPage message={t.common.loading} />;
  }

  const isOnline = driver?.online ?? false;

  return (
    <div className="space-y-8">
      {/* Driver Header & Online Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.driver.dispatchTitle}
            </h1>
            <Badge
              variant={isOnline ? 'success' : 'neutral'}
              size="md"
              dot
            >
              {isOnline ? t.driver.online : t.driver.offline}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {driver?.vehicleType || 'Motorbike'} • Plate: {driver?.vehicleNumber || 'Phnom Penh 1B-9988'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isOnline ? 'danger' : 'success'}
            size="md"
            onClick={handleToggleOnline}
            isLoading={togglingOnline}
            className="rounded-2xl gap-2 font-bold shadow-sm"
          >
            <Power className="w-4 h-4" />
            {isOnline ? t.driver.goOffline : t.driver.goOnline}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={loadDeliveries}
            className="rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            title={t.common.refresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Delivery Alert Banner */}
      {activeDelivery && (
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur-xs">
              <Bike className="w-3.5 h-3.5" /> {t.driver.activeDelivery}
            </div>
            <h3 className="text-lg font-black tracking-tight">
              Order #{activeDelivery.orderId.toString().padStart(6, '0')}
            </h3>
            <p className="text-xs text-blue-100">
              {t.driver.pickupAt} {activeDelivery.restaurantName} → {t.driver.deliverTo} {activeDelivery.deliveryAddress}
            </p>
          </div>

          <Link
            href="/driver/deliveries"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-blue-700 hover:bg-blue-50 shadow-md gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            {t.driver.activeDelivery} <ArrowRight className="w-4 h-4 text-blue-700" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.driver.completedTrips}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.completedDeliveries ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t.common.all}: {stats?.completedDeliveries ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.driver.todayEarnings}
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ${stats?.todayEarnings?.toFixed(2) ?? '0.00'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.driver.shiftActiveToday}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.common.status}
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {driver?.approved ? t.common.approved : t.common.pending}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              License: {driver?.licenseNumber || 'Active'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Available Jobs Queue */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.driver.availableJobs}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isOnline
              ? t.driver.onlineNotice
              : t.driver.offlineNotice}
          </p>
        </div>

        {!isOnline ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
            <Power className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">{t.driver.offline}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {t.driver.offlineNotice}
            </p>
            <Button
              variant="success"
              size="sm"
              onClick={handleToggleOnline}
              isLoading={togglingOnline}
              className="rounded-xl"
            >
              {t.driver.goOnline}
            </Button>
          </div>
        ) : availableDeliveries.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-8 h-8" />}
            title={t.common.noData}
            description="We are matching you with local restaurant kitchens. New orders will appear automatically."
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableDeliveries
                .slice((availablePage - 1) * 20, availablePage * 20)
                .map((deliv) => (
                  <div
                    key={deliv.id}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          Order #{deliv.orderId.toString().padStart(6, '0')}
                        </span>
                        <Badge variant="primary" size="sm">
                          {t.common.open}
                        </Badge>
                      </div>

                      <div className="py-3 space-y-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Store className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{deliv.restaurantName}</p>
                            <p className="text-slate-500 dark:text-slate-400">{deliv.restaurantAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{deliv.customerName || t.roles.CUSTOMER}</p>
                            <p className="text-slate-500 dark:text-slate-400">{deliv.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold">
                          {t.driver.estEarnings}
                        </span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          ${deliv.deliveryFee ? deliv.deliveryFee.toFixed(2) : '2.50'}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptDelivery(deliv.id)}
                        isLoading={acceptingId === deliv.id}
                        className="rounded-xl font-bold text-xs gap-1.5"
                      >
                        {t.driver.acceptDelivery} <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            <Pagination
              currentPage={availablePage}
              totalPages={Math.ceil(availableDeliveries.length / 20)}
              totalElements={availableDeliveries.length}
              pageSize={20}
              onPageChange={(p) => setAvailablePage(p)}
              className="px-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
