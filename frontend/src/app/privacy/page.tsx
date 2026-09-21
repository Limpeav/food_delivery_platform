import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Cravery',
  description: 'Understand how Cravery collects, uses, and safeguards customer and partner information.',
};

export default function PrivacyPolicyPage() {
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Legal & Privacy
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Cravery Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: January 2026 • Applies to customers, restaurant merchants, and courier partners.
        </p>
      </div>

      {/* Content Body */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#FF5A1F]" /> 1. Information We Collect
          </h2>
          <p>
            When you use Cravery to discover food or place orders, we collect essential personal information required to fulfill delivery requests safely:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Account Profile:</strong> Your name, email address, phone number, and password credentials.</li>
            <li><strong>Delivery Addresses:</strong> Street coordinates, building details, and delivery instructions to route couriers accurately.</li>
            <li><strong>Order Records:</strong> Items ordered, merchant details, total amounts, and payment selection (Cash on Delivery or Online Payment).</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FF5A1F]" /> 2. How We Use Your Data
          </h2>
          <p>
            We strictly use collected information to provide reliable food delivery operations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Dispatching customer delivery coordinates to assigned courier partners.</li>
            <li>Communicating real-time cooking and delivery updates via web notifications.</li>
            <li>Preventing fraudulent orders and securing customer accounts.</li>
            <li>We do not sell personal identification or browsing behavior to third-party ad brokers.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FF5A1F]" /> 3. Data Protection & Rights
          </h2>
          <p>
            Customer data is stored securely and access is restricted only to authorized backend services. Customers can review and update their delivery addresses or delete saved profile destinations anytime through the <Link href="/account" className="text-[#FF5A1F] font-bold hover:underline">Customer Account</Link> dashboard.
          </p>
          <p>
            For privacy inquiries or account closure requests, contact our privacy officer at <a href="mailto:privacy@cravery.com" className="text-[#FF5A1F] font-bold hover:underline">privacy@cravery.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
