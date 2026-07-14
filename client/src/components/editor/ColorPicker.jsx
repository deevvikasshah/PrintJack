import React, { useState, useCallback } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { clsx } from 'clsx';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#E63946', '#1D3557', '#F1FAEE', '#A8DADC',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FF8C00', '#32CD32', '#9370DB', '#FF69B4', '#00CED1', '#FFD700',
  '#8B4513', '#808080', '#FF4500', '#1E90FF', '#2E8B57', '#DAA520',
  '#FF1493', '#00BFFF', '#DC143C', '#228B22', '#4B0082', '#FF6347',
];

export default function ColorPicker({
  color = '#000000',
  onChange,
  showGradient = false,
  gradientValue,
  onGradientChange,
  opacity = 1,
  onOpacityChange,
  label,
}) {
  const [mode, setMode] = useState('solid');
  const [gradientType, setGradientType] = useState('linear');
  const [gradientAngle, setGradientAngle] = useState(0);
  const [gradientStops, setGradientStops] = useState([
    { color: '#E63946', position: 0 },
    { color: '#1D3557', position: 100 },
  ]);

  const handleGradientStopChange = useCallback(
    (index, newColor) => {
      const updated = gradientStops.map((s, i) =>
        i === index ? { ...s, color: newColor } : s
      );
      setGradientStops(updated);
      if (onGradientChange) {
        const css =
          gradientType === 'linear'
            ? `linear-gradient(${gradientAngle}deg, ${updated.map((s) => `${s.color} ${s.position}%`).join(', ')})`
            : `radial-gradient(circle, ${updated.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
        onGradientChange(css);
      }
    },
    [gradientStops, gradientType, gradientAngle, onGradientChange]
  );

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {showGradient && (
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setMode('solid')}
            className={clsx(
              'flex-1 text-xs py-1.5 rounded-md font-medium transition-colors',
              mode === 'solid'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Solid
          </button>
          <button
            onClick={() => setMode('gradient')}
            className={clsx(
              'flex-1 text-xs py-1.5 rounded-md font-medium transition-colors',
              mode === 'gradient'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Gradient
          </button>
        </div>
      )}

      {mode === 'solid' ? (
        <>
          <HexColorPicker color={color} onChange={onChange} style={{ width: '100%', height: 160 }} />
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-8 h-8 rounded-md border-2 border-gray-200 shadow-inner flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2">
              <span className="text-xs text-gray-400">#</span>
              <HexColorInput
                color={color}
                onChange={onChange}
                className="w-full bg-transparent text-sm font-mono outline-none py-1.5 uppercase"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-1">
            <button
              onClick={() => setGradientType('linear')}
              className={clsx(
                'flex-1 text-xs py-1.5 rounded-md font-medium transition-colors',
                gradientType === 'linear'
                  ? 'bg-navy-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Linear
            </button>
            <button
              onClick={() => setGradientType('radial')}
              className={clsx(
                'flex-1 text-xs py-1.5 rounded-md font-medium transition-colors',
                gradientType === 'radial'
                  ? 'bg-navy-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Radial
            </button>
          </div>

          {gradientType === 'linear' && (
            <div>
              <label className="text-xs text-gray-500">Angle: {gradientAngle}°</label>
              <input
                type="range"
                min={0}
                max={360}
                value={gradientAngle}
                onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          )}

          <div className="space-y-2">
            {gradientStops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => handleGradientStopChange(i, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => {
                    const updated = [...gradientStops];
                    updated[i] = { ...updated[i], position: parseInt(e.target.value) };
                    setGradientStops(updated);
                  }}
                  className="flex-1 accent-brand-500"
                />
                <span className="text-xs text-gray-400 w-8">{stop.position}%</span>
              </div>
            ))}
          </div>

          <div
            className="w-full h-8 rounded-md border border-gray-200"
            style={{
              background:
                gradientType === 'linear'
                  ? `linear-gradient(${gradientAngle}deg, ${gradientStops.map((s) => `${s.color} ${s.position}%`).join(', ')})`
                  : `radial-gradient(circle, ${gradientStops.map((s) => `${s.color} ${s.position}%`).join(', ')})`,
            }}
          />
        </div>
      )}

      {onOpacityChange && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Opacity</span>
            <span className="text-xs font-medium text-gray-700">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>
      )}

      <div className="grid grid-cols-6 gap-1">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={clsx(
              'w-full aspect-square rounded-md border-2 transition-all hover:scale-110',
              color?.toUpperCase() === c.toUpperCase()
                ? 'border-brand-500 ring-1 ring-brand-300'
                : 'border-gray-200 hover:border-gray-400'
            )}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
