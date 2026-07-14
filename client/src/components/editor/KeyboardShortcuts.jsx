import { useEffect, useCallback } from 'react';

export default function KeyboardShortcuts({
  canvasRef,
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onGroup,
  onUngroup,
  onSelectAll,
  onDuplicate,
  canUndo,
  canRedo,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      switch (true) {
        case e.key === 'Delete':
        case e.key === 'Backspace':
          if (!isInput) {
            e.preventDefault();
            onDelete();
          }
          break;

        case ctrl && e.key === 'z' && !shift:
          e.preventDefault();
          if (canUndo) onUndo();
          break;

        case ctrl && e.key === 'y':
        case ctrl && shift && e.key === 'z':
        case ctrl && shift && e.key === 'Z':
          e.preventDefault();
          if (canRedo) onRedo();
          break;

        case ctrl && e.key === 'c':
          e.preventDefault();
          onCopy();
          break;

        case ctrl && e.key === 'v':
          e.preventDefault();
          onPaste();
          break;

        case ctrl && e.key === 'a':
          e.preventDefault();
          onSelectAll();
          break;

        case ctrl && e.key === 'g':
          e.preventDefault();
          if (shift) {
            onUngroup();
          } else {
            onGroup();
          }
          break;

        case ctrl && e.key === 'd':
          e.preventDefault();
          onDuplicate();
          break;

        case e.key === 'ArrowUp':
          e.preventDefault();
          nudgeObject(0, shift ? -10 : -1);
          break;

        case e.key === 'ArrowDown':
          e.preventDefault();
          nudgeObject(0, shift ? 10 : 1);
          break;

        case e.key === 'ArrowLeft':
          e.preventDefault();
          nudgeObject(shift ? -10 : -1, 0);
          break;

        case e.key === 'ArrowRight':
          e.preventDefault();
          nudgeObject(shift ? 10 : 1, 0);
          break;

        default:
          break;
      }
    },
    [onUndo, onRedo, onDelete, onCopy, onPaste, onGroup, onUngroup, onSelectAll, onDuplicate, canUndo, canRedo]
  );

  const nudgeObject = useCallback(
    (dx, dy) => {
      const canvas = canvasRef?.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set({
        left: active.left + dx,
        top: active.top + dy,
      });
      canvas.renderAll();
      canvas.fire('object:modified', { target: active });
    },
    [canvasRef]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
