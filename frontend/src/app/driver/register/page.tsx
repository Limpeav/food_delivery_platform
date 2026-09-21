'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bike, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/25">
            <Bike className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Apply as Delivery Driver
          </h1>
          <p className="text-sm text-slate-400">
            Submit your courier license and vehicle info to begin onboarding
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="driver@courier.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+855 12 345 678"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
                  placeholder="Min 8 chars"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
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
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Vehicle & License Information */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Vehicle & License Registration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    {...register('vehicleType')}
                  >
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="SCOOTER">Electric Scooter</option>
                    <option value="BICYCLE">Bicycle</option>
                    <option value="CAR">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    placeholder="1AB-9876"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    {...register('vehicleNumber')}
                  />
                  {errors.vehicleNumber && (
                    <p className="mt-1 text-xs text-rose-400">{errors.vehicleNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Driver License #
                  </label>
                  <input
                    type="text"
                    placeholder="DL-992817"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    {...register('licenseNumber')}
                  />
                  {errors.licenseNumber && (
                    <p className="mt-1 text-xs text-rose-400">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Application Notice */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 text-xs text-slate-400 space-y-1">
              <p className="font-bold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Driver Vetting Process:
              </p>
              <p className="leading-relaxed">
                Your driver account will be submitted with status <span className="text-amber-400 font-semibold">PENDING</span>. Once administrators verify your license number, you will be approved to go online and accept delivery dispatches.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black py-3 text-sm transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Driver Application'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800">
            Already registered as a driver?{' '}
            <Link href="/driver/login" className="font-bold text-blue-400 hover:underline">
              Sign in to Driver Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
