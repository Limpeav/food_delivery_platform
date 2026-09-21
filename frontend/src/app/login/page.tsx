'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Utensils, AlertCircle, Store, Bike } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function CustomerLoginPage() {
  const router = useRouter();
  const { customerLogin, isAuthenticated, user, isLoading, isInitialized } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') router.replace('/admin/dashboard');
      else if (user.role === 'RESTAURANT_OWNER') router.replace('/restaurant/dashboard');
      else if (user.role === 'DRIVER') router.replace('/driver/dashboard');
      else router.replace('/');
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
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

  return (
    <div className="min-h-screen flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-orange-50/40 via-white to-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Portal Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            title="Return to Cravery Home"
            className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FF5A1F] text-white shadow-xl shadow-[#FF5A1F]/30 transform transition-transform hover:scale-105"
          >
            <Utensils className="h-7 w-7" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to your customer account to order food
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="leading-relaxed">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="customer@gmail.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#FF5A1F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-[#FF5A1F] hover:underline">
              Create account
            </Link>
          </div>
        </div>

        {/* Multi-Portal Direction Cards */}
        <div className="border-t border-slate-200/70 pt-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Looking for other portals?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/restaurant/login"
              className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left group"
            >
              <Store className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Restaurant Hub</p>
                <p className="text-[10px] text-slate-400">Partner Login</p>
              </div>
            </Link>

            <Link
              href="/driver/login"
              className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
            >
              <Bike className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Driver Portal</p>
                <p className="text-[10px] text-slate-400">Courier Login</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
