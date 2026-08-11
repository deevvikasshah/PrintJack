import React from 'react';
import { Clock } from 'lucide-react';

export default function DeliveryNote({ category, className = '' }) {
  const cat = category && typeof category === 'object' ? category.name : category;

  return (
    <div className={`flex flex-wrap items-center justify-center gap-1.5 text-sm text-ink/70 ${className}`}>
      <Clock size={15} className="text-pj-green flex-shrink-0" />
      <span>
        {cat ? <span className="font-semibold text-ink">{cat} · </span> : null}
        All items delivered in less than 7 days
      </span>
    </div>
  );
}
