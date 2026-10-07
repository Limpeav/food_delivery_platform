'use client';

import React from 'react';
import { create } from 'zustand';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers
export const toast = {
  success: (msg: string, duration?: number) =>
    useToastStore.getState().addToast(msg, 'success', duration),
  error: (msg: string, duration?: number) =>
    useToastStore.getState().addToast(msg, 'error', duration),
  info: (msg: string, duration?: number) =>
    useToastStore.getState().addToast(msg, 'info', duration),
  warning: (msg: string, duration?: number) =>
    useToastStore.getState().addToast(msg, 'warning', duration),
};

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
  info: <Info className="w-4 h-4 text-sky-500 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900',
  error: 'border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900',
  info: 'border-sky-200 dark:border-sky-800/80 bg-white dark:bg-slate-900',
  warning: 'border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-900',
};

function ToastItem({ toast: t, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  return (
    <div
      className={`flex items-center gap-3 min-w-[260px] max-w-sm rounded-2xl border px-4 py-3 shadow-lg shadow-slate-200/60 dark:shadow-slate-950/60 ${bgMap[t.type]} animate-in slide-in-from-bottom-3 fade-in duration-200`}
    >
      {iconMap[t.type]}
      <p className="flex-1 text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">{t.message}</p>
      <button
        onClick={onRemove}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
};
