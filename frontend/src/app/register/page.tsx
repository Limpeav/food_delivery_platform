'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Utensils, AlertCircle, Store, Bike, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phoneNumber: z.string().min(8, 'Please enter a valid phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        'Must contain at least 1 uppercase, 1 lowercase, and 1 number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { customerRegister } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await customerRegister({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-orange-50/40 via-white to-slate-50">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            title="Return to Cravery Home"
            className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FF5A1F] text-white shadow-xl shadow-[#FF5A1F]/30 transform transition-transform hover:scale-105"
          >
            <Utensils className="h-7 w-7" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-500">
            Join Cravery to discover top restaurants and enjoy fast delivery
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@gmail.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+855 12 345 678"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters with 1 uppercase & 1 number"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Security Password Policy:</p>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Minimum 8 characters</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> At least 1 number</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> At least 1 uppercase</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> At least 1 lowercase</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Create Customer Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#FF5A1F] hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>

        {/* Partner Onboarding Inquiries */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center space-y-2">
          <p className="text-xs font-bold text-slate-700">Want to partner with Cravery?</p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold">
            <Link
              href="/restaurant/register"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <Store className="w-3.5 h-3.5" />
              Register Restaurant
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/driver/register"
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:underline"
            >
              <Bike className="w-3.5 h-3.5" />
              Become a Driver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
