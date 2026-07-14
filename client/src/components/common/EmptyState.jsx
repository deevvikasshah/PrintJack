import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Package,
  title = 'Nothing here yet',
  description = 'Looks like there\'s nothing to show right now.',
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-[#1D3557] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && (
        onAction ? (
          <button
            onClick={onAction}
            className="px-6 py-2.5 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
          >
            {actionLabel}
          </button>
        ) : actionTo ? (
          <Link
            to={actionTo}
            className="px-6 py-2.5 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
          >
            {actionLabel}
          </Link>
        ) : null
      )}
    </div>
  );
}
