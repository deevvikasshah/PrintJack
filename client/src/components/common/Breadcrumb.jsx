import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 overflow-x-auto scrollbar-hide">
      <Link to="/" className="flex items-center gap-1 text-gray-400 hover:text-[#E63946] transition-colors flex-shrink-0">
        <Home size={14} />
        <span>Home</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
          {item.to ? (
            <Link to={item.to} className="text-gray-500 hover:text-[#E63946] transition-colors whitespace-nowrap flex-shrink-0">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1D3557] font-medium whitespace-nowrap flex-shrink-0">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
