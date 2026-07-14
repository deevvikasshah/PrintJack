import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in`}>
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && <h3 className="text-lg font-semibold text-[#1D3557]">{title}</h3>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
