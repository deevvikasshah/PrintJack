import React from 'react';
import { clsx } from 'clsx';

export default function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  className = '',
  tooltip,
  badge,
}) {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const variants = {
    default: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    brand: 'text-brand-500 hover:bg-brand-50 hover:text-brand-600',
    danger: 'text-red-500 hover:bg-red-50 hover:text-red-600',
    success: 'text-green-600 hover:bg-green-50 hover:text-green-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={clsx(
        'relative inline-flex items-center justify-center rounded-lg transition-all duration-150',
        sizes[size],
        active
          ? 'bg-brand-100 text-brand-600 shadow-sm'
          : variants[variant],
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {Icon && <Icon className={clsx(size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />}
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
