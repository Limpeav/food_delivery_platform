'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const token = await authService.forgotPassword({ email: data.email });
      if (token) setGeneratedToken(token);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Unable to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-orange-50/30 via-white to-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500 text-white shadow-xl shadow-amber-500/30">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Forgot Password?
          </h1>
          <p className="text-sm text-slate-500">
            Enter your email and we will send a password reset verification link
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  If an account is associated with <span className="font-semibold text-slate-700">{getValues('email')}</span>, a secure password reset token has been generated.
                </p>
              </div>

              {generatedToken ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-800 text-left space-y-1">
                  <p className="font-bold">Development Reset Token Generated:</p>
                  <p className="font-mono break-all text-[10px] bg-white p-1.5 rounded border border-emerald-200 text-slate-800">
                    {generatedToken}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 text-left space-y-1">
                  <p className="font-bold text-slate-800">Development Simulator Notice:</p>
                  <p className="text-slate-500">
                    Check your backend server console logs for the reset token, then proceed to enter it below.
                  </p>
                </div>
              )}

              <Link
                href={generatedToken ? `/reset-password?token=${generatedToken}` : '/reset-password'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#E04812] transition-colors"
              >
                Proceed to Reset Password <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@gmail.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Send Password Reset Link
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
