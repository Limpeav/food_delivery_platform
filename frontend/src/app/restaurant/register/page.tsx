'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Store,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Utensils,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { restaurantService } from '@/services/restaurantService';
import { RestaurantCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { LocationPicker, LocationPickerValue } from '@/components/ui/LocationPicker';
import { useTranslation } from '@/stores/languageStore';

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
  const { t } = useTranslation();
  const { restaurantRegister } = useAuthStore();
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location state managed separately (outside RHF since it's a complex object)
  const [location, setLocation] = useState<LocationPickerValue>({
    lat: 11.5564,
    lng: 104.9282,
    address: '',
  });
  const [locationError, setLocationError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
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
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) {
          setValue('categoryId', cats[0].id);
        }
      })
      .catch(() => setCategories([]));
  }, [setValue]);

  const handleNextFromStep1 = async () => {
    const isValid = await trigger(['name', 'email', 'phone', 'password', 'confirmPassword']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleNextFromStep2 = async () => {
    const isValid = await trigger(['restaurantName', 'categoryId', 'address', 'openingTime', 'closingTime']);
    if (isValid) {
      setCurrentStep(3);
    }
  };

  const goToStep = async (target: 1 | 2 | 3) => {
    if (target === 1) {
      setCurrentStep(1);
      return;
    }
    const step1Valid = await trigger(['name', 'email', 'phone', 'password', 'confirmPassword']);
    if (!step1Valid) {
      setCurrentStep(1);
      return;
    }
    if (target === 2) {
      setCurrentStep(2);
      return;
    }
    const step2Valid = await trigger(['restaurantName', 'categoryId', 'address', 'openingTime', 'closingTime']);
    if (!step2Valid) {
      setCurrentStep(2);
      return;
    }
    setCurrentStep(3);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!location.lat || !location.lng) {
      setLocationError('Please pin your restaurant location on the map.');
      return;
    }
    setLocationError(null);
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
        address: data.address || location.address || '',
        latitude: location.lat,
        longitude: location.lng,
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

  const handleLocationChange = (val: LocationPickerValue) => {
    setLocation(val);
    setLocationError(null);
    if (val.address && !getValues('address')) {
      setValue('address', val.address, { shouldValidate: true });
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-2 sm:py-3 px-3 sm:px-4 my-auto">
      <div className="w-full max-w-2xl space-y-2.5">
        {/* Compact Header */}
        <div className="text-center space-y-0.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-sm">
            <Store className="h-4 w-4" />
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
            {t.restaurant.applyTitle}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.restaurant.applySubtitle}
          </p>
        </div>

        {/* Application Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm dark:shadow-2xl transition-colors space-y-3.5">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 p-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 3-Step Wizard Progress Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs select-none">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span className="truncate">{t.restaurant.step1Short}</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(2)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span className="truncate">{t.restaurant.step2Short}</span>
            </button>

            <button
              type="button"
              onClick={() => goToStep(3)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                currentStep === 3
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <span className="truncate">{t.restaurant.step3Short}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Owner Account */}
            {currentStep === 1 && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.ownerFullName}
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.ownerEmail}
                    </label>
                    <input
                      type="email"
                      placeholder="partner@restaurant.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.contactPhone}
                    </label>
                    <input
                      type="tel"
                      placeholder="+855 12 345 678"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.auth.password}
                    </label>
                    <input
                      type="password"
                      placeholder="Min 8 chars, 1 uppercase"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.auth.confirmPassword}
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <span>{t.common.nextStep}: {t.restaurant.step2Short}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Restaurant Profile */}
            {currentStep === 2 && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.restaurantPublicName}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Phnom Penh Bistro"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('restaurantName')}
                    />
                    {errors.restaurantName && (
                      <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.restaurantName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.cuisineCategory}
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
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

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-8">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.streetAddress}
                    </label>
                    <input
                      type="text"
                      placeholder="#12, Street 310, BKK1, Phnom Penh"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('address')}
                    />
                    {errors.address && (
                      <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.openingTime}
                    </label>
                    <input
                      type="text"
                      placeholder="08:00"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('openingTime')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t.restaurant.closingTime}
                    </label>
                    <input
                      type="text"
                      placeholder="22:00"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      {...register('closingTime')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {t.restaurant.bioDescription}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t.restaurant.bioPlaceholder}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    {...register('description')}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    ← {t.common.previousStep}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <span>{t.common.nextStep}: {t.restaurant.step3Short}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Location & Submit */}
            {currentStep === 3 && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <LocationPicker value={location} onChange={handleLocationChange} mapHeight={170} />
                </div>

                {locationError && (
                  <p className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {locationError}
                  </p>
                )}

                {/* Submission notice */}
                <div className="rounded-xl bg-emerald-50/70 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-slate-700/80 p-2 text-[11px] text-slate-600 dark:text-slate-300 transition-colors">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {t.restaurant.productionReviewPolicy}
                  </p>
                  <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.restaurant.productionReviewNotice}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    ← {t.common.previousStep}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting
                      ? t.restaurant.submittingApplication
                      : t.restaurant.submitApplication}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            {t.restaurant.alreadyRegisteredPartner}{' '}
            <Link href="/restaurant/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              {t.restaurant.signInHub}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
