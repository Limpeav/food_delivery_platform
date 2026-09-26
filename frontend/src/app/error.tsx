'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled platform error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-[#E1251B] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Something went wrong
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            We encountered an unexpected issue while loading this page. Our technical team has been notified.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-400 bg-slate-50 py-1 px-2 rounded-lg inline-block">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-xl text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto rounded-xl text-xs gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
