import React, { useState } from 'react';
import { ZoomIn } from 'lucide-react';

export default function ImageZoom({ src, alt, className = '' }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-crosshair group ${className}`}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-transform duration-300 ${
          isZoomed ? 'scale-150' : 'scale-100'
        }`}
        style={isZoomed ? { transformOrigin: `${position.x}% ${position.y}%` } : {}}
      />
      {!isZoomed && (
        <div className="absolute top-3 right-3 p-2 bg-black/30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={16} />
        </div>
      )}
    </div>
  );
}
