import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-sm text-gray-400">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#E63946] text-white shadow-md'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
