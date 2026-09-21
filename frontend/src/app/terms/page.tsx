import React from 'react';
import Link from 'next/link';
import { FileCheck, Cookie, AlertCircle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Cravery',
  description: 'Review the terms governing the use of Cravery food ordering, courier fulfillment, and services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#FF5A1F] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Cravery Home
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF5A1F] text-xs font-bold border border-orange-200">
          <FileCheck className="w-3.5 h-3.5" /> Platform Terms
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Cravery Terms of Service
        </h1>
        <p className="text-xs text-slate-500">
          Effective Date: January 2026 • Governs usage across web and mobile platforms.
        </p>
      </div>

      {/* Content */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or ordering through Cravery, you agree to these Terms of Service. Cravery connects customers with local independent restaurant partners and delivery couriers.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">2. Food Ordering & Pricing</h2>
          <p>
            Prices are established by individual merchant partners and include applicable goods or service taxes where noted. Cravery strives to ensure accurate menu prices and inventory availability.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">3. Payment & Delivery</h2>
          <p>
            Customers may pay using supported methods including Cash on Delivery (COD) or approved online card checkout. When selecting COD, customers are required to have exact or reasonable cash ready upon courier arrival at the destination address.
          </p>
        </section>

        <section id="cookies" className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cookie className="w-4 h-4 text-[#FF5A1F]" /> 4. Cookie & Local Storage Policy
          </h2>
          <p>
            Cravery uses cookies and browser local storage to maintain customer login sessions, retain active cart contents between page visits, and remember saved address selections. You can adjust optional functional and performance cookies anytime via the <strong>Cookie Preferences</strong> link in the footer.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> 5. Account Responsibility
          </h2>
          <p>
            Users are responsible for maintaining the confidentiality of their account credentials. Cravery reserves the right to suspend accounts with suspicious cancellation patterns or abusive behavior toward delivery couriers or restaurant staff.
          </p>
        </section>
      </div>
    </div>
  );
}
