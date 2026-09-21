'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bike, AlertTriangle, ArrowLeft, LogOut, CheckCircle2, Power, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { driverService } from '@/services/driverService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loading } from '@/components/ui/Loading';
import { Driver } from '@/types';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white">
        {/* Driver Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">
                Cravery<span className="text-blue-400">Driver</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                Courier Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Customer App
            </Link>
            {pathname === '/driver/login' ? (
              <Link
                href="/driver/register"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs"
              >
                Sign Up as Driver
              </Link>
            ) : (
              <Link
                href="/driver/login"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
              >
                Driver Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Driver Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Cravery Delivery Network. Flexible courier earnings on your schedule.</p>
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
    <div className="flex-1 flex bg-slate-50 min-h-screen">
      <Sidebar role="DRIVER" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Operational Driver Topbar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {user.name}
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                {driver?.vehicleType ? `${driver.vehicleType} • ${driver.vehicleNumber}` : 'Courier Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Online / Offline Toggle */}
            {driver && driver.approved ? (
              <button
                type="button"
                onClick={handleToggleOnline}
                disabled={toggling}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  driver.online
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30 hover:bg-emerald-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {driver.online ? 'Online (Accepting Jobs)' : 'Offline'}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Pending Verification
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

        {/* Pending Review Banner (Requirement 4 & 15) */}
        {isPending && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-start gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold">
                Your driver application is still under review.
              </p>
              <p className="text-amber-700 leading-relaxed">
                Your vehicle registration and driver license are currently being audited by operations administrators. You will be able to go online and accept delivery dispatch requests once your profile is approved.
              </p>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
