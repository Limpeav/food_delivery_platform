'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Bike,
  ShieldCheck,
  ShoppingBag,
  ListOrdered,
  Tag,
  Users,
  Settings,
  LogOut,
  Layers,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/languageStore';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export interface SidebarProps {
  role: 'ADMIN' | 'RESTAURANT_OWNER' | 'DRIVER';
  isPending?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isPending }) => {
  const pathname = usePathname();
  const { user, businessStatus, logout } = useAuthStore();
  const { t } = useTranslation();
  const pending = isPending ?? (businessStatus === 'PENDING');

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: t.admin.overview, href: '/admin/dashboard', icon: LayoutDashboard },
          { label: t.admin.users, href: '/admin/users', icon: Users },
          { label: t.admin.restaurants, href: '/admin/restaurants', icon: Store },
          { label: t.admin.drivers, href: '/admin/drivers', icon: Bike },
          { label: t.admin.allOrders, href: '/admin/orders', icon: ListOrdered },
          { label: t.admin.categories, href: '/admin/categories', icon: Layers },
          { label: t.admin.coupons, href: '/admin/coupons', icon: Tag },
          { label: t.admin.reviews, href: '/admin/reviews', icon: Layers },
          { label: t.admin.reports, href: '/admin/reports', icon: TrendingUp },
        ];
      case 'RESTAURANT_OWNER':
        if (pending) {
          return [
            { label: t.restaurant.applicationReview, href: '/restaurant/pending', icon: Store },
            { label: t.restaurant.menuAndFood, href: '/restaurant/menu', icon: ShoppingBag },
            { label: t.restaurant.categories, href: '/restaurant/categories', icon: Layers },
          ];
        }
        return [
          { label: t.restaurant.dashboard, href: '/restaurant/dashboard', icon: LayoutDashboard },
          { label: t.restaurant.liveOrders, href: '/restaurant/orders', icon: ListOrdered },
          { label: t.restaurant.menuAndFood, href: '/restaurant/menu', icon: ShoppingBag },
          { label: t.restaurant.categories, href: '/restaurant/categories', icon: Layers },
          { label: t.restaurant.promotions, href: '/restaurant/promotions', icon: Tag },
          { label: t.restaurant.reviews, href: '/restaurant/reviews', icon: Layers },
          { label: t.restaurant.reports, href: '/restaurant/reports', icon: TrendingUp },
        ];
      case 'DRIVER':
        return [
          { label: t.driver.availableJobs, href: '/driver/dashboard', icon: LayoutDashboard },
          { label: t.driver.activeDelivery, href: '/driver/deliveries', icon: Bike },
          { label: t.driver.deliveryHistory, href: '/driver/history', icon: ListOrdered },
          { label: t.driver.earnings, href: '/driver/earnings', icon: TrendingUp },
        ];
    }
  };

  const navLinks = getNavLinks();

  const getPortalInfo = () => {
    switch (role) {
      case 'ADMIN':
        return {
          title: t.admin.consoleTitle,
          badge: t.admin.badge,
          color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
        };
      case 'RESTAURANT_OWNER':
        return {
          title: t.restaurant.hubTitle,
          badge: t.restaurant.badge,
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
        };
      case 'DRIVER':
        return {
          title: t.driver.dispatchTitle,
          badge: t.driver.badge,
          color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
        };
    }
  };

  const info = getPortalInfo();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 flex flex-col justify-between p-4 overflow-hidden select-none z-30">
      <div className="space-y-5 flex-1 flex flex-col min-h-0">
        {/* Portal Header */}
        <div className="px-3 pt-2 shrink-0">
          <span className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${info.color}`}>
            {info.badge}
          </span>
          <h2 className="text-base font-black text-slate-900 dark:text-white mt-1.5 tracking-tight leading-snug">
            {info.title}
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/${role.toLowerCase().replace('_', '')}/dashboard` && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF5A1F] text-white shadow-sm shadow-[#FF5A1F]/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions: Language switcher & Sign Out */}
      <div className="pt-3 pb-2 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t.common.language}
          </span>
          <LanguageToggle variant="toggle" />
        </div>

        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          {t.common.signOut}
        </button>
      </div>
    </aside>
  );
};
