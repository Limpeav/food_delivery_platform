'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Utensils,
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  Store,
  Bike,
  ShieldAlert,
  Menu,
  X,
  Tag,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { connectWebSocket, disconnectWebSocket } from '@/lib/websocket';
import { Badge } from '../ui/Badge';
import { NotificationPopup } from './NotificationPopup';
import { CartDrawer } from './CartDrawer';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const { cart, fetchCart, isDrawerOpen, toggleDrawer, closeDrawer } = useCartStore();
  const { unreadCount, fetchUnreadCount, addNotification } = useNotificationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      pathname === '/restaurant' ||
      (pathname.startsWith('/restaurant/') && !pathname.startsWith('/restaurants')) ||
      pathname.startsWith('/driver') ||
      pathname.startsWith('/delivery') ||
      pathname.startsWith('/deliveries') ||
      pathname.startsWith('/admin')
    ) {
      return;
    }

    if (isAuthenticated && user) {
      if (user.role === 'CUSTOMER') {
        fetchCart();
      }
      fetchUnreadCount();

      // Connect WebSocket for live notifications
      connectWebSocket(user.id, (notification) => {
        addNotification(notification);
      });

      return () => {
        disconnectWebSocket();
      };
    }
  }, [isAuthenticated, user, pathname, fetchCart, fetchUnreadCount, addNotification]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/login');
  };

  // Completely hide consumer Navbar on dedicated partner, admin portals, and auth pages
  if (
    pathname === '/restaurant' ||
    (pathname.startsWith('/restaurant/') && !pathname.startsWith('/restaurants')) ||
    pathname.startsWith('/driver') ||
    pathname.startsWith('/delivery') ||
    pathname.startsWith('/deliveries') ||
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  const getPortalLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return { label: 'Admin Panel', href: '/admin/dashboard', icon: ShieldAlert, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'RESTAURANT_OWNER':
        return { label: 'Restaurant Hub', href: '/restaurant/dashboard', icon: Store, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'DRIVER':
        return { label: 'Driver Portal', href: '/driver/dashboard', icon: Bike, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return null;
    }
  };

  const portal = getPortalLink();
  const cartItemCount = cart?.totalItems || 0;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Delivery Address */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/30 transition-transform group-hover:scale-105">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Cravery<span className="text-[#FF5A1F]">.</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                  Food Delivery
                </span>
              </div>
            </Link>

            {/* Address Chip */}
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-300 transition-colors">
              <MapPin className="h-3.5 w-3.5 text-[#FF5A1F]" />
              <span className="font-semibold text-slate-800">Deliver to:</span>
              <span className="truncate max-w-[150px]">Phnom Penh, BKK1</span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/restaurants"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Restaurants
            </Link>
            <Link
              href="/promotions"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-[#FF5A1F]" />
              Deals
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                My Orders
              </Link>
            )}
          </nav>

          {/* Actions & User profile */}
          <div className="flex items-center gap-3">
            {/* Quick Portal Switch Badge */}
            {portal && (
              <Link
                href={portal.href}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-102 ${portal.color}`}
              >
                <portal.icon className="w-3.5 h-3.5" />
                {portal.label}
              </Link>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => {
                toggleDrawer();
                setNotifOpen(false);
                setDropdownOpen(false);
              }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                isDrawerOpen
                  ? 'border-[#FF5A1F] bg-[#FFF1EB]/50 text-[#FF5A1F] ring-2 ring-[#FF5A1F]/20'
                  : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:border-[#FF5A1F]/40 hover:text-[#FF5A1F]'
              }`}
              aria-label="View Cart"
              aria-expanded={isDrawerOpen}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A1F] text-[11px] font-black text-white shadow-sm ring-2 ring-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Notifications Button with Popup */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((prev) => !prev);
                    closeDrawer();
                    setDropdownOpen(false);
                  }}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                    notifOpen
                      ? 'border-[#FF5A1F] bg-[#FFF1EB]/50 text-[#FF5A1F] ring-2 ring-[#FF5A1F]/20'
                      : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:border-[#FF5A1F]/40 hover:text-[#FF5A1F]'
                  }`}
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPopup isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>
            )}

            {/* User Dropdown or Login */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    closeDrawer();
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-left shadow-xs hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 capitalize">
                      {user.role.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <Badge variant="primary" size="sm" className="mt-1.5">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="py-1">
                      {portal && (
                        <Link
                          href={portal.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#FF5A1F]" />
                          {portal.label}
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-slate-400" />
                        My Orders
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Profile & Addresses
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-[#FF5A1F] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#FF5A1F]/25 hover:bg-[#E04812] transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            href="/restaurants"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Browse Restaurants
          </Link>
          <Link
            href="/promotions"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Promotions & Coupons
          </Link>
          {isAuthenticated && (
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              My Orders
            </Link>
          )}
          {portal && (
            <Link
              href={portal.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-bold text-[#FF5A1F] bg-[#FFF1EB]"
            >
              Go to {portal.label}
            </Link>
          )}
        </div>
      )}
    </header>

    {/* Slide-over Cart Drawer (Right to Left) */}
    <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
  </>
  );
};
