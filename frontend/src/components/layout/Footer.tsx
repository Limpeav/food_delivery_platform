'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  footerCustomerLinks,
  footerPartnerLinks,
  footerSupportLinks,
} from '@/config/footer';
import { FooterBrand } from './footer/FooterBrand';
import { FooterLinkGroup } from './footer/FooterLinkGroup';
import { FooterServiceAreas } from './footer/FooterServiceAreas';
import { FooterAppDownload } from './footer/FooterAppDownload';
import { FooterPaymentAndSocial } from './footer/FooterPaymentAndSocial';
import { FooterLegal } from './footer/FooterLegal';
import { CookiePreferencesModal } from './CookiePreferencesModal';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const [cookieModalOpen, setCookieModalOpen] = useState(false);

  // Completely hide consumer Footer on dedicated partner, admin portals, and auth pages
  if (
    pathname.startsWith('/restaurant') ||
    pathname.startsWith('/driver') ||
    pathname.startsWith('/delivery') ||
    pathname.startsWith('/deliveries') ||
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  return (
    <>
      <footer
        role="contentinfo"
        className="border-t border-slate-200/80 bg-white text-slate-600 mt-auto"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
          {/* Main Navigation Grid */}
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10"
          >
            {/* Col 1: Brand & Genuine Platform Benefits */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
              <FooterBrand />
            </div>

            {/* Col 2: For Customers */}
            <div>
              <FooterLinkGroup
                title="For Customers"
                links={footerCustomerLinks}
                id="footer-for-customers"
              />
            </div>

            {/* Col 3: Partner With Us */}
            <div>
              <FooterLinkGroup
                title="Partner With Us"
                links={footerPartnerLinks}
                id="footer-partners"
              />
            </div>

            {/* Col 4: Customer Care & Support */}
            <div>
              <FooterLinkGroup
                title="Help & Support"
                links={footerSupportLinks}
                id="footer-support"
              />
            </div>

            {/* Col 5: Serving Areas & App Download */}
            <div className="space-y-6">
              <FooterServiceAreas />
              <div className="pt-2 border-t border-slate-100/80 sm:border-0 sm:pt-0">
                <FooterAppDownload />
              </div>
            </div>
          </nav>

          {/* Payment Methods and Social Networks Row */}
          <FooterPaymentAndSocial />

          {/* Bottom Legal, Privacy, and Cookie Policy Bar */}
          <FooterLegal
            onOpenCookiePreferences={() => setCookieModalOpen(true)}
          />
        </div>
      </footer>

      {/* Cookie Preferences Interactive Modal */}
      <CookiePreferencesModal
        isOpen={cookieModalOpen}
        onClose={() => setCookieModalOpen(false)}
      />
    </>
  );
};
