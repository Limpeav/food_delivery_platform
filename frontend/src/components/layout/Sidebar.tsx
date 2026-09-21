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
  ArrowLeft,
  LogOut,
  Layers,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export interface SidebarProps {
  role: 'ADMIN' | 'RESTAURANT_OWNER' | 'DRIVER';
  isPending?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isPending }) => {
  const pathname = usePathname();
  const { user, businessStatus, logout } = useAuthStore();
  const pending = isPending ?? (businessStatus === 'PENDING');

  const getNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Users', href: '/admin/users', icon: Users },
          { label: 'Restaurants', href: '/admin/restaurants', icon: Store },
          { label: 'Drivers', href: '/admin/drivers', icon: Bike },
          { label: 'All Orders', href: '/admin/orders', icon: ListOrdered },
          { label: 'Categories', href: '/admin/categories', icon: Layers },
          { label: 'Coupons', href: '/admin/coupons', icon: Tag },
          { label: 'Reviews', href: '/admin/reviews', icon: Layers },
          { label: 'Reports', href: '/admin/reports', icon: TrendingUp },
        ];
      case 'RESTAURANT_OWNER':
        if (pending) {
          return [
            { label: 'Application Review', href: '/restaurant/pending', icon: Store },
            { label: 'Menu & Food', href: '/restaurant/menu', icon: ShoppingBag },
            { label: 'Categories', href: '/restaurant/categories', icon: Layers },
          ];
        }
        return [
          { label: 'Dashboard', href: '/restaurant/dashboard', icon: LayoutDashboard },
          { label: 'Live Orders', href: '/restaurant/orders', icon: ListOrdered },
          { label: 'Menu & Food', href: '/restaurant/menu', icon: ShoppingBag },
          { label: 'Categories', href: '/restaurant/categories', icon: Layers },
          { label: 'Promotions', href: '/restaurant/promotions', icon: Tag },
          { label: 'Reviews', href: '/restaurant/reviews', icon: Layers },
          { label: 'Reports', href: '/restaurant/reports', icon: TrendingUp },
        ];
      case 'DRIVER':
        return [
          { label: 'Available Jobs', href: '/driver/dashboard', icon: LayoutDashboard },
          { label: 'Active Delivery', href: '/driver/deliveries', icon: Bike },
          { label: 'Delivery History', href: '/driver/history', icon: ListOrdered },
          { label: 'Earnings', href: '/driver/earnings', icon: TrendingUp },
        ];
    }
  };

  const navLinks = getNavLinks();

  const getPortalInfo = () => {
    switch (role) {
      case 'ADMIN':
        return { title: 'Admin Console', badge: 'Superadmin', color: 'text-purple-600 bg-purple-50' };
      case 'RESTAURANT_OWNER':
        return { title: 'Partner Hub', badge: 'Restaurant Owner', color: 'text-emerald-600 bg-emerald-50' };
      case 'DRIVER':
        return { title: 'Driver Dispatch', badge: 'Delivery Partner', color: 'text-blue-600 bg-blue-50' };
    }
  };

  const info = getPortalInfo();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Portal Header */}
        <div className="px-3 pt-2">
          <span className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${info.color}`}>
            {info.badge}
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-2 tracking-tight">
            {info.title}
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== `/${role.toLowerCase().replace('_', '')}/dashboard` && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF5A1F] text-white shadow-sm shadow-[#FF5A1F]/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Shortcuts */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
