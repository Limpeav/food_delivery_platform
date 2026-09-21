'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookiePreferencesModal: React.FC<CookiePreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [preferences, setPreferences] = useState({
    essential: true, // always true and locked
    functional: true,
    analytics: false,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cravery_cookie_preferences');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences((prev) => ({ ...prev, ...parsed, essential: true }));
        } catch {
          // ignore parsing error
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (newPrefs = preferences) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'cravery_cookie_preferences',
        JSON.stringify({ ...newPrefs, essential: true })
      );
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, functional: true, analytics: true };
    setPreferences(allAccepted);
    handleSave(allAccepted);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A1F] border border-orange-100">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="cookie-preferences-title"
                className="text-lg font-bold text-slate-900"
              >
                Cookie Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Control how Cravery stores cookies on your device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close cookie preferences"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          {/* Essential */}
          <div className="pt-2 flex items-start justify-between gap-4">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Essential Cookies</span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  Required
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Necessary for session authentication, shopping cart items, and fraud prevention. These cannot be disabled.
              </p>
            </div>
            <div className="pt-1">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="h-4 w-4 rounded text-[#FF5A1F] border-slate-300 cursor-not-allowed opacity-75"
                aria-label="Essential cookies required"
              />
            </div>
          </div>

          {/* Functional */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div className="space-y-0.5 pr-2">
              <span className="font-bold text-slate-800">Functional & Address Preferences</span>
              <p className="text-slate-500 leading-relaxed">
                Remember your selected delivery location, recent order filters, and notification settings for convenience.
              </p>
            </div>
            <div className="pt-1">
              <input
                type="checkbox"
                id="pref-functional"
                checked={preferences.functional}
                onChange={(e) =>
                  setPreferences({ ...preferences, functional: e.target.checked })
                }
                className="h-4 w-4 rounded accent-[#FF5A1F] border-slate-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Analytics */}
          <div className="pt-3 flex items-start justify-between gap-4">
            <div className="space-y-0.5 pr-2">
              <span className="font-bold text-slate-800">Performance & Analytics</span>
              <p className="text-slate-500 leading-relaxed">
                Collect aggregated, anonymous metrics to help us optimize delivery route speeds and page loading times.
              </p>
            </div>
            <div className="pt-1">
              <input
                type="checkbox"
                id="pref-analytics"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({ ...preferences, analytics: e.target.checked })
                }
                className="h-4 w-4 rounded accent-[#FF5A1F] border-slate-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict privacy compliant</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAcceptAll}
              className="rounded-xl text-xs flex-1 sm:flex-none"
            >
              Accept All
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSave()}
              className="rounded-xl text-xs flex-1 sm:flex-none"
            >
              {savedSuccess ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              ) : (
                'Save Choices'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
