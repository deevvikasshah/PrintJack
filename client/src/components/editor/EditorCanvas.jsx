import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';

const EditorCanvas = forwardRef(function EditorCanvas(
  {
    productImageUrl,
    printArea,
    canvasWidth,
    canvasHeight,
    zoom,
    onZoomChange,
    showGrid,
    onObjectSelected,
    onObjectModified,
    onCanvasReady,
    onMouseMove,
  },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const printAreaRef = useRef(null);
  const gridRef = useRef([]);
  const bgImageRef = useRef(null);

  const CANVAS_DISPLAY_MAX = 700;

  const getDisplayScale = useCallback(() => {
    const cw = canvasWidth || 500;
    const ch = canvasHeight || 500;
    return Math.min(CANVAS_DISPLAY_MAX / cw, CANVAS_DISPLAY_MAX / ch, 1);
  }, [canvasWidth, canvasHeight]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => fabricRef.current,
    toJSON: () => {
      const canvas = fabricRef.current;
      if (!canvas) return null;
      const objects = canvas.getObjects().filter((o) => o !== printAreaRef.current && o._isGrid !== true);
      const json = canvas.toJSON();
      json.objects = json.objects.filter((o) => {
        const obj = canvas.getObjects().find((c) => c.id === o.id);
        return obj && obj !== printAreaRef.current && obj._isGrid !== true;
      });
      return json;
    },
    toDataUrl: (options) => {
      const canvas = fabricRef.current;
      if (!canvas) return null;
      const printAreaObj = printAreaRef.current;
      if (printAreaObj) {
        printAreaObj.set({ visible: false });
      }
      canvas.getObjects().forEach((o) => {
        if (o._isGrid) o.set({ visible: false });
      });
      canvas.renderAll();
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
        ...options,
      });
      if (printAreaObj) {
        printAreaObj.set({ visible: true });
      }
      canvas.getObjects().forEach((o) => {
        if (o._isGrid) o.set({ visible: showGrid });
      });
      canvas.renderAll();
      return dataUrl;
    },
    loadFromJSON: (json) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.loadFromJSON(json, () => {
        canvas.renderAll();
        drawPrintArea();
        if (showGrid) drawGrid();
      });
    },
    clearCanvas: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const objects = canvas.getObjects().filter(
        (o) => o === printAreaRef.current || o._isGrid || o._isBackground
      );
      canvas.clear();
      objects.forEach((o) => canvas.add(o));
      canvas.renderAll();
    },
    addObject: (object) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      if (printArea) {
        object.set({
          left: (printArea.x || 0) + ((printArea.width || canvasWidth) / 2 - (object.width || 0) / 2),
          top: (printArea.y || 0) + ((printArea.height || canvasHeight) / 2 - (object.height || 0) / 2),
        });
      }
      canvas.add(object);
      canvas.setActiveObject(object);
      canvas.renderAll();
    },
    getActiveObject: () => fabricRef.current?.getActiveObject(),
    getObjects: () => {
      const canvas = fabricRef.current;
      if (!canvas) return [];
      return canvas.getObjects().filter((o) => o !== printAreaRef.current && o._isGrid !== true && o._isBackground !== true);
    },
  }));

  useEffect(() => {
    if (!containerRef.current || fabricRef.current) return;

    const cw = canvasWidth || 500;
    const ch = canvasHeight || 500;
    const scale = getDisplayScale();
    const displayW = Math.round(cw * scale);
    const displayH = Math.round(ch * scale);

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: displayW,
      height: displayH,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      selectionColor: 'rgba(230, 57, 70, 0.15)',
      selectionBorderColor: '#E63946',
      selectionLineWidth: 1.5,
    });

    canvas._editorScale = scale;
    fabricRef.current = canvas;

    canvas.on('selection:created', (e) => {
      onObjectSelected?.(e.selected?.[0] || null);
    });
    canvas.on('selection:updated', (e) => {
      onObjectSelected?.(e.selected?.[0] || null);
    });
    canvas.on('selection:cleared', () => {
      onObjectSelected?.(null);
    });
    canvas.on('object:modified', (e) => {
      onObjectModified?.(e.target);
    });
    canvas.on('mouse:move', (e) => {
      const pointer = canvas.getPointer(e.e);
      onMouseMove?.({ x: Math.round(pointer.x), y: Math.round(pointer.y) });
    });
    canvas.on('mouse:down', (e) => {
      if (!e.target) {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    });

    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [canvasWidth, canvasHeight]);

  const drawPrintArea = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (printAreaRef.current) {
      canvas.remove(printAreaRef.current);
      printAreaRef.current = null;
    }
    if (!printArea) return;

    const scale = canvas._editorScale || 1;
    const rect = new fabric.Rect({
      left: (printArea.x || 0) * scale,
      top: (printArea.y || 0) * scale,
      width: (printArea.width || canvasWidth) * scale,
      height: (printArea.height || canvasHeight) * scale,
      fill: 'transparent',
      stroke: '#E63946',
      strokeWidth: 1,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
      hoverCursor: 'default',
    });
    rect._isPrintArea = true;
    printAreaRef.current = rect;
    canvas.add(rect);
    canvas.sendToBack(rect);
    if (bgImageRef.current) {
      canvas.sendToBack(bgImageRef.current);
    }
  }, [printArea, canvasWidth, canvasHeight]);

  const drawGrid = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    gridRef.current.forEach((line) => canvas.remove(line));
    gridRef.current = [];

    if (!showGrid) {
      canvas.renderAll();
      return;
    }

    const scale = canvas._editorScale || 1;
    const w = canvasWidth * scale;
    const h = canvasHeight * scale;
    const step = 25 * scale;
    const lines = [];

    for (let i = step; i < w; i += step) {
      const line = new fabric.Line([i, 0, i, h], {
        stroke: 'rgba(0,0,0,0.06)',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        hoverCursor: 'default',
      });
      line._isGrid = true;
      lines.push(line);
    }
    for (let i = step; i < h; i += step) {
      const line = new fabric.Line([0, i, w, i], {
        stroke: 'rgba(0,0,0,0.06)',
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        hoverCursor: 'default',
      });
      line._isGrid = true;
      lines.push(line);
    }

    lines.forEach((l) => canvas.add(l));
    gridRef.current = lines;
    canvas.renderAll();
  }, [showGrid, canvasWidth, canvasHeight]);

  useEffect(() => {
    drawPrintArea();
  }, [drawPrintArea]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const scale = getDisplayScale();
    canvas._editorScale = scale;
    canvas.setZoom(scale * zoom);
    canvas.setWidth(Math.round(canvasWidth * scale));
    canvas.setHeight(Math.round(canvasHeight * scale));
    drawPrintArea();
    if (showGrid) drawGrid();
    canvas.renderAll();
  }, [zoom, canvasWidth, canvasHeight, getDisplayScale, drawPrintArea, drawGrid, showGrid]);

  useEffect(() => {
    if (!productImageUrl || !fabricRef.current) return;
    const canvas = fabricRef.current;
    fabric.Image.fromURL(productImageUrl, (img) => {
      if (bgImageRef.current) {
        canvas.remove(bgImageRef.current);
      }
      const scale = canvas._editorScale || 1;
      const displayW = canvasWidth * scale;
      const displayH = canvasHeight * scale;
      const imgScale = Math.min(displayW / img.width, displayH / img.height);
      img.set({
        left: displayW / 2,
        top: displayH / 2,
        originX: 'center',
        originY: 'center',
        scaleX: imgScale,
        scaleY: imgScale,
        selectable: false,
        evented: false,
        hoverCursor: 'default',
      });
      img._isBackground = true;
      bgImageRef.current = img;
      canvas.add(img);
      canvas.sendToBack(img);
      if (printAreaRef.current) {
        canvas.bringForward(printAreaRef.current);
      }
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, [productImageUrl, canvasWidth, canvasHeight]);

  const displayW = Math.round((canvasWidth || 500) * getDisplayScale());
  const displayH = Math.round((canvasHeight || 500) * getDisplayScale());

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full overflow-auto"
      style={{ minHeight: displayH + 40 }}
    >
      <div
        className="relative shadow-lg rounded-lg overflow-hidden"
        style={{ width: displayW, height: displayH }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
});

export default EditorCanvas;
