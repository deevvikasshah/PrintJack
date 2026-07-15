import React, { useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import ColorPicker from './ColorPicker';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Oswald', 'Playfair Display', 'Merriweather',
  'Nunito', 'Source Sans Pro', 'Ubuntu', 'PT Sans', 'Noto Sans',
  'Crimson Text', 'Dancing Script', 'Pacifico', 'Lobster', 'Bebas Neue',
  'Anton', 'Permanent Marker', 'Archivo Black', 'Righteous', 'Comfortaa',
  'Caveat', 'Quicksand', 'Rubik', 'Work Sans', 'DM Sans',
];

export default function TextToolbar({ activeObject, onObjectUpdate }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontSearch, setFontSearch] = useState('');

  if (!activeObject || !['i-text', 'textbox', 'text'].includes(activeObject.type)) {
    return null;
  }

  const fontFamily = activeObject.fontFamily || 'Inter';
  const fontSize = activeObject.fontSize || 24;
  const fill = activeObject.fill || '#000000';
  const fontWeight = activeObject.fontWeight;
  const fontStyle = activeObject.fontStyle;
  const underline = activeObject.underline;
  const linethrough = activeObject.linethrough;
  const textAlign = activeObject.textAlign || 'left';
  const lineHeight = activeObject.lineHeight || 1.4;
  const charSpacing = (activeObject.charSpacing || 0) / 100;
  const shadow = activeObject.shadow;

  const filteredFonts = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const handleFontChange = (font) => {
    onObjectUpdate({ fontFamily: font });
    setShowFontDropdown(false);
    setFontSearch('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-3">
        <div className="relative">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
            Font
          </label>
          <button
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
          >
            <span style={{ fontFamily }}>{fontFamily}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showFontDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden">
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder="Search fonts..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                {filteredFonts.map((font) => (
                  <button
                    key={font}
                    onClick={() => handleFontChange(font)}
                    className={clsx(
                      'w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors',
                      fontFamily === font && 'bg-brand-50 text-brand-600 font-semibold'
                    )}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
            Size
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={8}
              max={200}
              value={fontSize}
              onChange={(e) => onObjectUpdate({ fontSize: parseInt(e.target.value) })}
              className="flex-1 accent-brand-500"
            />
            <input
              type="number"
              min={8}
              max={200}
              value={fontSize}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 1 && v <= 200) onObjectUpdate({ fontSize: v });
              }}
              className="w-14 px-2 py-1 text-sm border border-gray-200 rounded-md text-center outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
          Style
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onObjectUpdate({ fontWeight: fontWeight === 'bold' ? 'normal' : 'bold' })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              fontWeight === 'bold' ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => onObjectUpdate({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              fontStyle === 'italic' ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => onObjectUpdate({ underline: !underline })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              underline ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() => onObjectUpdate({ linethrough: !linethrough })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              linethrough ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button
            onClick={() => onObjectUpdate({ textAlign: 'left' })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              textAlign === 'left' ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onObjectUpdate({ textAlign: 'center' })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              textAlign === 'center' ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => onObjectUpdate({ textAlign: 'right' })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              textAlign === 'right' ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onObjectUpdate({ textAlign: 'justify' })}
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              textAlign === 'justify' ? 'bg-brand-100 text-brand-600' : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
          Color
        </label>
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div
              className="w-5 h-5 rounded border border-gray-200 shadow-inner"
              style={{ backgroundColor: fill }}
            />
            <span className="text-sm text-gray-600 flex-1 text-left">{fill}</span>
          </button>
          {showColorPicker && (
            <div className="absolute z-50 top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-xl shadow-xl w-64">
              <ColorPicker
                color={fill}
                onChange={(c) => onObjectUpdate({ fill: c })}
              />
              <button
                onClick={() => setShowColorPicker(false)}
                className="mt-2 w-full py-1.5 text-xs font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Line Height
          </label>
          <span className="text-xs text-gray-400">{lineHeight.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={lineHeight}
          onChange={(e) => onObjectUpdate({ lineHeight: parseFloat(e.target.value) })}
          className="w-full accent-brand-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Letter Spacing
          </label>
          <span className="text-xs text-gray-400">{charSpacing.toFixed(0)}</span>
        </div>
        <input
          type="range"
          min={-200}
          max={800}
          step={10}
          value={activeObject.charSpacing || 0}
          onChange={(e) => onObjectUpdate({ charSpacing: parseInt(e.target.value) })}
          className="w-full accent-brand-500"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
          Shadow
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (shadow) {
                onObjectUpdate({ shadow: null });
              } else {
                onObjectUpdate({
                  shadow: {
                    color: 'rgba(0,0,0,0.3)',
                    blur: 4,
                    offsetX: 2,
                    offsetY: 2,
                  },
                });
              }
            }}
            className={clsx(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              shadow
                ? 'bg-brand-100 text-brand-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {shadow ? 'Remove Shadow' : 'Add Shadow'}
          </button>
        </div>
        {shadow && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-xs text-gray-400">Blur</label>
              <input
                type="range"
                min={0}
                max={30}
                value={shadow.blur || 0}
                onChange={(e) =>
                  onObjectUpdate({
                    shadow: { ...shadow, blur: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-brand-500"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400">X</label>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  value={shadow.offsetX || 0}
                  onChange={(e) =>
                    onObjectUpdate({
                      shadow: { ...shadow, offsetX: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-brand-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400">Y</label>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  value={shadow.offsetY || 0}
                  onChange={(e) =>
                    onObjectUpdate({
                      shadow: { ...shadow, offsetY: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-brand-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
