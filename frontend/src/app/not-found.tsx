'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Home, Compass, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-lg w-full text-center space-y-8 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
        {/* Playful Illustration Badge */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-inner">
          <div className="text-4xl">🍜</div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#FF5A1F] text-white text-xs font-black flex items-center justify-center shadow-md">
            404
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Oops! This dish isn&apos;t on our menu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page you are looking for might have been moved, devoured, or never existed in the first place.
          </p>
        </div>

        {/* Quick Navigation Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
          <Link
            href="/restaurants"
            className="group p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-[#FF5A1F]">
              <Compass className="w-4 h-4 text-[#FF5A1F]" />
              <span>Browse Restaurants</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Find top meals delivered straight to you
            </p>
          </Link>

          <Link
            href="/orders"
            className="group p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-blue-600">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Track Orders</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Check live status of your food deliveries
            </p>
          </Link>
        </div>

        {/* Return Home Button */}
        <div className="pt-2">
          <Link href="/">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto rounded-2xl text-xs font-bold gap-2 shadow-md"
            >
              <Home className="w-4 h-4" /> Return to Homepage <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
