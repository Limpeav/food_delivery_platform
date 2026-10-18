'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Store,
  Users,
  ShoppingBag,
  Bike,
  Tag,
  Layers,
  Star,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  Command,
  CornerDownLeft,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { AdminSearchResponse } from '@/types';

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = 'ALL' | 'RESTAURANTS' | 'USERS' | 'ORDERS' | 'DRIVERS';

export const AdminSearchModal: React.FC<AdminSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FilterCategory>('ALL');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AdminSearchResponse>({
    restaurants: [],
    users: [],
    orders: [],
    drivers: [],
    totalMatches: 0,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Quick navigation shortcuts available on blank search
  const quickNav = [
    { label: 'Platform Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, category: 'Overview' },
    { label: 'Restaurants Directory', href: '/admin/restaurants', icon: Store, category: 'Vendors' },
    { label: 'User & Role Access', href: '/admin/users', icon: Users, category: 'Accounts' },
    { label: 'Global Orders Ledger', href: '/admin/orders', icon: ShoppingBag, category: 'Commerce' },
    { label: 'Driver Fleet & Approvals', href: '/admin/drivers', icon: Bike, category: 'Logistics' },
    { label: 'Promotions & Coupons', href: '/admin/coupons', icon: Tag, category: 'Marketing' },
    { label: 'Catalog Categories', href: '/admin/categories', icon: Layers, category: 'Catalog' },
    { label: 'Customer Reviews Moderation', href: '/admin/reviews', icon: Star, category: 'Quality' },
    { label: 'Financial Reports & Revenue', href: '/admin/reports', icon: BarChart3, category: 'Analytics' },
  ];

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setCategory('ALL');
      setResults({ restaurants: [], users: [], orders: [], drivers: [], totalMatches: 0 });
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults({ restaurants: [], users: [], orders: [], drivers: [], totalMatches: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await adminService.globalSearch(query.trim(), category, 10);
        setResults(res || { restaurants: [], users: [], orders: [], drivers: [], totalMatches: 0 });
      } catch (err) {
        console.error('Failed to perform admin search:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, category, isOpen]);

  // Flattened searchable items for keyboard navigation
  const flatItems: Array<{ id: string; href: string; action?: () => void }> = [];

  if (!query.trim()) {
    quickNav.forEach((item) => {
      flatItems.push({ id: `nav-${item.href}`, href: item.href });
    });
  } else {
    if (category === 'ALL' || category === 'RESTAURANTS') {
      results.restaurants.forEach((r) =>
        flatItems.push({ id: `restaurant-${r.id}`, href: `/admin/restaurants` })
      );
    }
    if (category === 'ALL' || category === 'USERS') {
      results.users.forEach((u) =>
        flatItems.push({ id: `user-${u.id}`, href: `/admin/users` })
      );
    }
    if (category === 'ALL' || category === 'ORDERS') {
      results.orders.forEach((o) =>
        flatItems.push({ id: `order-${o.id}`, href: `/admin/orders` })
      );
    }
    if (category === 'ALL' || category === 'DRIVERS') {
      results.drivers.forEach((d) =>
        flatItems.push({ id: `driver-${d.id}`, href: `/admin/drivers` })
      );
    }
  }

  // Handle keyboard navigation: arrows, enter, esc
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (flatItems.length ? (prev + 1) % flatItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (flatItems.length ? (prev - 1 + flatItems.length) % flatItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        router.push(flatItems[selectedIndex].href);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search restaurants, users, orders, drivers, addresses..."
            className="w-full bg-transparent border-0 px-3 py-1 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
          />

          <div className="flex items-center gap-2 shrink-0">
            {loading && <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />}
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
              ESC
            </kbd>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All', icon: Sparkles, count: results.totalMatches },
            { id: 'RESTAURANTS', label: 'Restaurants', icon: Store, count: results.restaurants.length },
            { id: 'USERS', label: 'Users', icon: Users, count: results.users.length },
            { id: 'ORDERS', label: 'Orders', icon: ShoppingBag, count: results.orders.length },
            { id: 'DRIVERS', label: 'Drivers', icon: Bike, count: results.drivers.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCategory(tab.id as FilterCategory);
                  setSelectedIndex(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {query.trim() && tab.count > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      active ? 'bg-purple-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Quick Nav (When search is empty) */}
          {!query.trim() && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Quick Navigation</span>
                <span className="text-[11px] normal-case text-purple-600 dark:text-purple-400 font-medium">
                  Jump to any admin section
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickNav.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 shadow-sm'
                          : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-slate-200/60 dark:border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{item.label}</p>
                          <p className="text-[10px] text-slate-400">{item.category}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Search Results */}
          {query.trim() && (
            <>
              {results.totalMatches === 0 && !loading && (
                <div className="text-center py-10 space-y-2">
                  <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching by restaurant name, user email, order ID (#ORD-), phone number, or driver plate.
                  </p>
                </div>
              )}

              {/* 1. Restaurants */}
              {(category === 'ALL' || category === 'RESTAURANTS') && results.restaurants.length > 0 && (
                <div className="space-y-2 pt-2 first:pt-0">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-purple-600" /> Restaurants ({results.restaurants.length})
                    </span>
                    <button
                      onClick={() => {
                        router.push(`/admin/restaurants`);
                        onClose();
                      }}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.restaurants.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          router.push(`/admin/restaurants`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-slate-800/60 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-purple-600 font-bold">
                            {r.logoUrl ? (
                              <img src={r.logoUrl} alt={r.name} className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {r.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.status === 'APPROVED'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : r.status === 'PENDING'
                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                {r.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {r.address} • {r.phone}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Users */}
              {(category === 'ALL' || category === 'USERS') && results.users.length > 0 && (
                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" /> Users ({results.users.length})
                    </span>
                    <button
                      onClick={() => {
                        router.push(`/admin/users`);
                        onClose();
                      }}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          router.push(`/admin/users`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-slate-800/60 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {u.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {u.role}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                                  u.status === 'ACTIVE'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                • {u.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {u.email} {u.phoneNumber ? `• ${u.phoneNumber}` : ''}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Orders */}
              {(category === 'ALL' || category === 'ORDERS') && results.orders.length > 0 && (
                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-600" /> Orders ({results.orders.length})
                    </span>
                    <button
                      onClick={() => {
                        router.push(`/admin/orders`);
                        onClose();
                      }}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.orders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          router.push(`/admin/orders`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-slate-800/60 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-black text-xs border border-amber-200 dark:border-amber-800">
                            #{o.id}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {o.orderNumber}
                              </span>
                              <span className="text-sm font-black text-[#FF5A1F]">
                                ${Number(o.totalAmount).toFixed(2)}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {o.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {o.customerName} → {o.restaurantName} • {o.deliveryAddress}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Drivers */}
              {(category === 'ALL' || category === 'DRIVERS') && results.drivers.length > 0 && (
                <div className="space-y-2 pt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5 text-emerald-600" /> Drivers ({results.drivers.length})
                    </span>
                    <button
                      onClick={() => {
                        router.push(`/admin/drivers`);
                        onClose();
                      }}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.drivers.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          router.push(`/admin/drivers`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-slate-800/60 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                            <Bike className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {d.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.approved
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {d.approved ? 'Approved' : 'Pending Approval'}
                              </span>
                              {d.online && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Online
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {d.vehicleType} • Plate: {d.vehicleNumber} {d.phoneNumber ? `• ${d.phoneNumber}` : ''}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer with Keyboard Shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              Open
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ESC
              </kbd>{' '}
              Close
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
            <span>Admin Global Omnisearch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
