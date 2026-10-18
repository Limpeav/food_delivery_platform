'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ShieldCheck, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loading } from '@/components/ui/Loading';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/stores/languageStore';
import { AdminSearchModal } from '@/components/admin/AdminSearchModal';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, isInitialized, logout } = useAuthStore();

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K or Ctrl+K to toggle admin omnisearch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white transition-colors overflow-x-hidden">
        {/* Admin Header */}
        <header className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Cravery<span className="text-purple-600 dark:text-purple-400">Admin</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold -mt-0.5">
                {t.admin.consoleTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageToggle variant="dropdown" />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center min-h-0 overflow-y-auto">{children}</main>

        <footer className="shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-2.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
          <p>Cravery Administrative Control Node • {t.footer.rightsReserved}</p>
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
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar role="ADMIN" />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Operational Admin Topbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="hidden lg:block">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {t.admin.consoleTitle}
              </h2>
              <span className="text-[10px] text-slate-400 font-medium">
                {t.admin.operatorLogged} {user.name} ({user.email})
              </span>
            </div>
          </div>

          {/* Global Admin Search Bar Trigger (Cmd+K) */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-purple-300 dark:hover:border-purple-700/80 transition-all text-xs font-medium w-full max-w-xs sm:max-w-sm md:max-w-md shadow-2xs cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="flex-1 text-left truncate">Search restaurants, users, orders...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-mono text-slate-500 shadow-2xs shrink-0">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {t.admin.badge}
            </span>

            <LanguageToggle variant="dropdown" />
            <ThemeToggle />

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.common.signOut}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Right Side Content Only */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 min-w-0 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Omnisearch Command Palette Modal */}
      <AdminSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
