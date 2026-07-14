import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function RatingDisplay({ rating = 0, count = 0, size = 16 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">{rating?.toFixed(1)}</span>
      {count > 0 && <span className="text-sm text-gray-400">({count})</span>}
    </div>
  );
}

export function RatingInput({ value = 0, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={`${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            } transition-colors cursor-pointer`}
          />
        </button>
      ))}
    </div>
  );
}
