'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, AlertCircle, ArrowRight, UserCheck, Utensils, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { restaurantService } from '@/services/restaurantService';
import { RestaurantCategory } from '@/types';
import { Button } from '@/components/ui/Button';

const onboardingSchema = z
  .object({
    // Owner details
    name: z.string().min(2, 'Owner name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(8, 'Contact phone number is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        'Password must contain at least 1 uppercase, 1 lowercase, and 1 number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    // Restaurant details
    restaurantName: z.string().min(2, 'Restaurant name is required'),
    description: z.string().optional(),
    restaurantPhone: z.string().optional(),
    address: z.string().min(5, 'Physical street address is required'),
    openingTime: z.string().min(4, 'Opening time required (e.g. 08:00)'),
    closingTime: z.string().min(4, 'Closing time required (e.g. 22:00)'),
    categoryId: z.coerce.number().min(1, 'Please select a cuisine category'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const { restaurantRegister } = useAuthStore();
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      restaurantName: '',
      description: '',
      restaurantPhone: '',
      address: '',
      openingTime: '08:00',
      closingTime: '22:00',
      categoryId: 1,
    },
  });

  useEffect(() => {
    restaurantService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]));
  }, []);

  const onSubmit = async (data: OnboardingFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await restaurantRegister({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        restaurantName: data.restaurantName,
        description: data.description,
        restaurantPhone: data.restaurantPhone || data.phone,
        address: data.address,
        latitude: 11.5564,
        longitude: 104.9282,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        categoryId: Number(data.categoryId),
      });
      router.push('/restaurant/pending');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Partner application submission failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Apply as Restaurant Partner
          </h1>
          <p className="text-sm text-slate-400">
            Submit your restaurant details for administrator review & onboarding
          </p>
        </div>

        {/* Application Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 sm:p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 p-4 text-xs text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Owner Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  1. Owner & Account Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Owner Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="partner@restaurant.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+855 12 345 678"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase & 1 num"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Restaurant Profile */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400">
                <Store className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  2. Restaurant Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Restaurant Public Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Phnom Penh Bistro"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('restaurantName')}
                  />
                  {errors.restaurantName && (
                    <p className="mt-1 text-xs text-rose-400">{errors.restaurantName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cuisine Category
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    {...register('categoryId')}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    {categories.length === 0 && <option value="1">Fast Food</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  placeholder="#12, Street 310, BKK1, Phnom Penh"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-rose-400">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description / Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Authentic artisan burgers and grilled specialities..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    placeholder="08:00"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('openingTime')}
                  />
                  {errors.openingTime && (
                    <p className="mt-1 text-xs text-rose-400">{errors.openingTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    placeholder="22:00"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    {...register('closingTime')}
                  />
                  {errors.closingTime && (
                    <p className="mt-1 text-xs text-rose-400">{errors.closingTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submission notice */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs text-slate-400 space-y-1.5">
              <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Production Review Policy:
              </p>
              <p className="leading-relaxed">
                By submitting this form, your user account will be created with role <span className="text-white font-semibold">RESTAURANT_OWNER</span>, and your restaurant profile will be marked as <span className="text-amber-400 font-semibold">PENDING</span> until administrative approval.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting Partner Application...' : 'Submit Restaurant Application'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800">
            Already registered as a partner?{' '}
            <Link
              href="/restaurant/login"
              className="font-bold text-emerald-400 hover:underline"
            >
              Sign in to Partner Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
