import React from 'react';
import { Truck, ShieldCheck, MapPin, Headphones } from 'lucide-react';

const items = [
  { icon: Truck, text: 'Free Shipping on ₹999+' },
  { icon: ShieldCheck, text: '100% Quality Guarantee' },
  { icon: MapPin, text: 'Pan India Delivery' },
  { icon: Headphones, text: '24/7 Support' },
];

export default function TrustBar({ className = '' }) {
  return (
    <div className={`bg-white border-b border-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center flex-shrink-0">
                <item.icon size={20} className="text-[#E63946]" />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
