'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Store, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { restaurantService } from '@/services/restaurantService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loading } from '@/components/ui/Loading';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/stores/languageStore';
import { Restaurant } from '@/types';

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, isInitialized, businessStatus, logout } = useAuthStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [fetchingRestaurant, setFetchingRestaurant] = useState(false);

  const isGuestRoute =
    pathname === '/restaurant/login' ||
    pathname.startsWith('/restaurant/login') ||
    pathname === '/restaurant/register' ||
    pathname.startsWith('/restaurant/register') ||
    pathname === '/restaurant/forgot-password' ||
    pathname.startsWith('/restaurant/forgot-password');

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isGuestRoute) {
      if (!isAuthenticated || !user || user.role !== 'RESTAURANT_OWNER') {
        router.replace('/restaurant/login');
      } else {
        // Fetch restaurant to check pending status
        setFetchingRestaurant(true);
        restaurantService
          .getMyRestaurant()
          .then((res) => {
            setRestaurant(res);
            if (res.status === 'PENDING' && pathname === '/restaurant/dashboard') {
              router.replace('/restaurant/pending');
            }
          })
          .catch(() => setRestaurant(null))
          .finally(() => setFetchingRestaurant(false));
      }
    }
  }, [isAuthenticated, user, isLoading, isInitialized, router, isGuestRoute, pathname]);

  // Guest layout for /restaurant/login, /restaurant/register, /restaurant/forgot-password
  if (isGuestRoute) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors overflow-x-hidden">
        {/* Partner Header */}
        <header className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between transition-colors">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Cravery<span className="text-emerald-600 dark:text-emerald-400">Partner</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold -mt-0.5">
                {t.restaurant.hubTitle}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 text-xs">
            <LanguageToggle variant="dropdown" />
            <ThemeToggle />
            {pathname === '/restaurant/login' ? (
              <Link
                href="/restaurant/register"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs"
              >
                {t.nav.becomePartner}
              </Link>
            ) : (
              <Link
                href="/restaurant/login"
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                {t.nav.partnerSignIn}
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col justify-center min-h-0 overflow-y-auto">{children}</main>

        {/* Partner Footer */}
        <footer className="shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-2.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
          <p>© {new Date().getFullYear()} {t.restaurant.partnerFooterText}</p>
        </footer>
      </div>
    );
  }

  if (!isInitialized || isLoading || !user) {
    return <Loading fullPage message="Authenticating Restaurant Partner..." />;
  }

  if (user.role !== 'RESTAURANT_OWNER') {
    return <Loading fullPage message="Redirecting to Restaurant Portal Login..." />;
  }

  const isPending = Boolean(
    businessStatus === 'PENDING' ||
    (restaurant && restaurant.status === 'PENDING')
  );

  // Dedicated full-page review layout for /restaurant/pending
  if (pathname === '/restaurant/pending') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
        {/* Onboarding Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Cravery<span className="text-emerald-600">Partner</span>
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                  {t.restaurant.applicationReview}
                </span>
              </div>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {restaurant?.name || t.restaurant.hubTitle}
              </h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t.restaurant.badge}: {user.name} ({user.email})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              {t.restaurant.underReview}
            </span>
            <LanguageToggle variant="dropdown" />
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.common.signOut}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Cravery Partner Network. {t.restaurant.partnerSubtitle}.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar role="RESTAURANT_OWNER" isPending={isPending} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {restaurant?.name || t.restaurant.operationalTitle}
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                {t.restaurant.badge}: {user.name} ({user.email})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageToggle variant="dropdown" />
            <ThemeToggle />
            {isPending ? (
              <Link
                href="/restaurant/pending"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                {t.restaurant.underReview}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t.common.active}
              </span>
            )}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.common.signOut}
            </button>
          </div>
        </header>

        {/* Pending Approval Alert Banner */}
        {isPending && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-6 py-3.5 flex items-center justify-between gap-4 text-amber-900 dark:text-amber-200 shrink-0">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold">
                  {t.restaurant.underReviewNotice}
                </p>
                <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                  {t.restaurant.pendingDescription}
                </p>
              </div>
            </div>
            <Link
              href="/restaurant/pending"
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {t.restaurant.applicationReview}
            </Link>
          </div>
        )}

        {/* Scrollable Right Side Content Only */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 min-w-0 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
