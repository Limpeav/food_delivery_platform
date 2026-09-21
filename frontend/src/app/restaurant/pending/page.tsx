'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Utensils,
  Store,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types';
import { Button } from '@/components/ui/Button';

export default function RestaurantPendingPage() {
  const router = useRouter();
  const { user, businessStatus, setBusinessStatus, logout } = useAuthStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isApprovedNow, setIsApprovedNow] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setCheckMessage(null);
    try {
      const rest = await restaurantService.getMyRestaurant();
      setRestaurant(rest);
      if (rest.status === 'APPROVED') {
        setBusinessStatus('APPROVED');
        setIsApprovedNow(true);
        setTimeout(() => {
          router.push('/restaurant/dashboard');
        }, 2500);
      } else if (isManual) {
        setCheckMessage('Your application is still under review. Please check back shortly.');
      }
    } catch (err) {
      console.error('Error fetching restaurant status:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Periodic auto-check every 8 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Approval celebration banner if approved */}
        {isApprovedNow && (
          <div className="rounded-3xl bg-emerald-500 text-white p-6 shadow-2xl shadow-emerald-500/30 flex items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Application Approved!</h3>
                <p className="text-sm text-emerald-100">
                  Congratulations! Your restaurant is now active. Redirecting to your Partner Dashboard...
                </p>
              </div>
            </div>
            <Link
              href="/restaurant/dashboard"
              className="px-4 py-2 rounded-xl bg-white text-emerald-700 font-bold text-sm shadow-md hover:bg-emerald-50 transition-colors shrink-0"
            >
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* Hero Review Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl -z-0 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />

          <div className="relative z-10 space-y-6">
            {/* Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Under Administrative Review
              </div>

              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Submitted • Awaiting Review
              </span>
            </div>

            {/* Headline and Prompt Exact Message */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Your restaurant application is currently under review.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                Our platform operations team is verifying your restaurant details. You can configure your menu items and opening hours in the meantime. Your dishes will be published to customer feeds once approved.
              </p>
            </div>

            {/* Important Wait Notice Callout */}
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 sm:p-5 flex items-start gap-3.5 text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-bold text-amber-900">
                  Please wait until the administrator approves your restaurant application.
                </p>
                <p className="text-amber-800/90 leading-relaxed">
                  Our operations team reviews submissions to ensure platform quality and food safety compliance. Verification typically takes 24 hours. You do not need to resubmit your details.
                </p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() => fetchStatus(true)}
                isLoading={refreshing}
                className="rounded-xl px-5 py-2.5 text-xs font-bold gap-2 bg-[#FF5A1F] hover:bg-[#e04e19] text-white shadow-md shadow-[#FF5A1F]/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Check Approval Status
              </Button>

              <Link
                href="/restaurant/menu"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                Configure Menu Items
              </Link>

              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors ml-auto cursor-pointer"
              >
                Sign Out
              </button>
            </div>

            {checkMessage && (
              <p className="text-xs text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 inline-block font-medium">
                {checkMessage}
              </p>
            )}
          </div>
        </div>

        {/* 3-Step Review Progress Tracker */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Application Progress Tracker
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">1. Details Submitted</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your restaurant profile and owner credentials have been registered.
                </p>
                <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Completed
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-amber-50 shadow-xs">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-amber-900">2. Platform Verification</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Platform operations team is reviewing your address, cuisine, and opening hours.
                </p>
                <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  In Progress (Please Wait)
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 opacity-60">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Store className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-700">3. Storefront Launch</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Dishes published to customer marketplace and live orders are enabled.
                </p>
                <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  Pending Approval
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Submitted Details & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Submitted Application Details */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                Submitted Restaurant Profile
              </h3>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Pending
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Store Name</span>
                <p className="font-bold text-slate-900 text-sm">{restaurant?.name || 'Loading...'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <p className="font-semibold text-slate-700">{restaurant?.categoryName || 'General Dining'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Operating Hours</span>
                  <p className="font-semibold text-slate-700">
                    {restaurant?.openingTime || '08:00'} - {restaurant?.closingTime || '22:00'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Physical Address</span>
                <p className="text-slate-600 flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {restaurant?.address || 'Street address on file'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Owner Contact</span>
                  <p className="text-slate-700 font-medium flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {user?.email}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <p className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {restaurant?.phone || user?.phoneNumber || 'Contact on file'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: What You Can Do in the Meantime */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  Prepare Your Kitchen & Menu
                </h3>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  While your application is waiting for administrator approval, you can prepare dishes in advance:
                </p>

                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Create menu sections (Appetizers, Mains, Drinks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Upload dish photos and pricing details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dishes will be published instantly once your store is approved</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/restaurant/menu"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  Go to Menu Management
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="text-center text-xs text-slate-400 space-y-1 pt-4">
          <p className="flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Questions regarding your restaurant application? Contact platform operations at{' '}
            <a href="mailto:support@cravery.com" className="font-bold text-slate-600 hover:underline">
              support@cravery.com
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
