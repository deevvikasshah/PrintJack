import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function QuantitySelector({ quantity, onChange, min = 1, max = 999, disabled = false, size = 'md' }) {
  const sizes = {
    sm: { button: 'w-7 h-7', text: 'text-sm', icon: 14 },
    md: { button: 'w-9 h-9', text: 'text-base', icon: 16 },
    lg: { button: 'w-11 h-11', text: 'text-lg', icon: 18 },
  };

  const s = sizes[size];
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  return (
    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => !isMin && !disabled && onChange(quantity - 1)}
        disabled={isMin || disabled}
        className={`${s.button} flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
      >
        <Minus size={s.icon} />
      </button>
      <span className={`${s.text} font-semibold text-[#1D3557] min-w-[40px] text-center select-none`}>
        {quantity}
      </span>
      <button
        onClick={() => !isMax && !disabled && onChange(quantity + 1)}
        disabled={isMax || disabled}
        className={`${s.button} flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
      >
        <Plus size={s.icon} />
      </button>
    </div>
  );
}
