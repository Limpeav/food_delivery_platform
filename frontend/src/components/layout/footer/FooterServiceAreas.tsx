'use client';

import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { footerServiceAreas, serviceAreaFooterNote } from '@/config/footer';

export const FooterServiceAreas: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full sm:w-auto flex items-center justify-between text-left group cursor-pointer sm:cursor-default"
        aria-expanded={isMobileOpen}
      >
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 group-hover:text-[#FF5A1F] sm:group-hover:text-slate-900 transition-colors">
          <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <span>Available In</span>
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 sm:hidden transition-transform duration-200 ${
            isMobileOpen ? 'rotate-180 text-[#FF5A1F]' : ''
          }`}
        />
      </button>

      {/* Locations */}
      <div
        className={`space-y-2 text-xs text-slate-500 font-medium ${
          isMobileOpen ? 'block' : 'hidden sm:block'
        }`}
      >
        <ul className="space-y-1.5">
          {footerServiceAreas.map((area, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-700">{area.city}</span>
              {area.highlight && (
                <span className="text-[11px] text-slate-400 truncate">
                  • {area.highlight}
                </span>
              )}
            </li>
          ))}
        </ul>

        {serviceAreaFooterNote && (
          <p className="pt-2 text-[11px] text-slate-400 italic">
            {serviceAreaFooterNote}
          </p>
        )}
      </div>
    </div>
  );
};
