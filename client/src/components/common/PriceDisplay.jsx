import React from 'react';
import { formatPrice } from '../../utils/formatters';

export default function PriceDisplay({ price, originalPrice, size = 'md', className = '' }) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const sizes = {
    sm: { price: 'text-lg', original: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { price: 'text-2xl', original: 'text-sm', badge: 'text-xs px-2 py-0.5' },
    lg: { price: 'text-3xl', original: 'text-base', badge: 'text-sm px-2.5 py-1' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={`${s.price} font-bold text-gray-900`}>{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className={`${s.original} text-gray-400 line-through`}>{formatPrice(originalPrice)}</span>
          <span className={`${s.badge} bg-red-50 text-[#E63946] font-semibold rounded-full`}>
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
