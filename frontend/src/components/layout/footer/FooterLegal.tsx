'use client';

import React from 'react';
import Link from 'next/link';
import { copyrightNotice, footerLegalLinks } from '@/config/footer';

interface FooterLegalProps {
  onOpenCookiePreferences: () => void;
}

export const FooterLegal: React.FC<FooterLegalProps> = ({
  onOpenCookiePreferences,
}) => {
  return (
    <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
      {/* Copyright */}
      <p className="order-2 sm:order-1 text-center sm:text-left">
        {copyrightNotice}
      </p>

      {/* Legal & Preferences Navigation */}
      <nav
        aria-label="Legal and privacy navigation"
        className="order-1 sm:order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 font-medium"
      >
        {footerLegalLinks.map((item, idx) => (
          <React.Fragment key={idx}>
            <Link
              href={item.href}
              className="hover:text-[#FF5A1F] transition-colors focus-visible:outline-hidden focus-visible:text-[#FF5A1F]"
            >
              {item.label}
            </Link>
            <span className="text-slate-200 hidden sm:inline">•</span>
          </React.Fragment>
        ))}

        {/* Interactive Cookie Preferences Trigger */}
        <button
          type="button"
          onClick={onOpenCookiePreferences}
          className="hover:text-[#FF5A1F] transition-colors cursor-pointer text-slate-500 font-medium focus-visible:outline-hidden focus-visible:text-[#FF5A1F]"
        >
          Cookie Preferences
        </button>
      </nav>
    </div>
  );
};
