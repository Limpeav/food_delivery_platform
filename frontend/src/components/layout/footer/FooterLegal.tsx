'use client';

import React from 'react';
import Link from 'next/link';
import { footerLegalLinks } from '@/config/footer';
import { useTranslation } from '@/stores/languageStore';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

interface FooterLegalProps {
  onOpenCookiePreferences: () => void;
}

export const FooterLegal: React.FC<FooterLegalProps> = ({
  onOpenCookiePreferences,
}) => {
  const { t } = useTranslation();

  const getLocalizedLegalLabel = (label: string) => {
    if (label === 'Privacy Policy') return t.footer.privacyPolicy;
    if (label === 'Terms of Service') return t.footer.termsOfService;
    if (label === 'Cookie Policy') return t.footer.cookiePreferences;
    if (label === 'Refund Policy') return t.footer.refundPolicy;
    if (label === 'Accessibility') return t.footer.accessibility;
    return label;
  };

  return (
    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
      {/* Copyright */}
      <p className="order-2 md:order-1 text-center md:text-left">
        © {new Date().getFullYear()} Cravery. {t.footer.rightsReserved}
      </p>

      {/* Language Selector + Legal Navigation */}
      <div className="order-1 md:order-2 flex flex-wrap items-center justify-center gap-4">
        <LanguageToggle variant="pill" />

        <nav
          aria-label="Legal and privacy navigation"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 dark:text-slate-400 font-medium"
        >
          {footerLegalLinks.map((item, idx) => (
            <React.Fragment key={idx}>
              <Link
                href={item.href}
                className="hover:text-[#FF5A1F] dark:hover:text-[#FF5A1F] transition-colors focus-visible:outline-hidden focus-visible:text-[#FF5A1F]"
              >
                {getLocalizedLegalLabel(item.label)}
              </Link>
              <span className="text-slate-200 dark:text-slate-700 hidden sm:inline">•</span>
            </React.Fragment>
          ))}

          {/* Interactive Cookie Preferences Trigger */}
          <button
            type="button"
            onClick={onOpenCookiePreferences}
            className="hover:text-[#FF5A1F] dark:hover:text-[#FF5A1F] transition-colors cursor-pointer text-slate-500 dark:text-slate-400 font-medium focus-visible:outline-hidden focus-visible:text-[#FF5A1F]"
          >
            {t.footer.cookiePreferences}
          </button>
        </nav>
      </div>
    </div>
  );
};
