import React from 'react';
import { clsx } from 'clsx';
import { ZoomIn, ZoomOut, Maximize2, Minus, Plus } from 'lucide-react';

export default function ZoomControls({ zoom, onZoomChange, onFitToScreen }) {
  const zoomPercent = Math.round(zoom * 100);
  const minZoom = 0.5;
  const maxZoom = 2;

  const handleSliderChange = (e) => {
    onZoomChange(parseFloat(e.target.value));
  };

  const stepZoom = (delta) => {
    const next = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
    onZoomChange(Math.round(next * 20) / 20);
  };

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
      <button
        onClick={() => stepZoom(-0.1)}
        disabled={zoom <= minZoom}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Zoom Out (Ctrl+-)"
      >
        <ZoomOut className="w-4 h-4 text-gray-600" />
      </button>

      <input
        type="range"
        min={minZoom}
        max={maxZoom}
        step={0.05}
        value={zoom}
        onChange={handleSliderChange}
        className="w-20 h-1 accent-brand-500 cursor-pointer"
        title={`${zoomPercent}%`}
      />

      <button
        onClick={() => stepZoom(0.1)}
        disabled={zoom >= maxZoom}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Zoom In (Ctrl++)"
      >
        <ZoomIn className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <button
        onClick={onFitToScreen}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        title="Fit to Screen"
      >
        <Maximize2 className="w-4 h-4 text-gray-600" />
      </button>

      <span className="text-xs font-medium text-gray-500 w-10 text-center select-none">
        {zoomPercent}%
      </span>
    </div>
  );
}
