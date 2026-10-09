'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bike, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/languageStore';

const driverSchema = z
  .object({
    name: z.string().min(2, 'Full name is required'),
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

    vehicleType: z.string().min(1, 'Please select vehicle type'),
    vehicleNumber: z.string().min(2, 'Vehicle registration plate number is required'),
    licenseNumber: z.string().min(3, 'Driver license number is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type DriverFormData = z.infer<typeof driverSchema>;

export default function DriverRegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { driverRegister } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      vehicleType: 'MOTORCYCLE',
      vehicleNumber: '',
      licenseNumber: '',
    },
  });

  const onSubmit = async (data: DriverFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await driverRegister({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber,
        licenseNumber: data.licenseNumber,
      });
      router.push('/driver/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Driver registration failed. Please check your information.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 my-auto">
      <div className="w-full max-w-xl space-y-3 sm:space-y-3.5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Bike className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.driver.applyTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.driver.applySubtitle}
          </p>
        </div>

        {/* Application Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm dark:shadow-2xl transition-colors space-y-3">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 p-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.driver.fullLegalName}
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  placeholder="driver@courier.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.phoneNumber}
                </label>
                <input
                  type="tel"
                  placeholder="+855 12 345 678"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  placeholder="Min 8 chars"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.confirmPassword}
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Vehicle & License Information */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {t.driver.vehicleSectionTitle}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {t.driver.vehicleType}
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    {...register('vehicleType')}
                  >
                    <option value="MOTORCYCLE">{t.driver.motorcycle}</option>
                    <option value="SCOOTER">{t.driver.scooter}</option>
                    <option value="BICYCLE">{t.driver.bicycle}</option>
                    <option value="CAR">{t.driver.car}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {t.driver.plateNumber}
                  </label>
                  <input
                    type="text"
                    placeholder="1AB-9876"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    {...register('vehicleNumber')}
                  />
                  {errors.vehicleNumber && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.vehicleNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {t.driver.licenseNumber}
                  </label>
                  <input
                    type="text"
                    placeholder="DL-992817"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    {...register('licenseNumber')}
                  />
                  {errors.licenseNumber && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Application Notice */}
            <div className="rounded-xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700/80 p-2.5 text-xs text-slate-600 dark:text-slate-300 space-y-0.5 transition-colors">
              <p className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> {t.driver.vettingTitle}
              </p>
              <p className="leading-snug text-[10px]">
                {t.driver.vettingNotice}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 text-sm transition-all shadow-md shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? t.driver.submittingApplication : t.driver.submitApplication}
            </button>
          </form>

          <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            {t.driver.alreadyRegisteredDriver}{' '}
            <Link href="/driver/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {t.driver.signInPortal}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
