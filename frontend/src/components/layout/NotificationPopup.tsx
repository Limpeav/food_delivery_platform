'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Package,
  Bike,
  CheckCircle2,
  Tag,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useTranslation } from '@/stores/languageStore';
import { Notification } from '@/types';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Click outside and escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    if (notif.referenceId) {
      onClose();
      router.push(`/orders/${notif.referenceId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY':
        return <Bike className="w-4 h-4 text-blue-500" />;
      case 'ORDER':
        return <Package className="w-4 h-4 text-[#FF5A1F]" />;
      case 'PAYMENT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'RESTAURANT':
        return <Tag className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const now = new Date();
      const past = new Date(timestamp);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return t.notificationsPage.justNow;
      if (diffMins < 60) return `${diffMins}${t.notificationsPage.mAgo}`;
      if (diffHours < 24) return `${diffHours}${t.notificationsPage.hAgo}`;
      if (diffDays < 7) return `${diffDays}${t.notificationsPage.dAgo}`;
      return past.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US');
    } catch {
      return '';
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 rounded-3xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-0 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5 dark:ring-white/5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3.5 bg-slate-50/70 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{t.notificationsPage.title}</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF5A1F] text-white">
              {unreadCount} {t.notificationsPage.newBadge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-[#FF5A1F] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t.notificationsPage.markAsRead}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.notificationsPage.emptyTitle}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto">
              {t.notificationsPage.emptyDesc}
            </p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer relative ${
                !notif.read ? 'bg-[#FFF1EB]/25 dark:bg-orange-950/20' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  !notif.read ? 'bg-[#FF5A1F]/10 dark:bg-orange-950/50' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs truncate ${
                      !notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F] shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
        <Link
          href="/notifications"
          onClick={onClose}
          className="w-full text-center py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-850 hover:text-[#FF5A1F] dark:hover:text-[#FF5A1F] hover:shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          {t.notificationsPage.viewAll} <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
