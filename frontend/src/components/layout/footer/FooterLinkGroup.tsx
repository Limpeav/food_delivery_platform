'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { FooterLink } from '@/types/footer';

interface FooterLinkGroupProps {
  title: string;
  links: FooterLink[];
  id?: string;
  defaultExpandedMobile?: boolean;
}

export const FooterLinkGroup: React.FC<FooterLinkGroupProps> = ({
  title,
  links,
  id,
  defaultExpandedMobile = false,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(defaultExpandedMobile);

  return (
    <div className="space-y-3" id={id}>
      {/* Header: clickable accordion toggle on mobile, static heading on tablet/desktop */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full sm:w-auto flex items-center justify-between text-left group cursor-pointer sm:cursor-default"
        aria-expanded={isMobileOpen}
      >
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 group-hover:text-[#FF5A1F] sm:group-hover:text-slate-900 transition-colors">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 sm:hidden transition-transform duration-200 ${
            isMobileOpen ? 'rotate-180 text-[#FF5A1F]' : ''
          }`}
        />
      </button>

      {/* Links List */}
      <ul
        className={`space-y-2 text-xs text-slate-600 font-medium ${
          isMobileOpen ? 'block' : 'hidden sm:block'
        }`}
      >
        {links.map((link, idx) => {
          const isExternal = link.isExternal || link.href.startsWith('http');
          const isAnchor = link.href.includes('#');

          return (
            <li key={idx}>
              {isExternal ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={link.id}
                  className="hover:text-[#FF5A1F] transition-colors inline-flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:text-[#FF5A1F]"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#FFF1EB] text-[#FF5A1F] text-[9px] font-black">
                      {link.badge}
                    </span>
                  )}
                </a>
              ) : isAnchor ? (
                <Link
                  href={link.href}
                  id={link.id}
                  className="hover:text-[#FF5A1F] transition-colors inline-flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:text-[#FF5A1F]"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#FFF1EB] text-[#FF5A1F] text-[9px] font-black">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <Link
                  href={link.href}
                  id={link.id}
                  className="hover:text-[#FF5A1F] transition-colors inline-flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:text-[#FF5A1F]"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#FFF1EB] text-[#FF5A1F] text-[9px] font-black">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
