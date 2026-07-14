import React from 'react';

export default function Loading({ fullPage = true, size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-4 border-gray-200`} />
        <div className={`${sizes[size]} rounded-full border-4 border-[#E63946] border-t-transparent animate-spin absolute inset-0`} />
      </div>
      <div className="text-center">
        <span className="text-lg font-bold bg-gradient-to-r from-[#E63946] to-[#c62d38] bg-clip-text text-transparent">
          PrintJack
        </span>
        <p className="text-xs text-gray-400 mt-1">Loading...</p>
      </div>
    </div>
  );

  if (!fullPage) return spinner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      {spinner}
    </div>
  );
}
