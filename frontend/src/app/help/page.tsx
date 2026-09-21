'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Clock,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  Building2,
  Bike,
  Store,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'policies'>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How can I track my active food order?',
      a: 'Once your order is accepted by the restaurant, you can track its real-time preparation status and live courier GPS location directly under "My Orders" in your customer dashboard or the active order status page.',
      category: 'orders',
    },
    {
      q: 'What payment methods are supported on Cravery?',
      a: 'Cravery supports two primary payment options: Cash on Delivery (COD) allowing you to pay the courier upon package arrival, and Online Digital Card / QR Payment for instant checkout confirmation.',
      category: 'payments',
    },
    {
      q: 'How do refunds and order cancellations work?',
      a: 'Orders can be cancelled before the restaurant begins cooking. If an item is missing, damaged, or incorrect, please reach out to customer support within 24 hours of delivery with your order ID for immediate resolution or refund processing.',
      category: 'refunds',
    },
    {
      q: 'What are Cravery food safety guidelines?',
      a: 'All merchant partners must maintain local food hygiene licenses. Our delivery couriers use insulated thermal delivery bags with tamper-evident packaging seal requirements to ensure your meal arrives hot and secure.',
      category: 'food-safety',
    },
    {
      q: 'How do I sign up as a Restaurant Partner or Driver?',
      a: 'Merchants can register via our dedicated Restaurant Portal (/restaurant/register), while couriers can sign up through our Driver Partner Portal (/driver/register). Our operations team reviews all applications within 24-48 business hours.',
      category: 'partners',
    },
    {
      q: 'Do you offer corporate catering or office group orders?',
      a: 'Yes! Cravery provides corporate dining solutions for teams, conferences, and recurring office lunches. Contact our business partnerships team at business@cravery.com for custom volume arrangements.',
      category: 'business',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-br from-orange-500 to-[#FF5A1F] p-8 sm:p-12 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white tracking-wide">
            <HelpCircle className="w-3.5 h-3.5" /> Customer Care & Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-sm sm:text-base text-orange-100 font-medium leading-relaxed">
            Find quick answers about live delivery tracking, accepted payment options, partner registration, and order assistance.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'faq'
              ? 'border-[#FF5A1F] text-[#FF5A1F]'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Frequently Asked Questions
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'contact'
              ? 'border-[#FF5A1F] text-[#FF5A1F]'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Contact Support Channels
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'policies'
              ? 'border-[#FF5A1F] text-[#FF5A1F]'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Safety & Operational Guidelines
        </button>
      </div>

      {/* Tab 1: FAQs */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
              <Clock className="w-5 h-5 text-[#FF5A1F]" />
              <h3 className="text-sm font-bold text-slate-900">Live GPS Order Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track status updates from kitchen pickup to doorstep arrival.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Supported Payments</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose between Cash on Delivery (COD) or Online Card / QR checkout.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Refund Resolution</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast dispute resolution for missing items or cancelled orders.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Common Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/70 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 hover:text-[#FF5A1F] transition-colors cursor-pointer bg-slate-50/50"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-[#FF5A1F]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Support */}
      {activeTab === 'contact' && (
        <div id="contact" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-orange-50 text-[#FF5A1F]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Live Customer Assistance</h3>
                <p className="text-xs text-slate-500">Reach our live delivery dispatch desk</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Email Support</p>
                  <a
                    href="mailto:support@cravery.com"
                    className="text-[#FF5A1F] hover:underline"
                  >
                    support@cravery.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Hotline</p>
                  <span className="text-slate-600">+855 23 999 888 (7:00 AM – 11:30 PM)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Support Operations</p>
                  <span className="text-slate-600">Serving Phnom Penh, Siem Reap, Battambang & Sihanoukville</span>
                </div>
              </div>
            </div>
          </div>

          <div id="partner-support" className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Partner & Corporate Hub</h3>
                <p className="text-xs text-slate-500">Dedicated help for restaurant & courier partners</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800">Restaurant Onboarding</span>
                </div>
                <Link
                  href="/restaurant/register"
                  className="text-xs font-bold text-[#FF5A1F] hover:underline"
                >
                  Register Shop →
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800">Driver Partner Application</span>
                </div>
                <Link
                  href="/driver/register"
                  className="text-xs font-bold text-[#FF5A1F] hover:underline"
                >
                  Apply to Deliver →
                </Link>
              </div>

              <div id="business" className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">Corporate & Team Catering</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Direct inquiries to <span className="font-medium text-slate-700">corporate@cravery.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Policies & Guidelines */}
      {activeTab === 'policies' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div id="food-safety" className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Food Safety & Quality Standards
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cravery enforces strict hygiene protocols across all onboarded restaurants. Every kitchen must pass verification of health inspections. Couriers are instructed to transport orders inside sealed insulated thermal carriers.
            </p>
          </div>

          <div id="refunds" className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600" /> Refund & Cancellation Policy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an order is cancelled prior to restaurant acceptance, the customer incurs zero fee. If delivered food has missing items, severe spills, or incorrect items, contact support with photo verification within 24 hours for compensation or credit.
            </p>
          </div>

          <div id="accessibility" className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" /> Accessibility Commitment
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cravery is committed to ensuring our digital platform is accessible to all customers, including individuals with disabilities. We adhere to WCAG 2.1 Level AA recommendations for color contrast, keyboard navigation, and semantic ARIA labeling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
