import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialCard({
  quote,
  name,
  company,
  role,
  rating = 5,
  avatar,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}>
      <Quote size={24} className="text-[#E63946]/20 mb-3" />
      <p className="text-sm text-gray-600 leading-relaxed">{quote}</p>
      <div className="flex mt-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-100">
        {avatar ? (
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </span>
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-gray-900">{name}</h4>
          <p className="text-xs text-gray-400">
            {role && `${role}`}{role && company && ', '}{company || ''}
          </p>
        </div>
      </div>
    </div>
  );
}
