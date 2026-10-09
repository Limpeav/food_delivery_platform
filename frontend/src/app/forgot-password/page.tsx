'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight, Utensils } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/stores/languageStore';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Utility Header with Language & Theme Toggles */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 transition-colors">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center font-black shadow-md shadow-[#FF5A1F]/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Cravery<span className="text-[#FF5A1F]">.</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle variant="pill" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500 text-white shadow-xl shadow-amber-500/30">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.auth.forgotPasswordTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.auth.forgotPasswordSubtitle}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors">
            {submitted ? (
              <div className="space-y-5 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.auth.checkEmail}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.auth.checkEmailDesc} (<span className="font-semibold text-slate-700 dark:text-slate-200">{getValues('email')}</span>)
                  </p>
                </div>

                {generatedToken ? (
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 text-[11px] text-emerald-800 dark:text-emerald-300 text-left space-y-1">
                    <p className="font-bold">{t.auth.devResetToken}</p>
                    <p className="font-mono break-all text-[10px] bg-white dark:bg-slate-900 p-1.5 rounded border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200">
                      {generatedToken}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-[11px] text-slate-600 dark:text-slate-300 text-left space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{t.auth.devSimulatorNotice}</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {t.auth.devConsoleLogsNotice}
                    </p>
                  </div>
                )}

                <Link
                  href={generatedToken ? `/reset-password?token=${generatedToken}` : '/reset-password'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#E04812] transition-colors"
                >
                  {t.auth.proceedToReset} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.auth.registeredEmail}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="you@gmail.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#FF5A1F] focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 transition-all"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 cursor-pointer font-bold"
                  isLoading={isSubmitting}
                >
                  {t.auth.sendResetLink}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t.auth.backToSignIn}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
