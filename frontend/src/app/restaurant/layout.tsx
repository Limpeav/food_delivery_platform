'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Store, AlertTriangle, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { restaurantService } from '@/services/restaurantService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loading } from '@/components/ui/Loading';
import { Restaurant } from '@/types';

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-white">
        {/* Partner Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">
                Cravery<span className="text-emerald-400">Partner</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                Restaurant Hub
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Food App
            </Link>
            {pathname === '/restaurant/login' ? (
              <Link
                href="/restaurant/register"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs"
              >
                Become a Partner
              </Link>
            ) : (
              <Link
                href="/restaurant/login"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
              >
                Partner Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Partner Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Cravery Partner Network. Grow your restaurant business with us.</p>
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
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
        {/* Onboarding Header */}
        <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black text-slate-900 tracking-tight">
                  Cravery<span className="text-emerald-600">Partner</span>
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                  Merchant Onboarding
                </span>
              </div>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-2" />
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-slate-900 leading-tight">
                {restaurant?.name || 'Restaurant Application'}
              </h2>
              <span className="text-[10px] text-slate-500 font-medium">
                Owner: {user.name} ({user.email})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Under Review
            </span>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Food App
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cravery Partner Network. All restaurant applications undergo administrative review.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-slate-50 min-h-screen">
      <Sidebar role="RESTAURANT_OWNER" isPending={isPending} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {restaurant?.name || 'Restaurant Management Console'}
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                Owner: {user.name} ({user.email})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPending ? (
              <Link
                href="/restaurant/pending"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Under Review
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active Partner
              </span>
            )}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Pending Approval Alert Banner (Requirement 4 & 14) */}
        {isPending && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-center justify-between gap-4 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold">
                  Your restaurant application is currently under review.
                </p>
                <p className="text-amber-700 leading-relaxed">
                  Our platform operations team is verifying your restaurant details. You can configure your menu items and opening hours in the meantime. Your dishes will be published to customer feeds once approved.
                </p>
              </div>
            </div>
            <Link
              href="/restaurant/pending"
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Review Status
            </Link>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
