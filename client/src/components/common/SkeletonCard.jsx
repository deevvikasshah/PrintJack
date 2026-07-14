import React from 'react';

export default function SkeletonCard({ lines = 3, imageHeight = 'h-48', className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse ${className}`}>
      <div className={`${imageHeight} bg-gray-200`} />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-full" />
        ))}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-2.5 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
