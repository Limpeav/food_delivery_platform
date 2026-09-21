'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Check, Clock } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, authLoading, router, fetchNotifications]);

  if (isLoading && notifications.length === 0) {
    return <Loading fullPage message="Loading notifications..." />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding your orders, discounts, and deliveries
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            className="rounded-xl text-xs gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No notifications yet"
          description="We'll notify you here when your order status updates or special promotions drop."
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                notif.read ? 'bg-white' : 'bg-[#FFF1EB]/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.read
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-[#FF5A1F] text-white shadow-xs'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF5A1F] hover:bg-white transition-colors cursor-pointer"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
