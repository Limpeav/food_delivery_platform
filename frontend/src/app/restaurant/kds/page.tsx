'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  ChefHat,
  Flame,
  CheckCircle2,
  XCircle,
  Bike,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertTriangle,
  Receipt,
  ArrowLeft,
  Check,
  PackageCheck,
  Timer,
  ShoppingBag,
  Bell,
  Sparkles,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/languageStore';
import { subscribeToRestaurantOrders } from '@/lib/websocket';
import { OrderReceiptModal } from '@/components/ui/OrderReceiptModal';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

const REJECTION_REASONS = [
  "86'd / Out of Ingredients",
  'Kitchen at Maximum Capacity / Rush',
  'Store Closing Early',
  'Item Unavailable / Equipment Issue',
  'Customer Address Outside Delivery Radius',
];

export default function KitchenDisplaySystemPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COOKING' | 'READY' | 'PENDING'>('ALL');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>(REJECTION_REASONS[0]);

  const knownOrderIdsRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sound preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cravery_kds_sound');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cravery_kds_sound', String(next));
    }
    if (next) {
      playKitchenChime();
    }
  };

  // Dual-tone / triple-tone kitchen alert bell using Web Audio API
  const playKitchenChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Tone 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.45, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);

      // Tone 3: 1174.66 Hz (D6 - Crisp high bell)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1174.66, now + 0.25);
      gain3.gain.setValueAtTime(0.5, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.25);
      osc3.stop(now + 0.75);
    } catch (e) {
      console.error('KDS chime failed:', e);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Live real-time clock & elapsed counter tick (every second)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
      setNowTimestamp(Date.now());
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Load orders
  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await orderService.getRestaurantOrders({ page: 0, size: 50 });
      const activeTickets = res.content || [];

      // Check for newly arrived orders
      const hasNewIncoming = activeTickets.some(
        (o: Order) => !knownOrderIdsRef.current.has(o.id) && ['PENDING', 'CONFIRMED'].includes(o.status)
      );

      if (hasNewIncoming && soundEnabled && knownOrderIdsRef.current.size > 0) {
        playKitchenChime();
      }

      activeTickets.forEach((o: Order) => knownOrderIdsRef.current.add(o.id));
      setOrders(activeTickets);
    } catch (err) {
      console.error('Failed to fetch KDS orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    intervalRef.current = setInterval(() => loadOrders(true), 12000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // WebSocket live notification
  const activeRestaurantId = user?.restaurantId || orders[0]?.restaurantId;
  useEffect(() => {
    if (!activeRestaurantId) return;

    const unsubscribe = subscribeToRestaurantOrders(activeRestaurantId, (payload: any) => {
      console.log('KDS received live order via WebSocket:', payload);
      if (soundEnabled) {
        playKitchenChime();
      }
      loadOrders(true);
    });

    return () => unsubscribe();
  }, [activeRestaurantId, soundEnabled]);

  // Update order status
  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    setActionLoading(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  // Confirm rejection modal
  const handleConfirmRejection = async () => {
    if (!rejectModalOrder) return;
    const orderId = rejectModalOrder.id;
    setActionLoading(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, 'REJECTED');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setRejectModalOrder(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject order');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle item completion state for line cooks
  const toggleItemDone = (orderId: number, itemId: number) => {
    const key = `${orderId}-${itemId}`;
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter only active kitchen tickets: PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP
  const activeOrders = useMemo(() => {
    return orders
      .filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // FIFO: oldest first!
  }, [orders]);

  // Metrics
  const cookingCount = activeOrders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = activeOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
  const pendingCount = activeOrders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;

  const filteredTickets = useMemo(() => {
    switch (activeFilter) {
      case 'COOKING':
        return activeOrders.filter((o) => o.status === 'PREPARING');
      case 'READY':
        return activeOrders.filter((o) => o.status === 'READY_FOR_PICKUP');
      case 'PENDING':
        return activeOrders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED');
      default:
        return activeOrders;
    }
  }, [activeOrders, activeFilter]);

  // Format elapsed time (MM:SS)
  const getElapsedSeconds = (createdAt: string) => {
    const orderTime = new Date(createdAt).getTime();
    return Math.max(0, Math.floor((nowTimestamp - orderTime) / 1000));
  };

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Color threshold for timer: <10m Fresh (Emerald), 10-20m Warning (Amber), >20m Rush (Rose)
  const getTimerLevel = (seconds: number) => {
    const mins = seconds / 60;
    if (mins < 10) return 'FRESH';
    if (mins < 20) return 'WARNING';
    return 'RUSH';
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* KDS Station Top Command Bar */}
      <header className="shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 z-20 shadow-md">
        {/* Left: Branding & Station Info */}
        <div className="flex items-center gap-3">
          <Link
            href="/restaurant/orders"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            title="Return to regular orders portal"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.restaurant.kdsExit}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#FF5A1F]" />
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                  {t.restaurant.kds}
                </h1>
                <span className="text-[10px] font-mono font-bold bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 px-1.5 py-0.2 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[280px]">
                {orders[0]?.restaurantName || 'Kitchen Expediter Board'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Filter Tabs & Ticket Counter Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'ALL'
                ? 'bg-[#FF5A1F] text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{t.restaurant.kdsFilterAll}</span>
            <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('PENDING')}
            className={`px-2.5 py-1.2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Queue</span>
            <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('COOKING')}
            className={`px-2.5 py-1.2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'COOKING'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline">{t.restaurant.kdsCookingCount}</span>
            <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">
              {cookingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('READY')}
            className={`px-2.5 py-1.2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'READY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{t.restaurant.kdsExpoCount}</span>
            <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">
              {readyCount}
            </span>
          </button>
        </div>

        {/* Right: Audio Controls, Clock, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Digital Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300">
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime || '00:00:00'}</span>
          </div>

          {/* Test Chime Button */}
          <button
            onClick={playKitchenChime}
            type="button"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Test Kitchen Audio Bell"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            type="button"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title="Toggle Kitchen Sound Alerts"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Language Toggle */}
          <div className="hidden sm:block">
            <LanguageToggle variant="dropdown" />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            type="button"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Refresh Manual */}
          <button
            onClick={() => loadOrders()}
            type="button"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Kitchen Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5A1F]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main KDS Tickets Board */}
      <main className="flex-1 overflow-x-auto overflow-y-auto p-4 bg-slate-950">
        {loading && orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF5A1F]" />
            <p className="text-sm font-bold uppercase tracking-wider">Syncing Kitchen Display...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-xl mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">{t.restaurant.kdsNoTickets}</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.restaurant.kdsNoTicketsDesc}
            </p>
            <button
              onClick={() => loadOrders()}
              className="mt-6 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Tickets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start pb-6">
            {filteredTickets.map((order) => {
              const elapsedSec = getElapsedSeconds(order.createdAt);
              const timerLevel = getTimerLevel(elapsedSec);
              const totalItemsCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
              const completedCount = order.items.filter((it) => completedItems[`${order.id}-${it.id}`]).length;
              const isAllPrepared = completedCount === order.items.length && order.items.length > 0;

              // Border and timer theme based on urgency
              const urgencyStyles = {
                FRESH: {
                  cardBorder: 'border-emerald-600/50 hover:border-emerald-500',
                  badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
                  headerBg: 'bg-gradient-to-r from-emerald-950/80 to-slate-900',
                  timerText: 'text-emerald-400',
                  label: t.restaurant.kdsFresh,
                  pulse: false,
                },
                WARNING: {
                  cardBorder: 'border-amber-500/60 hover:border-amber-400',
                  badgeBg: 'bg-amber-950 text-amber-300 border-amber-700/80',
                  headerBg: 'bg-gradient-to-r from-amber-950/80 to-slate-900',
                  timerText: 'text-amber-300',
                  label: t.restaurant.kdsWarning,
                  pulse: false,
                },
                RUSH: {
                  cardBorder: 'border-rose-500/90 shadow-lg shadow-rose-950/50 hover:border-rose-400',
                  badgeBg: 'bg-rose-950 text-rose-200 border-rose-600',
                  headerBg: 'bg-gradient-to-r from-rose-950/90 to-slate-900',
                  timerText: 'text-rose-400',
                  label: t.restaurant.kdsDelayed,
                  pulse: true,
                },
              }[timerLevel];

              return (
                <div
                  key={order.id}
                  className={`flex flex-col bg-slate-900 rounded-2xl border-2 transition-all shadow-md overflow-hidden ${urgencyStyles.cardBorder}`}
                >
                  {/* Ticket Header: Order ID, Elapsed Time, Delivery Mode */}
                  <div className={`p-3.5 border-b border-slate-800 ${urgencyStyles.headerBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-white">
                          #{order.id.toString().padStart(6, '0')}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                          <Bike className="w-3 h-3 text-[#FF5A1F]" />
                          Delivery
                        </span>
                      </div>

                      {/* Print Ticket Shortcut */}
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Print Kitchen Docket"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Timer & Urgency Pill */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Timer className={`w-4 h-4 ${urgencyStyles.timerText} ${urgencyStyles.pulse ? 'animate-pulse' : ''}`} />
                        <span className={`font-mono text-base font-black ${urgencyStyles.timerText}`}>
                          {formatElapsed(elapsedSec)}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${urgencyStyles.badgeBg} ${
                            urgencyStyles.pulse ? 'animate-pulse' : ''
                          }`}
                        >
                          {urgencyStyles.label}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Prep Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>
                          {completedCount}/{order.items.length} {t.restaurant.kdsItemsCompleted}
                        </span>
                        <span>{order.items.length > 0 ? Math.round((completedCount / order.items.length) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isAllPrepared ? 'bg-emerald-500' : 'bg-[#FF5A1F]'
                          }`}
                          style={{
                            width: `${order.items.length > 0 ? (completedCount / order.items.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Info & Notes */}
                  <div className="px-3.5 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 truncate">
                      {order.customerName || 'Customer'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Customer Special Note Banner */}
                  {order.notes && (
                    <div className="mx-3.5 my-2 p-2 rounded-xl bg-amber-950/60 border border-amber-600/70 text-amber-200 text-xs font-semibold flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-snug text-[11px]">
                        <strong>Note:</strong> {order.notes}
                      </span>
                    </div>
                  )}

                  {/* Dish Line Items with Tap-to-Strikethrough */}
                  <div className="p-3.5 space-y-2 flex-1 min-h-[140px] max-h-[340px] overflow-y-auto">
                    {order.items.map((item) => {
                      const isDone = !!completedItems[`${order.id}-${item.id}`];

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItemDone(order.id, item.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                            isDone
                              ? 'bg-slate-950/40 border-slate-800/80 opacity-50'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
                          }`}
                        >
                          {/* Checkbox circle */}
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-500 bg-slate-900'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`font-bold text-sm leading-snug transition-all ${
                                  isDone
                                    ? 'line-through text-slate-500'
                                    : 'text-white'
                                }`}
                              >
                                <span className="text-[#FF5A1F] font-black mr-1 text-base">
                                  {item.quantity}×
                                </span>
                                {item.foodName}
                              </span>
                            </div>

                            {/* Modifiers / Options */}
                            {item.selectedOptions && (
                              <div className="mt-1">
                                <span className="inline-block text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-md">
                                  {item.selectedOptions}
                                </span>
                              </div>
                            )}

                            {/* Special Instructions */}
                            {item.specialInstructions && (
                              <p className="text-[11px] text-orange-300 italic mt-1 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900/50">
                                👨‍🍳 {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Kitchen Action Pipeline Buttons */}
                  <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
                    {/* Status: PENDING */}
                    {order.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                          disabled={actionLoading === order.id}
                          className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Ticket</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectModalOrder(order)}
                          disabled={actionLoading === order.id}
                          className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Status: CONFIRMED -> Click to Start Cooking */}
                    {order.status === 'CONFIRMED' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          disabled={actionLoading === order.id}
                          className="flex-1 py-3 px-3 rounded-xl bg-[#FF5A1F] hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#FF5A1F]/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Flame className="w-4 h-4 animate-pulse" />
                          <span>{t.restaurant.kdsStartCooking}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectModalOrder(order)}
                          disabled={actionLoading === order.id}
                          className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                          title="Reject order"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Status: PREPARING -> Click when Food Ready */}
                    {order.status === 'PREPARING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                        disabled={actionLoading === order.id}
                        className="w-full py-3.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>{t.restaurant.kdsOrderReady}</span>
                      </button>
                    )}

                    {/* Status: READY_FOR_PICKUP -> Ready at Expo */}
                    {order.status === 'READY_FOR_PICKUP' && (
                      <div className="space-y-1.5">
                        <div className="w-full py-2.5 px-3 rounded-xl bg-blue-950/80 border border-blue-700/60 text-blue-300 font-bold text-xs flex items-center justify-center gap-2">
                          <PackageCheck className="w-4 h-4 text-blue-400" />
                          <span>Expo Pass: Waiting for Rider</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          disabled={actionLoading === order.id}
                          className="w-full py-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer text-center"
                        >
                          ↺ Recall to Grill / Prep Line
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Reject Reason Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-white">
                {t.restaurant.kdsRejectOrder} #{rejectModalOrder.id.toString().padStart(6, '0')}
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {t.restaurant.kdsRejectReason}:
            </p>

            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedRejectReason(reason)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedRejectReason === reason
                      ? 'bg-rose-950 border-rose-600 text-rose-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {t.restaurant.kdsRejectCancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                disabled={actionLoading === rejectModalOrder.id}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {t.restaurant.kdsRejectConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kitchen Ticket Printing Modal */}
      {selectedReceiptOrder && (
        <OrderReceiptModal
          isOpen={!!selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
          order={selectedReceiptOrder}
        />
      )}
    </div>
  );
}
