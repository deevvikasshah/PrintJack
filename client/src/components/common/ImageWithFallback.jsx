import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  fallbackClassName = '',
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${fallbackClassName || className}`}
        {...props}
      >
        <div className="flex flex-col items-center gap-2">
          <ImageIcon size={32} />
          {alt && <span className="text-xs text-gray-400 text-center px-2 line-clamp-2">{alt}</span>}
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
          <ImageIcon size={24} className="text-gray-300" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => { setHasError(true); setIsLoading(false); }}
        {...props}
      />
    </>
  );
}
