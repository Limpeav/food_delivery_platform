'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/stores/languageStore';

export interface PaginationProps {
  currentPage: number; // 1-indexed for display
  totalPages: number;
  totalElements: number;
  pageSize?: number;
  onPageChange: (page: number) => void; // returns 1-indexed page
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize = 20,
  onPageChange,
  className = '',
}) => {
  const { t } = useTranslation();

  // Hide pagination if there is only 1 page or none
  if (totalPages <= 1) {
    return null;
  }

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalElements);
  const endItem = Math.min(currentPage * pageSize, totalElements);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const delta = 1; // Number of pages around current
    const pages: (number | string)[] = [];

    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-100 dark:border-slate-800 ${className}`}
    >
      {/* Informative text */}
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {t.pagination.showing} <span className="font-bold text-slate-800 dark:text-slate-200">{startItem}</span> {t.pagination.to}{' '}
        <span className="font-bold text-slate-800 dark:text-slate-200">{endItem}</span> {t.pagination.of}{' '}
        <span className="font-bold text-slate-900 dark:text-white">{totalElements}</span> {t.pagination.items}
      </p>

      {/* Pagination controls */}
      <nav
        aria-label="Pagination"
        className="inline-flex items-center gap-1.5 rounded-2xl bg-white dark:bg-slate-900 p-1 border border-slate-200/90 dark:border-slate-800 shadow-xs"
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed ${
            currentPage <= 1
              ? 'text-slate-300 dark:text-slate-600'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500 select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`flex h-8 min-w-8 px-2 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF5A1F] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed ${
            currentPage >= totalPages
              ? 'text-slate-300 dark:text-slate-600'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};
