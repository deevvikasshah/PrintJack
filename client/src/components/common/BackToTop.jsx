import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-[#1D3557] text-white rounded-full shadow-xl hover:bg-[#1D3557]/90 transition-all flex items-center justify-center hover:scale-110"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
