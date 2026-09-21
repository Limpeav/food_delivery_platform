'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, AlertCircle, ArrowRight, Mail, Lock, Eye, EyeOff, UserCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function RestaurantLoginPage() {
  const router = useRouter();
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
      const resp = await restaurantLogin(data.email, data.password);
      if (resp.businessStatus === 'PENDING') {
        router.push('/restaurant/pending');
      } else {
        router.push('/restaurant/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Invalid business credentials. Please verify your email and password.'
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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Restaurant Partner Portal
          </h1>
          <p className="text-sm text-slate-400">
            Sign in with your business credentials to manage store operations
          </p>
        </div>

        {/* Active Role Switch Banner */}
        {user && user.role !== 'RESTAURANT_OWNER' && (
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-200 leading-relaxed">
                <p className="font-semibold text-white">
                  Currently active: <span className="text-emerald-300">{user.name}</span> ({user.role.replace('_', ' ')})
                </p>
                <p className="text-emerald-300/80 mt-0.5 text-[11px]">
                  Sign in with restaurant merchant credentials below to switch to the Partner Management Portal.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3 text-rose-400" /> Sign Out Current Account
              </button>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur-sm space-y-5">
          {/* 1-Click Quick Demo Login Button */}
          <button
            type="button"
            onClick={handleQuickDemoOwner}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            1-Click Demo Owner Login (owner@gmail.com)
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Or enter credentials</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 p-3.5 text-xs text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Business Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="owner@gmail.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Partner Hub'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 pt-5 border-t border-slate-800/80">
            Want to list your restaurant?{' '}
            <Link
              href="/restaurant/register"
              className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              Apply to become a partner <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
