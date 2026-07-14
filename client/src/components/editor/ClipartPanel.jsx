import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';

const CLIPART_DATA = {
  Business: [
    { id: 'b1', name: 'Briefcase', path: 'M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z' },
    { id: 'b2', name: 'Chart', path: 'M3 13h2v8H3v-8zm4-4h2v12H7V9zm4-6h2v18h-2V3zm4 8h2v10h-2V11zm4-3h2v13h-2V8z' },
    { id: 'b3', name: 'Building', path: 'M4 21V3h6v18H4zm8-18h8v18h-8V3zM6 5v2h2V5H6zm0 4v2h2V9H6zm0 4v2h2v-2H6zm4-8v2h2V5h-2zm0 4v2h2V9h-2zm0 4v2h2v-2h-2z' },
    { id: 'b4', name: 'Dollar', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95.49-7.4-2.41-7.93-6.36-.08-.46.3-.86.76-.78.41.07.74.36.88.75.45 2.84 2.92 4.95 5.81 5.08.41.02.74.36.72.78-.02.43-.37.75-.78.72l-.66.59zm3.87-5.3c-.25 1.83-1.64 3.32-3.48 3.63a.74.74 0 01-.86-.6.76.76 0 01.61-.87c1.26-.22 2.17-1.33 2.34-2.61h-1.7a.75.75 0 010-1.5h2.5a.75.75 0 01.75.75c.01.5-.05.99-.16 1.5zM9.25 11h3.5a.75.75 0 010 1.5h-1.5v1.5h1.5a.75.75 0 010 1.5h-2.5a.75.75 0 010-1.5h1.5v-1.5h-1.5a.75.75 0 010-1.5z' },
    { id: 'b5', name: 'Handshake', path: 'M12.22 19.85c-.18.18-.5.18-.67 0l-4.63-4.63a.5.5 0 010-.71l.35-.35a.5.5 0 01.71 0l3.95 3.95 6.67-7.78a.5.5 0 01.76.03l.35.41a.5.5 0 01-.03.66l-6.46 8.42zM2 12l3-3 3 3-3 3-3-3zm7-7l3-3 3 3-3 3-3-3z' },
  ],
  Food: [
    { id: 'f1', name: 'Coffee Cup', path: 'M2 21h18v-2H2v2zM20 8h-2V6c0-1.1-.9-2-2-2H8C6.9 4 6 4.9 6 6v2H4c-1.1 0-2 .9-2 2v3c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3v-3c0-1.1-.9-2-2-2zM8 6h8v2H8V6z' },
    { id: 'f2', name: 'Pizza', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-1-1 4-4-4-4 1-1 5 5-5 5z' },
    { id: 'f3', name: 'Apple', path: 'M17.5 8c-1 0-1.87.47-2.42 1.17C14.53 8.47 13.67 8 12.67 8c-1.12 0-2.12.52-2.67 1.33C9.45 8.52 8.45 8 7.33 8 5.48 8 4 9.48 4 11.33c0 3.25 3.13 5.92 7.17 8.42.42.27.87.5 1.33.71.47-.21.92-.44 1.33-.71 4.04-2.5 7.17-5.17 7.17-8.42C20 9.48 18.52 8 17.5 8z' },
    { id: 'f4', name: 'Burger', path: 'M3 14h2v1c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-1h2c.55 0 1 .45 1 1v2c0 2.76-2.24 5-5 5H7c-2.76 0-5-2.24-5-5v-2c0-.55.45-1 1-1zm3 4v-2h12v2c0 1.66-1.34 3-3 3H9c-1.66 0-3-1.34-3-3zM2 11c0-.55.45-1 1-1h20c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1v-1z' },
    { id: 'f5', name: 'Cake', path: 'M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12c.01-1.66-1.33-3-2.99-3z' },
    { id: 'f6', name: 'Ice Cream', path: 'M12 2c-4.97 0-9 4.03-9 9v1h18v-1c0-4.97-4.03-9-9-9zm-3 9c-.83 0-1.5-.67-1.5-1.5S8.17 8 9 8s1.5.67 1.5 1.5S9.83 11 9 11zm3 0c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11zm3 0c-.83 0-1.5-.67-1.5-1.5S14.17 8 15 8s1.5.67 1.5 1.5S15.83 11 15 11zM5 15v6c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-6H5z' },
  ],
  Nature: [
    { id: 'n1', name: 'Tree', path: 'M12 2L5 12h3v8h8v-8h3L12 2zm0 2.84L16 10h-1v7H9v-7H8l4-5.16z' },
    { id: 'n2', name: 'Leaf', path: 'M17.73 2.27c-3.03 0-5.73 1.77-7.13 4.35C9.47 4.35 6.51 2.27 3.48 2.27 1.46 2.27 0 3.73 0 5.75c0 7.44 10.63 14.73 11.58 15.36.36.24.78.24 1.14 0C13.67 20.48 22 13.19 22 5.75 22 3.73 20.54 2.27 18.52 2.27h-.79z' },
    { id: 'n3', name: 'Sun', path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z' },
    { id: 'n4', name: 'Cloud', path: 'M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z' },
    { id: 'n5', name: 'Flower', path: 'M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z' },
  ],
  Icons: [
    { id: 'i1', name: 'Heart', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
    { id: 'i2', name: 'Star', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { id: 'i3', name: 'Home', path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
    { id: 'i4', name: 'Settings', path: 'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.61 3.61 0 0112 15.6z' },
    { id: 'i5', name: 'Phone', path: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' },
    { id: 'i6', name: 'Mail', path: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' },
    { id: 'i7', name: 'Check Circle', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
  ],
  Sports: [
    { id: 's1', name: 'Trophy', path: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z' },
    { id: 's2', name: 'Ball', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM5.61 16.78A7.95 7.95 0 014 12c0-1.33.32-2.59.89-3.71L9 14.09c-.67.89-1.07 1.98-1.07 3.15 0 .55.11 1.08.28 1.57l-2.54-2.03zm6.39 4.22c-3.31 0-6.18-1.98-7.43-4.79l3.14-.46c.72 1.82 2.45 3.15 4.48 3.45l-.19 1.8zM12 4c1.85 0 3.55.63 4.91 1.69L13 10.43c-.32-.11-.67-.18-1.02-.21-.12-2.43-1.31-4.52-3.07-5.83A7.95 7.95 0 0112 4zm3.09 1.69A7.96 7.96 0 0120 12c0 1.84-.69 3.52-1.84 4.8l-2.71-1.08c.67-1.01 1.07-2.21 1.07-3.52 0-.68-.13-1.33-.36-1.94L15.09 5.69z' },
    { id: 's3', name: 'Medal', path: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z' },
  ],
  Education: [
    { id: 'e1', name: 'Book', path: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z' },
    { id: 'e2', name: 'Graduation Cap', path: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z' },
    { id: 'e3', name: 'Pencil', path: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' },
  ],
  Shapes: [
    { id: 'sh1', name: 'Circle', type: 'circle' },
    { id: 'sh2', name: 'Square', type: 'rect' },
    { id: 'sh3', name: 'Triangle', type: 'triangle' },
    { id: 'sh4', name: 'Diamond', type: 'diamond' },
    { id: 'sh5', name: 'Star 5', type: 'star5' },
    { id: 'sh6', name: 'Star 6', type: 'star6' },
    { id: 'sh7', name: 'Hexagon', type: 'hexagon' },
    { id: 'sh8', name: 'Octagon', type: 'octagon' },
  ],
};

const CATEGORIES = Object.keys(CLIPART_DATA);

export default function ClipartPanel({ onClipartAdd }) {
  const [activeCategory, setActiveCategory] = useState('Icons');
  const [search, setSearch] = useState('');

  const filteredClipart = useMemo(() => {
    const items = CLIPART_DATA[activeCategory] || [];
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(s));
  }, [activeCategory, search]);

  const handleAdd = (item) => {
    if (item.type) {
      onClipartAdd({ type: 'shape', shapeType: item.type, name: item.name });
    } else {
      onClipartAdd({
        type: 'svg',
        path: item.path,
        name: item.name,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clipart..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSearch('');
            }}
            className={clsx(
              'px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors flex-shrink-0',
              activeCategory === cat
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filteredClipart.map((item) => (
          <button
            key={item.id}
            onClick={() => handleAdd(item)}
            className="aspect-square p-2 bg-gray-50 border border-gray-100 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-all group flex items-center justify-center"
            title={item.name}
          >
            {item.path ? (
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-gray-600 group-hover:text-brand-600 transition-colors"
                fill="currentColor"
              >
                <path d={item.path} />
              </svg>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500 group-hover:text-brand-600">
                {item.name}
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredClipart.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">No clipart found</p>
      )}
    </div>
  );
}
