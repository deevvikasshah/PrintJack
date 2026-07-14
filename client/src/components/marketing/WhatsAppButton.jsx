import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '919876543210';
const DEFAULT_MESSAGE = 'Hi PrintJack! I need help with ';

export default function WhatsAppButton({ phoneNumber = WHATSAPP_NUMBER, message = DEFAULT_MESSAGE, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSend = (text) => {
    const encoded = encodeURIComponent(text || message);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {isOpen && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1D3557] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1D3557]">PrintJack Support</p>
                <p className="text-[10px] text-emerald-500">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-sm text-gray-600">Hi there! 👋 How can we help you today?</p>
          </div>
          <button
            onClick={() => handleSend('Hi PrintJack! I need help with my order.')}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Start Chat on WhatsApp
          </button>
        </div>
      )}

      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleSend(message))}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative group"
      >
        <span className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20" />
        <span className={`absolute -top-10 right-0 bg-[#1D3557] text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          Chat with us!
        </span>
        <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer">
          <MessageCircle size={26} className="text-white" fill="white" />
        </div>
      </button>
    </div>
  );
}
