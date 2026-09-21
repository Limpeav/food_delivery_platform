'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldAlert, AlertCircle, Lock, Mail, Eye, EyeOff, UserCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter an administrator email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isAuthenticated, user, isLoading, isInitialized, logout } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin/dashboard');
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
      await adminLogin(data.email, data.password);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Access denied. Invalid administrator credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setValue('email', 'admin@gmail.com');
    setValue('password', 'admin123');
    await onSubmit({ email: 'admin@gmail.com', password: 'admin123' });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-600 text-white shadow-xl shadow-purple-600/30">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Admin Console
          </h1>
          <p className="text-sm text-slate-400">
            Platform governance, merchant moderation, and system management
          </p>
        </div>

        {/* Active Role Switch Banner */}
        {user && user.role !== 'ADMIN' && (
          <div className="rounded-2xl border border-purple-800/60 bg-purple-950/40 p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-200 leading-relaxed">
                <p className="font-semibold text-white">
                  Currently active: <span className="text-purple-300">{user.name}</span> ({user.role.replace('_', ' ')})
                </p>
                <p className="text-purple-300/80 mt-0.5 text-[11px]">
                  Sign in with administrator credentials below to switch to the Superadmin Console.
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
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 sm:p-8 shadow-2xl shadow-purple-950/20 backdrop-blur-sm space-y-5">
          {/* 1-Click Quick Demo Login Button */}
          <button
            type="button"
            onClick={handleQuickDemoAdmin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            1-Click Demo Admin Login (admin@gmail.com)
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
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@gmail.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
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
              className="w-full mt-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black py-3 text-sm transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Admin Console'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" /> Restricted Platform Access
            </p>
            <p className="text-[10px] text-slate-500">
              Only authorized Cravery platform administrators may access this console.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
