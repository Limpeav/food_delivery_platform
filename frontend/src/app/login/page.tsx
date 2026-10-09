'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Utensils, AlertCircle, Lock, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/stores/languageStore';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { customerLogin, isAuthenticated, user, isLoading, isInitialized } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') router.replace('/admin/dashboard');
      else if (user.role === 'RESTAURANT_OWNER') router.replace('/restaurant/dashboard');
      else if (user.role === 'DRIVER') router.replace('/driver/dashboard');
      else {
        router.replace('/');
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
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await customerLogin(data.email, data.password);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoCustomer = async () => {
    setValue('email', 'customer@gmail.com');
    setValue('password', 'customer123');
    await onSubmit({ email: 'customer@gmail.com', password: 'customer123' });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-x-hidden">
      {/* Top Utility Header with Language & Theme Toggles */}
      <header className="shrink-0 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-2.5 sm:py-3 transition-colors">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center font-black shadow-md shadow-[#FF5A1F]/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Cravery<span className="text-[#FF5A1F]">.</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <LanguageToggle variant="dropdown" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex flex-col justify-center min-h-0 overflow-y-auto p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-3 sm:space-y-3.5 my-auto">
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <Link
              href="/"
              title="Return to Cravery Home"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/30 transform transition-transform hover:scale-105"
            >
              <Utensils className="h-5 w-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.auth.welcomeBack}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.auth.signInSubtitle}
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm dark:shadow-2xl transition-colors space-y-3.5">
            {/* 1-Click Quick Demo Customer Login Button */}
            <button
              type="button"
              onClick={handleQuickDemoCustomer}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/70 text-[#FF5A1F] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              {t.auth.demoCustomerLogin}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                {t.auth.orEnterCredentials}
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div className="leading-snug">
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="customer@gmail.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#FF5A1F] focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 transition-all"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t.auth.password}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#FF5A1F] hover:underline"
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#FF5A1F] focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 transition-all"
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

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2 cursor-pointer font-bold py-2.5 text-sm"
                isLoading={isSubmitting}
              >
                {t.auth.signIn}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {t.auth.orContinueWith}
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <GoogleSignInButton text="continue_with" />

            <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              {t.auth.dontHaveAccount}{' '}
              <Link href="/register" className="font-bold text-[#FF5A1F] hover:underline">
                {t.auth.signUp}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
