'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, AlertCircle, ArrowRight, Mail, Lock, Eye, EyeOff, UserCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/languageStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid restaurant owner email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { restaurantLogin, isAuthenticated, user, isLoading, isInitialized, logout } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && user) {
      if (user.role === 'RESTAURANT_OWNER') {
        router.replace('/restaurant/dashboard');
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await restaurantLogin(data.email, data.password);
      router.replace('/restaurant/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Invalid restaurant owner credentials. Please verify your email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoOwner = async () => {
    setValue('email', 'owner@gmail.com');
    setValue('password', 'owner123');
    await onSubmit({ email: 'owner@gmail.com', password: 'owner123' });
  };

  return (
    <div className="w-full flex items-center justify-center py-2 sm:py-3 px-4 my-auto">
      <div className="w-full max-w-md space-y-3.5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20">
            <Store className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {t.restaurant.hubTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.restaurant.partnerSubtitle}
          </p>
        </div>

        {/* Active Role Switch Banner */}
        {user && user.role !== 'RESTAURANT_OWNER' && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 p-3 space-y-1.5 transition-colors">
            <div className="flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {t.auth.currentlyActive} <span className="text-emerald-700 dark:text-emerald-300 font-bold">{user.name}</span> ({user.role.replace('_', ' ')})
                </p>
                <p className="text-emerald-700/80 dark:text-emerald-300/80 text-[11px]">
                  {t.auth.switchOwnerNotice}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-3 h-3 text-rose-500" /> {t.auth.signOutCurrentAccount}
              </button>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm dark:shadow-2xl transition-colors space-y-3.5">
          {/* 1-Click Quick Demo Login Button */}
          <button
            type="button"
            onClick={handleQuickDemoOwner}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {t.auth.demoOwnerLogin}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">{t.auth.orEnterCredentials}</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 p-3.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="leading-relaxed">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.businessEmail}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="owner@gmail.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t.auth.password}</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 text-sm transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? t.auth.signingIn : t.auth.signInPartnerPortal}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80">
            {t.auth.wantToPartner}{' '}
            <Link
              href="/restaurant/register"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              {t.auth.registerRestaurantLink} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
