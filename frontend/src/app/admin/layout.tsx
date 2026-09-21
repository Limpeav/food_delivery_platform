'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loading } from '@/components/ui/Loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, isInitialized, logout } = useAuthStore();

  const isGuestRoute = pathname === '/admin/login' || pathname.startsWith('/admin/login');

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isGuestRoute) {
      if (!isAuthenticated || !user || user.role !== 'ADMIN') {
        router.replace('/admin/login');
      }
    }
  }, [isAuthenticated, user, isLoading, isInitialized, router, isGuestRoute, pathname]);

  // Guest layout for /admin/login
  if (isGuestRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
        {/* Admin Header */}
        <header className="border-b border-slate-800/80 bg-slate-950 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">
                Cravery<span className="text-purple-400">Admin</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                Central Console
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer App
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500">
          <p>Cravery Administrative Control Node • All actions are cryptographically authenticated and logged</p>
        </footer>
      </div>
    );
  }

  if (!isInitialized || isLoading || !user) {
    return <Loading fullPage message="Authenticating Superadmin..." />;
  }

  if (user.role !== 'ADMIN') {
    return <Loading fullPage message="Redirecting to Admin Portal Login..." />;
  }

  return (
    <div className="flex-1 flex bg-slate-50 min-h-screen">
      <Sidebar role="ADMIN" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Operational Admin Topbar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Platform Superadmin Console
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                Authenticated Operator: {user.name} ({user.email})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Role: SUPERADMIN
            </span>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
