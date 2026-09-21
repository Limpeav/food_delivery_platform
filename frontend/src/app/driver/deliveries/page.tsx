'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bike,
  Store,
  MapPin,
  CheckCircle2,
  Navigation,
  Phone,
  ArrowRight,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';
import { deliveryService } from '@/services/deliveryService';
import { Delivery } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DriverDeliveriesPage() {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [gpsSimulating, setGpsSimulating] = useState(false);

  // Current GPS coordinates
  const [lat, setLat] = useState(11.5564);
  const [lng, setLng] = useState(104.9282);

  useEffect(() => {
    loadActiveDelivery();
  }, []);

  const loadActiveDelivery = async () => {
    try {
      setLoading(true);
      const active = await deliveryService.getActiveDelivery();
      setDelivery(active);
      if (active?.restaurantLatitude) setLat(active.restaurantLatitude);
      if (active?.restaurantLongitude) setLng(active.restaurantLongitude);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async () => {
    if (!delivery) return;
    setActionLoading(true);
    try {
      const updated = await deliveryService.pickupFood(delivery.id);
      setDelivery(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartDelivering = async () => {
    if (!delivery) return;
    setActionLoading(true);
    try {
      const updated = await deliveryService.startDelivering(delivery.id);
      setDelivery(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!delivery) return;
    setActionLoading(true);
    try {
      await deliveryService.completeDelivery(delivery.id);
      alert('Delivery completed! Earnings added to your balance.');
      router.push('/driver/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateGPSMove = async () => {
    setGpsSimulating(true);
    try {
      // Simulate incremental movement towards destination
      const nextLat = lat + 0.0015;
      const nextLng = lng + 0.0012;
      setLat(nextLat);
      setLng(nextLng);
      await deliveryService.updateLocation(nextLat, nextLng);
    } catch (err) {
      console.error('GPS update failed:', err);
    } finally {
      setGpsSimulating(false);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading active delivery..." />;
  }

  if (!delivery) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={<Bike className="w-8 h-8" />}
          title="No active delivery in progress"
          description="You don't have any ongoing deliveries right now. Check available jobs on the dashboard."
          actionLabel="View Available Jobs"
          onAction={() => router.push('/driver/dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Active Delivery Task
            </h1>
            <Badge variant="primary" size="md">
              {delivery.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Order #{delivery.orderId.toString().padStart(6, '0')}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadActiveDelivery}
          className="rounded-xl text-xs"
        >
          Refresh Status
        </Button>
      </div>

      {/* Main Delivery Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step 1 & 2 Directions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
          {/* Pickup */}
          <div className="rounded-2xl border border-orange-100 bg-[#FFF1EB]/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
              <Store className="w-4 h-4" /> 1. Pickup Location
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {delivery.restaurantName}
            </h3>
            <p className="text-xs text-slate-600">{delivery.restaurantAddress}</p>
          </div>

          {/* Dropoff */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <MapPin className="w-4 h-4" /> 2. Dropoff Destination
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {delivery.customerName || 'Customer'}
            </h3>
            <p className="text-xs text-slate-600">{delivery.deliveryAddress}</p>
          </div>
        </div>

        {/* Live GPS Dispatch Simulator */}
        <div className="rounded-2xl bg-slate-950 p-5 text-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Live Rider GPS Broadcast (WebSocket)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Clicking simulate updates your GPS coordinates in Redis and broadcasts live to the customer&apos;s tracking map!
          </p>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSimulateGPSMove}
            isLoading={gpsSimulating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5 font-bold"
          >
            <Navigation className="w-3.5 h-3.5" /> Simulate Moving Towards Customer
          </Button>
        </div>

        {/* Action Pipeline Button */}
        <div className="pt-2">
          {(delivery.status === 'DRIVER_ASSIGNED' || delivery.status === 'GOING_TO_RESTAURANT' || delivery.status === 'WAITING_FOR_DRIVER') && (
            <Button
              variant="primary"
              size="lg"
              onClick={handlePickup}
              isLoading={actionLoading}
              className="w-full rounded-2xl gap-2 font-bold"
            >
              <PackageCheck className="w-5 h-5" /> I Have Picked Up The Food
            </Button>
          )}

          {delivery.status === 'FOOD_PICKED_UP' && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartDelivering}
              isLoading={actionLoading}
              className="w-full rounded-2xl gap-2 font-bold bg-blue-600 hover:bg-blue-700"
            >
              <Bike className="w-5 h-5" /> Start Delivering / En Route to Customer
            </Button>
          )}

          {delivery.status === 'DELIVERING' && (
            <Button
              variant="success"
              size="lg"
              onClick={handleComplete}
              isLoading={actionLoading}
              className="w-full rounded-2xl gap-2 font-bold"
            >
              <CheckCircle2 className="w-5 h-5" /> Arrived & Confirm Delivery Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
