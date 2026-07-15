import React, { useState } from 'react';
import { Lock, Unlock, RotateCw } from 'lucide-react';
import { clsx } from 'clsx';
import TextToolbar from './TextToolbar';

export default function PropertyPanel({ selectedObject, onObjectUpdate, canvasProps }) {
  const [aspectLocked, setAspectLocked] = useState(true);

  if (!selectedObject && !canvasProps) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <RotateCw className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-400">Select an object to edit</p>
      </div>
    );
  }

  if (!selectedObject && canvasProps) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Canvas</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Width</label>
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
              {canvasProps.width} px
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Height</label>
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
              {canvasProps.height} px
            </div>
          </div>
        </div>
        {canvasProps.printArea && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Print Area</label>
            <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-md p-2">
              {canvasProps.printArea.width} × {canvasProps.printArea.height} px
            </div>
          </div>
        )}
      </div>
    );
  }

  const updateProp = (props) => {
    onObjectUpdate(props);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 capitalize">
        {selectedObject.type === 'i-text' || selectedObject.type === 'textbox'
          ? 'Text Properties'
          : selectedObject.type === 'image'
          ? 'Image Properties'
          : selectedObject.type === 'group'
          ? 'Group Properties'
          : 'Shape Properties'}
      </h3>

      {(selectedObject.type === 'i-text' || selectedObject.type === 'textbox') && (
        <TextToolbar activeObject={selectedObject} onObjectUpdate={updateProp} />
      )}

      {selectedObject.type === 'image' && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brightness</label>
              <span className="text-xs text-gray-400">{((selectedObject.brightness || 0) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={selectedObject.brightness || 0}
              onChange={(e) => updateProp({ brightness: parseFloat(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contrast</label>
              <span className="text-xs text-gray-400">{((selectedObject.contrast || 0) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={selectedObject.contrast || 0}
              onChange={(e) => updateProp({ contrast: parseFloat(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Saturation</label>
              <span className="text-xs text-gray-400">{((selectedObject.saturation || 0) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={selectedObject.saturation || 0}
              onChange={(e) => updateProp({ saturation: parseFloat(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>
        </div>
      )}

      {(selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'triangle' || selectedObject.type === 'path' || selectedObject.type === 'group') && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Fill Color</label>
            <div className="relative">
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div
                  className="w-5 h-5 rounded border border-gray-200"
                  style={{ backgroundColor: selectedObject.fill || '#cccccc' }}
                />
                <span className="text-sm text-gray-600">{selectedObject.fill || '#cccccc'}</span>
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Stroke Color</label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-gray-200"
                style={{ backgroundColor: selectedObject.stroke || 'transparent' }}
              />
              <input
                type="text"
                value={selectedObject.stroke || ''}
                onChange={(e) => updateProp({ stroke: e.target.value })}
                placeholder="none"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stroke Width</label>
              <span className="text-xs text-gray-400">{selectedObject.strokeWidth || 0}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={selectedObject.strokeWidth || 0}
              onChange={(e) => updateProp({ strokeWidth: parseInt(e.target.value) })}
              className="w-full accent-brand-500"
            />
          </div>
          {selectedObject.type === 'rect' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Corner Radius</label>
                <span className="text-xs text-gray-400">{selectedObject.rx || 0}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={selectedObject.rx || 0}
                onChange={(e) => updateProp({ rx: parseInt(e.target.value), ry: parseInt(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
          )}
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
          Opacity
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selectedObject.opacity ?? 1}
            onChange={(e) => updateProp({ opacity: parseFloat(e.target.value) })}
            className="flex-1 accent-brand-500"
          />
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round((selectedObject.opacity ?? 1) * 100)}%
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Position & Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">X</label>
            <input
              type="number"
              value={Math.round(selectedObject.left || 0)}
              onChange={(e) => updateProp({ left: parseInt(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Y</label>
            <input
              type="number"
              value={Math.round(selectedObject.top || 0)}
              onChange={(e) => updateProp({ top: parseInt(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">W</label>
            <input
              type="number"
              value={Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1))}
              onChange={(e) => {
                const newW = parseInt(e.target.value);
                const scaleX = newW / (selectedObject.width || 1);
                if (aspectLocked) {
                  updateProp({ scaleX, scaleY: scaleX });
                } else {
                  updateProp({ scaleX });
                }
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">H</label>
            <input
              type="number"
              value={Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1))}
              onChange={(e) => {
                const newH = parseInt(e.target.value);
                const scaleY = newH / (selectedObject.height || 1);
                if (aspectLocked) {
                  updateProp({ scaleX: scaleY, scaleY });
                } else {
                  updateProp({ scaleY });
                }
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setAspectLocked(!aspectLocked)}
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              aspectLocked ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
            )}
            title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {aspectLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <span className="text-xs text-gray-400">
            {aspectLocked ? 'Aspect ratio locked' : 'Aspect ratio free'}
          </span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
          Rotation
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={360}
            value={Math.round(selectedObject.angle || 0)}
            onChange={(e) => updateProp({ angle: parseInt(e.target.value) })}
            className="flex-1 accent-brand-500"
          />
          <input
            type="number"
            min={0}
            max={360}
            value={Math.round(selectedObject.angle || 0)}
            onChange={(e) => updateProp({ angle: parseInt(e.target.value) })}
            className="w-14 px-2 py-1 text-sm border border-gray-200 rounded-md text-center outline-none focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-xs text-gray-400">°</span>
        </div>
      </div>
    </div>
  );
}
