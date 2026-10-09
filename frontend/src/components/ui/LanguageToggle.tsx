'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { Language } from '@/locales';

export interface LanguageToggleProps {
  className?: string;
  variant?: 'dropdown' | 'toggle' | 'pill';
  showLabel?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'dropdown',
  showLabel = true,
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  // Segmented Pill Variant (EN | ខ្មែរ)
  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${className}`}
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white dark:bg-slate-900 text-[#FF5A1F] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="text-sm leading-none">🇬🇧</span>
          <span>EN</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('km')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            language === 'km'
              ? 'bg-white dark:bg-slate-900 text-[#FF5A1F] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="text-sm leading-none">🇰🇭</span>
          <span>ខ្មែរ</span>
        </button>
      </div>
    );
  }

  // Quick One-click Toggle Variant
  if (variant === 'toggle') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        title={language === 'en' ? 'ប្តូរទៅភាសាខ្មែរ' : 'Switch to English'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-xs ${className}`}
      >
        <span className="text-sm leading-none">{language === 'en' ? '🇬🇧' : '🇰🇭'}</span>
        <span>{language === 'en' ? 'EN' : 'ខ្មែរ'}</span>
      </button>
    );
  }

  // Default Dropdown Variant
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Language / ជ្រើសរើសភាសា"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30"
      >
        <span className="text-sm leading-none">{language === 'en' ? '🇬🇧' : '🇰🇭'}</span>
        {showLabel && (
          <span className="hidden sm:inline font-semibold">
            {language === 'en' ? 'English' : 'ភាសាខ្មែរ'}
          </span>
        )}
        <span className="sm:hidden font-semibold">{language === 'en' ? 'EN' : 'ខ្មែរ'}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
            Language / ភាសា
          </div>

          {/* English Option */}
          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇬🇧</span>
              <span>English</span>
            </div>
            {language === 'en' && <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />}
          </button>

          {/* Khmer Option */}
          <button
            type="button"
            onClick={() => {
              setLanguage('km');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              language === 'km'
                ? 'bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇰🇭</span>
              <span>ភាសាខ្មែរ (Khmer)</span>
            </div>
            {language === 'km' && <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />}
          </button>
        </div>
      )}
    </div>
  );
};
