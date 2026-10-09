'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { useTranslation } from '@/stores/languageStore';

export const FooterBrand: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Brand Logo & Name */}
      <Link
        href="/"
        className="group inline-flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF5A1F] rounded-2xl"
        aria-label="Cravery Home"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/30 transition-transform group-hover:scale-105">
          <Utensils className="h-4 w-4" />
        </div>
        <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          Cravery<span className="text-[#FF5A1F]">.</span>
        </span>
      </Link>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
        {t.footer.tagline}
      </p>

      {/* Genuine Platform Benefits */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t.footer.genuineQuality}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
          <span>{t.footer.fastDelivery}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{t.footer.liveGps}</span>
        </div>
      </div>
    </div>
  );
};
