'use client';

import React, { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { User } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/languageStore';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { toast } from '@/components/ui/Toast';

export interface PhonePromptModalProps {
  isOpen: boolean;
  user: User | null;
  onSuccess: (updatedUser: User) => void;
}

export type GooglePhonePromptModalProps = PhonePromptModalProps;

const OPERATOR_PREFIXES = new Set([
  '10', '11', '12', '15', '16', '17',
  '60', '61', '67', '69', '70',
  '77', '78', '81', '86', '87', '89',
  '90', '92', '93', '95', '96', '97', '98', '99',
]);

function extractSubscriberDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('855')) {
    return digits.substring(3);
  }
  if (digits.startsWith('0')) {
    return digits.substring(1);
  }
  return digits;
}

function validateCambodianPhone(raw: string): { isValid: boolean; normalized?: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, error: 'Please enter your phone number' };
  }
  const digits = raw.replace(/\D/g, '');
  let national = digits;
  if (digits.startsWith('855')) {
    national = digits.substring(3);
  } else if (digits.startsWith('0')) {
    national = digits.substring(1);
  }
  if (national.length < 8 || national.length > 9) {
    return { isValid: false, error: 'Cambodian mobile numbers must be 8 or 9 digits (e.g. 012 345 678)' };
  }
  const prefix = national.substring(0, 2);
  if (!OPERATOR_PREFIXES.has(prefix)) {
    return { isValid: false, error: `Prefix 0${prefix} is not a recognized Cambodian mobile operator.` };
  }
  return { isValid: true, normalized: `+855${national}` };
}

export const PhonePromptModal: React.FC<PhonePromptModalProps> = ({
  isOpen,
  user,
  onSuccess,
}) => {
  const { completeProfile, logout } = useAuthStore();
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subscriberDigits = extractSubscriberDigits(phoneNumber);
  const isNumberCountValid = subscriberDigits.length >= 8 && subscriberDigits.length <= 9;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    // Strip 855 prefix if pasted with international code
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.startsWith('855')) {
      raw = digitsOnly.substring(3);
    }
    // Only allow numbers and spaces
    const filtered = raw.replace(/[^\d\s]/g, '');
    const cleanDigits = filtered.replace(/\D/g, '');

    // Limit input length: max 10 if starts with 0 (e.g. 096 123 4567), otherwise 9
    const maxDigits = cleanDigits.startsWith('0') ? 10 : 9;
    if (cleanDigits.length > maxDigits) {
      return;
    }

    setPhoneNumber(filtered);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const check = validateCambodianPhone(phoneNumber);
    if (!check.isValid || !check.normalized) {
      setErrorMsg(check.error || 'Please enter a valid Cambodian phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await completeProfile(check.normalized);
      toast.success('Phone number saved successfully! Welcome to Cravery.');
      onSuccess(updatedUser);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to save phone number. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl transition-all duration-200 animate-in zoom-in-95 space-y-5">
        {/* Language selector in top corner */}
        <div className="flex justify-end -mt-1 -mr-1">
          <LanguageToggle variant="pill" />
        </div>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-[#FF5A1F] flex items-center justify-center shadow-md shadow-orange-500/10">
              <Phone className="w-7 h-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.auth.phoneModalTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
              {t.auth.phoneModalSubtitle}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.auth.phoneNumber} <span className="text-[#FF5A1F]">*</span>
              </label>
              {subscriberDigits.length > 0 && (
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    isNumberCountValid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {subscriberDigits.length}/8–9 {t.auth.digitsRequirement} {isNumberCountValid && '✓'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 pr-2.5 py-1">
                <span className="text-base leading-none">🇰🇭</span>
                <span>+855</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="12 345 678"
                autoFocus
                disabled={isSubmitting}
                className="w-full pl-24 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isNumberCountValid}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#FF5A1F] hover:bg-[#e04810] text-white font-bold text-sm transition-all shadow-md shadow-[#FF5A1F]/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.auth.savingPhone}</span>
                </>
              ) : (
                <>
                  <span>{t.auth.saveAndContinue}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full text-center text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-2 transition-colors cursor-pointer py-1"
            >
              {t.auth.signOutDifferentAccount}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const GooglePhonePromptModal = PhonePromptModal;
