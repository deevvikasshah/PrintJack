import React from 'react';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown,
  Type, Image, Square, Circle as CircleIcon, Triangle, Minus,
  Layers, Star
} from 'lucide-react';
import { clsx } from 'clsx';

function getObjectTypeIcon(obj) {
  if (!obj) return Layers;
  const type = obj.type;
  if (type === 'i-text' || type === 'textbox' || type === 'text') return Type;
  if (type === 'image') return Image;
  if (type === 'rect') return Square;
  if (type === 'circle') return CircleIcon;
  if (type === 'triangle') return Triangle;
  if (type === 'line') return Minus;
  if (type === 'path') return Star;
  if (type === 'group') return Layers;
  return Layers;
}

function getObjectName(obj) {
  if (!obj) return 'Object';
  if (obj.type === 'i-text' || obj.type === 'textbox') {
    const text = obj.text || '';
    return text.length > 16 ? text.substring(0, 16) + '...' : text || 'Text';
  }
  if (obj.type === 'image') return obj.name || 'Image';
  if (obj.type === 'rect') return 'Rectangle';
  if (obj.type === 'circle') return 'Circle';
  if (obj.type === 'triangle') return 'Triangle';
  if (obj.type === 'line') return 'Line';
  if (obj.type === 'path') return obj.name || 'Path';
  if (obj.type === 'group') return 'Group';
  return obj.type || 'Object';
}

export default function LayerPanel({
  objects = [],
  selectedObjectIndex,
  onObjectSelect,
  onObjectReorder,
  onObjectVisibilityToggle,
  onObjectLockToggle,
  onObjectDelete,
}) {
  const handleMoveUp = (index) => {
    if (index < objects.length - 1) {
      onObjectReorder(index, index + 1);
    }
  };

  const handleMoveDown = (index) => {
    if (index > 0) {
      onObjectReorder(index, index - 1);
    }
  };

  if (objects.length === 0) {
    return (
      <div className="text-center py-8">
        <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No objects on canvas</p>
        <p className="text-xs text-gray-300 mt-1">Add text, images, or shapes to see layers</p>
      </div>
    );
  }

  const reversedObjects = [...objects].reverse();

  return (
    <div className="space-y-1">
      {reversedObjects.map((obj, reversedIdx) => {
        const originalIndex = objects.length - 1 - reversedIdx;
        const isSelected = originalIndex === selectedObjectIndex;
        const Icon = getObjectTypeIcon(obj);
        const isVisible = obj.visible !== false;
        const isLocked = obj.selectable === false;

        return (
          <div
            key={obj.id || originalIndex}
            onClick={() => !isLocked && onObjectSelect(originalIndex)}
            className={clsx(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all group',
              isSelected
                ? 'bg-brand-50 border border-brand-200'
                : 'hover:bg-gray-50 border border-transparent'
            )}
          >
            <div
              className={clsx(
                'w-7 h-7 rounded flex items-center justify-center flex-shrink-0',
                isSelected ? 'bg-brand-100' : 'bg-gray-100'
              )}
            >
              <Icon
                className={clsx(
                  'w-3.5 h-3.5',
                  isSelected ? 'text-brand-600' : 'text-gray-500'
                )}
              />
            </div>

            <span
              className={clsx(
                'flex-1 text-xs truncate',
                isSelected ? 'font-medium text-brand-700' : 'text-gray-600',
                isLocked && 'opacity-50'
              )}
            >
              {getObjectName(obj)}
            </span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onObjectVisibilityToggle(originalIndex);
                }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title={isVisible ? 'Hide' : 'Show'}
              >
                {isVisible ? (
                  <Eye className="w-3 h-3 text-gray-500" />
                ) : (
                  <EyeOff className="w-3 h-3 text-gray-400" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onObjectLockToggle(originalIndex);
                }}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title={isLocked ? 'Unlock' : 'Lock'}
              >
                {isLocked ? (
                  <Lock className="w-3 h-3 text-amber-500" />
                ) : (
                  <Unlock className="w-3 h-3 text-gray-500" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onObjectDelete(originalIndex);
                }}
                className="p-1 rounded hover:bg-red-100 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500" />
              </button>
            </div>

            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveUp(originalIndex);
                }}
                disabled={originalIndex === objects.length - 1}
                className="p-0 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
              >
                <ChevronUp className="w-3 h-3 text-gray-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveDown(originalIndex);
                }}
                disabled={originalIndex === 0}
                className="p-0 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
              >
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
