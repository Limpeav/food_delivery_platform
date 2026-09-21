'use client';

import React, { useState } from 'react';
import { appDownloadConfig } from '@/config/footer';

export const FooterAppDownload: React.FC = () => {
  const [showNotice, setShowNotice] = useState(false);

  const handleAppClick = (e: React.MouseEvent, url: string, storeName: string) => {
    if (!url) {
      e.preventDefault();
      setShowNotice(true);
      setTimeout(() => setShowNotice(false), 3500);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
          {appDownloadConfig.title}
        </h4>
        <p className="text-[11px] text-slate-500 mt-1">
          {appDownloadConfig.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* App Store Button */}
        <a
          href={appDownloadConfig.appStoreUrl || '#'}
          onClick={(e) =>
            handleAppClick(e, appDownloadConfig.appStoreUrl, 'App Store')
          }
          target={appDownloadConfig.appStoreUrl ? '_blank' : undefined}
          rel={appDownloadConfig.appStoreUrl ? 'noopener noreferrer' : undefined}
          aria-label="Download Cravery on Apple App Store"
          className="group inline-flex items-center gap-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 transition-all shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
        >
          {/* Apple Logo SVG */}
          <svg
            className="w-5 h-5 fill-current shrink-0"
            viewBox="0 0 170 170"
          >
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.99-6.43-9.98-11.45-21.72-15.06-35.22-3.61-13.5-5.42-26.06-5.42-37.69 0-15.22 3.99-27.81 11.97-37.77 7.98-9.96 17.82-15.06 29.53-15.31 4.58 0 9.87 1.25 15.86 3.75 5.99 2.5 9.77 3.81 11.34 3.93 1.91-.25 5.92-1.63 12.03-4.14 6.11-2.51 11.25-3.69 15.42-3.54 11.42.5 20.89 4.67 28.42 12.51-9.93 6.01-14.81 14.54-14.65 25.59.16 8.7 3.51 15.93 10.05 21.68 6.54 5.75 14.28 9.07 23.22 9.96-2.54 7.68-5.48 15.29-8.82 22.83zM119.22 33.3c0-7.14 2.65-13.95 7.95-20.43 5.3-6.48 11.75-10.77 19.35-12.87.22 1.34.33 2.52.33 3.54 0 7.15-2.73 14.07-8.19 20.76-5.46 6.69-12 11.02-19.62 12.98-.11-1.34-.17-2.67-.17-3.98z" />
          </svg>
          <div className="text-left leading-none">
            <span className="block text-[9px] text-slate-300 font-medium tracking-wide">
              Download on the
            </span>
            <span className="block text-xs font-bold text-white tracking-tight mt-0.5">
              App Store
            </span>
          </div>
        </a>

        {/* Google Play Button */}
        <a
          href={appDownloadConfig.googlePlayUrl || '#'}
          onClick={(e) =>
            handleAppClick(e, appDownloadConfig.googlePlayUrl, 'Google Play')
          }
          target={appDownloadConfig.googlePlayUrl ? '_blank' : undefined}
          rel={appDownloadConfig.googlePlayUrl ? 'noopener noreferrer' : undefined}
          aria-label="Get Cravery on Google Play"
          className="group inline-flex items-center gap-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 transition-all shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
        >
          {/* Google Play SVG */}
          <svg
            className="w-5 h-5 fill-current shrink-0"
            viewBox="0 0 24 24"
          >
            <path d="M3.609 1.814L13.792 12 3.61 22.186c-.352-.33-.61-.83-.61-1.46V3.274c0-.63.258-1.13.61-1.46zM15.207 13.414l2.76 2.76-12.44 7.17c-.36.21-.73.23-1.02.13l10.7-10.06zM15.207 10.586L4.507.526c.29-.1.66-.08 1.02.13l12.44 7.17-2.76 2.76zM16.621 12l3.48-2.01c.95-.55.95-1.45 0-2L16.62 12l3.48 2.01c.95.55.95 1.45 0 2L16.621 12z" />
          </svg>
          <div className="text-left leading-none">
            <span className="block text-[9px] text-slate-300 font-medium tracking-wide">
              GET IT ON
            </span>
            <span className="block text-xs font-bold text-white tracking-tight mt-0.5">
              Google Play
            </span>
          </div>
        </a>
      </div>

      {showNotice && (
        <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-[11px] text-[#FF5A1F] font-semibold animate-in fade-in duration-150">
          Mobile apps currently undergoing store review. Available soon!
        </div>
      )}
    </div>
  );
};
