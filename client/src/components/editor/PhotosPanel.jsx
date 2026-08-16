import React from 'react';
import { Images } from 'lucide-react';

const PHOTOS = [
  {
    id: 'ph-sunrise',
    name: 'Sunrise Glow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a9e"/><stop offset="1" stop-color="#fad0c4"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg1)"/><circle cx="600" cy="330" r="120" fill="#fff7ea" opacity="0.85"/></svg>`,
  },
  {
    id: 'ph-ocean',
    name: 'Ocean Blue',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4facfe"/><stop offset="1" stop-color="#00f2fe"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg2)"/></svg>`,
  },
  {
    id: 'ph-forest',
    name: 'Forest',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#134e4a"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg3)"/></svg>`,
  },
  {
    id: 'ph-midnight',
    name: 'Midnight',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#141e30"/><stop offset="1" stop-color="#243b55"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg4)"/><circle cx="640" cy="90" r="34" fill="#fff" opacity="0.9"/><circle cx="130" cy="60" r="18" fill="#fff" opacity="0.6"/><circle cx="420" cy="120" r="12" fill="#fff" opacity="0.5"/></svg>`,
  },
  {
    id: 'ph-gold',
    name: 'Gold Luxe',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfbf6"/><stop offset="1" stop-color="#e8cf9c"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg5)"/><rect x="30" y="30" width="740" height="340" rx="14" fill="none" stroke="#c9a64e" stroke-width="3" opacity="0.7"/></svg>`,
  },
  {
    id: 'ph-marble',
    name: 'Soft Marble',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8f8f8"/><stop offset="1" stop-color="#e2e2e2"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg6)"/><path d="M-50 260 C150 180 250 320 450 240 S700 160 850 230" fill="none" stroke="#cfcfcf" stroke-width="10" opacity="0.5"/><path d="M-50 310 C150 260 300 360 500 300 S720 240 850 300" fill="none" stroke="#dcdcdc" stroke-width="6" opacity="0.5"/></svg>`,
  },
  {
    id: 'ph-confetti',
    name: 'Confetti',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg7" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3e0"/><stop offset="1" stop-color="#ffe0b2"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg7)"/><rect x="80" y="70" width="18" height="18" rx="4" fill="#ef4444" transform="rotate(15 89 79)"/><rect x="210" y="130" width="16" height="16" rx="4" fill="#3b82f6" transform="rotate(-20 218 138)"/><rect x="360" y="60" width="18" height="18" rx="4" fill="#22c55e" transform="rotate(30 369 69)"/><rect x="520" y="150" width="16" height="16" rx="4" fill="#eab308" transform="rotate(-15 528 158)"/><rect x="660" y="80" width="18" height="18" rx="4" fill="#ec4899" transform="rotate(25 669 89)"/><rect x="140" y="240" width="14" height="14" rx="3" fill="#8b5cf6" transform="rotate(40 147 247)"/><rect x="450" y="260" width="16" height="16" rx="4" fill="#f97316" transform="rotate(-30 458 268)"/><rect x="610" y="220" width="14" height="14" rx="3" fill="#06b6d4" transform="rotate(20 617 227)"/></svg>`,
  },
  {
    id: 'ph-geometric',
    name: 'Geometric',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><polygon points="0,400 400,0 800,400" fill="#1e3a5f"/><polygon points="0,400 400,0 200,400" fill="#2d6a4f"/><polygon points="400,0 800,400 600,400" fill="#7f5539"/><polygon points="200,400 400,0 600,400" fill="#e76f51"/></svg>`,
  },
  {
    id: 'ph-stripes',
    name: 'Minimal Stripes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="phg8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfbf6"/><stop offset="1" stop-color="#f3ece1"/></linearGradient></defs><rect width="800" height="400" fill="url(#phg8)"/><g stroke="#c9a64e" stroke-width="6" opacity="0.5"><line x1="0" y1="80" x2="800" y2="80"/><line x1="0" y1="200" x2="800" y2="200"/><line x1="0" y1="320" x2="800" y2="320"/></g></svg>`,
  },
];

export default function PhotosPanel({ onPhotoAdd }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Tap a background to place it on your design. You can drag, scale or remove it afterwards.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PHOTOS.map((photo) => (
          <button
            key={photo.id}
            onClick={() => onPhotoAdd(photo)}
            className="group border border-gray-100 rounded-lg overflow-hidden hover:border-brand-300 hover:shadow-md transition-all text-left"
            title={photo.name}
          >
            <div className="aspect-[2/1] bg-gray-50 relative overflow-hidden">
              <img
                src={'data:image/svg+xml;utf8,' + encodeURIComponent(photo.svg)}
                alt={photo.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Images className="w-5 h-5 text-white opacity-0 group-hover:opacity-90 transition-opacity" />
              </div>
            </div>
            <p className="p-2 text-xs font-medium text-gray-700 truncate">{photo.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}