import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | '...')[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none text-[10px] font-black"
      >
        <ChevronLeft size={14} />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-[10px] font-black text-slate-300">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${
              p === page
                ? 'bg-black text-white'
                : 'border border-slate-200 text-slate-500 hover:bg-black hover:text-white hover:border-black'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none text-[10px] font-black"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};
