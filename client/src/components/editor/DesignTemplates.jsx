import React, { useState, useEffect } from 'react';
import { Search, Layout, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../utils/api';

const BUILTIN_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Bold Statement',
    category: 'Text Heavy',
    thumbnail: 'TS',
    json: {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 50,
          top: 50,
          width: 300,
          height: 200,
          fill: '#E63946',
          rx: 10,
          ry: 10,
        },
        {
          type: 'i-text',
          left: 80,
          top: 110,
          text: 'YOUR\nTEXT HERE',
          fontSize: 48,
          fontFamily: 'Bebas Neue',
          fill: '#FFFFFF',
          fontWeight: 'bold',
          lineHeight: 1.1,
        },
      ],
    },
  },
  {
    id: 'tpl-2',
    name: 'Minimal Circle',
    category: 'Minimal',
    thumbnail: 'MC',
    json: {
      version: '5.3.0',
      objects: [
        {
          type: 'circle',
          left: 100,
          top: 60,
          radius: 100,
          fill: '#1D3557',
        },
        {
          type: 'i-text',
          left: 65,
          top: 140,
          text: 'BRAND',
          fontSize: 32,
          fontFamily: 'Montserrat',
          fill: '#FFFFFF',
          fontWeight: 'bold',
          textAlign: 'center',
        },
      ],
    },
  },
  {
    id: 'tpl-3',
    name: 'Vintage Badge',
    category: 'Vintage',
    thumbnail: 'VB',
    json: {
      version: '5.3.0',
      objects: [
        {
          type: 'circle',
          left: 75,
          top: 35,
          radius: 130,
          fill: 'transparent',
          stroke: '#1D3557',
          strokeWidth: 4,
        },
        {
          type: 'circle',
          left: 90,
          top: 50,
          radius: 115,
          fill: 'transparent',
          stroke: '#1D3557',
          strokeWidth: 2,
        },
        {
          type: 'i-text',
          left: 100,
          top: 130,
          text: 'PREMIUM',
          fontSize: 36,
          fontFamily: 'Oswald',
          fill: '#1D3557',
          fontWeight: 'bold',
          textAlign: 'center',
        },
        {
          type: 'i-text',
          left: 110,
          top: 175,
          text: 'QUALITY',
          fontSize: 20,
          fontFamily: 'Oswald',
          fill: '#E63946',
          textAlign: 'center',
        },
      ],
    },
  },
  {
    id: 'tpl-4',
    name: 'Modern Split',
    category: 'Modern',
    thumbnail: 'MS',
    json: {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 200,
          height: 300,
          fill: '#1D3557',
        },
        {
          type: 'rect',
          left: 200,
          top: 0,
          width: 200,
          height: 300,
          fill: '#E63946',
        },
        {
          type: 'i-text',
          left: 40,
          top: 120,
          text: 'YOUR\nDESIGN',
          fontSize: 40,
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          fontWeight: 'bold',
          lineHeight: 1.2,
        },
      ],
    },
  },
  {
    id: 'tpl-5',
    name: 'Star Highlight',
    category: 'Playful',
    thumbnail: 'SH',
    json: {
      version: '5.3.0',
      objects: [
        {
          type: 'circle',
          left: 120,
          top: 50,
          radius: 80,
          fill: '#FFD700',
        },
        {
          type: 'i-text',
          left: 80,
          top: 120,
          text: 'NEW!',
          fontSize: 48,
          fontFamily: 'Permanent Marker',
          fill: '#E63946',
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          left: 100,
          top: 180,
          text: 'Limited Edition',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#1D3557',
        },
      ],
    },
  },
  {
    id: 'tpl-6',
    name: 'Striped Sport',
    category: 'Sporty',
    thumbnail: 'SS',
    json: {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 400,
          height: 30,
          fill: '#E63946',
        },
        {
          type: 'rect',
          left: 0,
          top: 270,
          width: 400,
          height: 30,
          fill: '#E63946',
        },
        {
          type: 'i-text',
          left: 80,
          top: 120,
          text: 'TEAM\nSPORTS',
          fontSize: 52,
          fontFamily: 'Anton',
          fill: '#1D3557',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 1.1,
        },
      ],
    },
  },
];

const CATEGORIES = ['All', ...new Set(BUILTIN_TEMPLATES.map((t) => t.category))];

export default function DesignTemplates({ onLoadTemplate, productCategory }) {
  const [templates, setTemplates] = useState(BUILTIN_TEMPLATES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const catValue = typeof productCategory === 'string'
          ? productCategory
          : productCategory?.slug || productCategory?.name || productCategory?._id || '';
        const params = catValue ? `?category=${encodeURIComponent(catValue)}` : '';
        const { data } = await api.get(`/templates${params}`);
        if (data.templates?.length) {
          setTemplates([...BUILTIN_TEMPLATES, ...data.templates]);
        }
      } catch {
        // Use built-in templates only
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [productCategory]);

  const filtered = templates.filter((t) => {
    const matchCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
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

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((template) => (
          <button
            key={template.id}
            onClick={() => onLoadTemplate(template.json)}
            className="group border border-gray-100 rounded-lg overflow-hidden hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative overflow-hidden">
              {template.thumbnailImage ? (
                <img
                  src={template.thumbnailImage}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-700 to-brand-500">
                  <span className="text-white text-lg font-bold opacity-80">{template.thumbnail}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/10 transition-colors flex items-center justify-center">
                <Layout className="w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-700 truncate">{template.name}</p>
              <p className="text-[10px] text-gray-400">{template.category}</p>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <p className="text-xs text-gray-400 text-center py-4">No templates found</p>
      )}
    </div>
  );
}
