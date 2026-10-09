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
import { useTranslation } from '@/stores/languageStore';
import { restaurantService } from '@/services/restaurantService';
import { Restaurant } from '@/types';
import { Button } from '@/components/ui/Button';

export default function RestaurantPendingPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
        setCheckMessage(t.restaurant.pendingCheckDefault);
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
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Approval celebration banner if approved */}
        {isApprovedNow && (
          <div className="rounded-3xl bg-emerald-500 text-white p-6 shadow-2xl shadow-emerald-500/30 flex items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">{t.restaurant.applicationApproved}</h3>
                <p className="text-sm text-emerald-100">
                  {t.restaurant.applicationApprovedDesc}
                </p>
              </div>
            </div>
            <Link
              href="/restaurant/dashboard"
              className="px-4 py-2 rounded-xl bg-white text-emerald-700 font-bold text-sm shadow-md hover:bg-emerald-50 transition-colors shrink-0"
            >
              {t.restaurant.goToDashboard}
            </Link>
          </div>
        )}

        {/* Hero Review Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/60 dark:bg-amber-950/20 rounded-full blur-3xl -z-0 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />

          <div className="relative z-10 space-y-6">
            {/* Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                {t.restaurant.underAdministrativeReview}
              </div>

              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {t.restaurant.submittedAwaitingReview}
              </span>
            </div>

            {/* Headline and Prompt Exact Message */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {t.restaurant.pendingHeading}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {t.restaurant.pendingDescription}
              </p>
            </div>

            {/* Important Wait Notice Callout */}
            <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 p-4 sm:p-5 flex items-start gap-3.5 text-amber-950 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  {t.restaurant.pendingNoticeTitle}
                </p>
                <p className="text-amber-800/90 dark:text-amber-400/90 leading-relaxed">
                  {t.restaurant.pendingNoticeDescription}
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
                {t.restaurant.checkApprovalStatus}
              </Button>

              <Link
                href="/restaurant/menu"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t.restaurant.configureMenuItems}
              </Link>

              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors ml-auto cursor-pointer"
              >
                {t.common.signOut}
              </button>
            </div>

            {checkMessage && (
              <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800 inline-block font-medium">
                {checkMessage}
              </p>
            )}
          </div>
        </div>

        {/* 3-Step Review Progress Tracker */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {t.restaurant.applicationTracker}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{t.restaurant.step1Title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.restaurant.step1Desc}
                </p>
                <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  {t.restaurant.statusCompleted}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-amber-50 dark:ring-amber-950/30 shadow-xs">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300">{t.restaurant.step2Title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.restaurant.step2Desc}
                </p>
                <span className="inline-block text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                  {t.restaurant.statusInProgress}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 opacity-60">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                <Store className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.restaurant.step3Title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.restaurant.step3Desc}
                </p>
                <span className="inline-block text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {t.restaurant.statusPendingApproval}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Submitted Details & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Submitted Application Details */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t.restaurant.submittedProfile}
              </h3>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                {t.restaurant.pendingStatus}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t.restaurant.storeNameLabel}</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{restaurant?.name || t.common.loading}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t.restaurant.categoryLabel}</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{restaurant?.categoryName || t.restaurant.generalDining}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t.restaurant.operatingHoursLabel}</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {restaurant?.openingTime || '08:00'} - {restaurant?.closingTime || '22:00'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t.restaurant.physicalAddressLabel}</span>
                <p className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                  {restaurant?.address || t.restaurant.streetAddressOnFile}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t.restaurant.ownerContactLabel}</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    {user?.email}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">{t.restaurant.phoneLabel}</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    {restaurant?.phone || user?.phoneNumber || t.restaurant.contactOnFile}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: What You Can Do in the Meantime */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t.restaurant.prepareKitchenTitle}
                </h3>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.restaurant.prepareKitchenDesc}
                </p>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{t.restaurant.prepareKitchenStep1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{t.restaurant.prepareKitchenStep2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{t.restaurant.prepareKitchenStep3}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/restaurant/menu"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t.restaurant.goToMenuManagement}
                </span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 space-y-1 pt-4">
          <p className="flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            {t.restaurant.supportQuestions}{' '}
            <a href="mailto:support@cravery.com" className="font-bold text-slate-600 dark:text-slate-400 hover:underline">
              support@cravery.com
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
