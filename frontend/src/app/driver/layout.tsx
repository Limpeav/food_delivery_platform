'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bike, AlertTriangle, LogOut, CheckCircle2, Power, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { driverService } from '@/services/driverService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loading } from '@/components/ui/Loading';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/stores/languageStore';
import { Driver } from '@/types';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, isInitialized, businessStatus, logout } = useAuthStore();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [toggling, setToggling] = useState(false);

  const isGuestRoute =
    pathname === '/driver/login' ||
    pathname.startsWith('/driver/login') ||
    pathname === '/driver/register' ||
    pathname.startsWith('/driver/register') ||
    pathname === '/driver/forgot-password' ||
    pathname.startsWith('/driver/forgot-password');

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isGuestRoute) {
      if (!isAuthenticated || !user || user.role !== 'DRIVER') {
        router.replace('/driver/login');
      } else {
        driverService
          .getMyProfile()
          .then((d) => setDriver(d))
          .catch(() => setDriver(null));
      }
    }
  }, [isAuthenticated, user, isLoading, isInitialized, router, isGuestRoute, pathname]);

  const handleToggleOnline = async () => {
    if (!driver?.approved) return;
    setToggling(true);
    try {
      const updated = await driverService.toggleOnline();
      setDriver(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  // Guest layout for /driver/login, /driver/register, /driver/forgot-password
  if (isGuestRoute) {
    return (
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors overflow-x-hidden">
        {/* Driver Header */}
        <header className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between transition-colors">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Cravery<span className="text-blue-600 dark:text-blue-400">Driver</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold -mt-0.5">
                {t.driver.dispatchTitle}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 text-xs">
            <LanguageToggle variant="dropdown" />
            <ThemeToggle />
            {pathname === '/driver/login' ? (
              <Link
                href="/driver/register"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs"
              >
                {t.nav.becomeDriver}
              </Link>
            ) : (
              <Link
                href="/driver/login"
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                {t.nav.driverSignIn}
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col justify-center min-h-0 overflow-y-auto">{children}</main>

        {/* Driver Footer */}
        <footer className="shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-2.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
          <p>© {new Date().getFullYear()} Cravery Delivery Network. {t.footer.rightsReserved}</p>
        </footer>
      </div>
    );
  }

  if (!isInitialized || isLoading || !user) {
    return <Loading fullPage message="Authenticating Delivery Partner..." />;
  }

  if (user.role !== 'DRIVER') {
    return <Loading fullPage message="Redirecting to Driver Portal Login..." />;
  }

  const isPending =
    businessStatus === 'PENDING' ||
    (driver && !driver.approved);

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar role="DRIVER" />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Operational Driver Topbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {user.name}
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                {driver?.vehicleType ? `${driver.vehicleType} • ${driver.vehicleNumber}` : t.driver.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageToggle variant="dropdown" />
            <ThemeToggle />
            {/* Online / Offline Toggle */}
            {driver && driver.approved ? (
              <button
                type="button"
                onClick={handleToggleOnline}
                disabled={toggling}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  driver.online
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30 hover:bg-emerald-600'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {driver.online ? t.driver.online : t.driver.offline}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                {t.restaurant.underReview}
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

        {/* Pending Review Banner */}
        {isPending && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-6 py-3.5 flex items-start gap-3 text-amber-900 dark:text-amber-200 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold">
                {t.restaurant.underReviewNotice}
              </p>
              <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                {t.driver.vettingNotice}
              </p>
            </div>
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
