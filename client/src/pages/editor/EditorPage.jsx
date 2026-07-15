import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import {
  MousePointer2, Type, Upload, Palette, Layers, Layout, Grid3X3,
  Undo2, Redo2, Save, Eye, ShoppingCart, Download, ChevronLeft,
  Trash2, Copy, Clipboard, Group, Ungroup, Image as ImageIcon,
  Square, Circle, Triangle, Star, Minus, ArrowUp, ArrowDown,
  Lock, Unlock, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight,
  RotateCcw, AlignCenter, AlignLeft, AlignRight, Menu, X
} from 'lucide-react';
import { clsx } from 'clsx';
import EditorCanvas from '../../components/editor/EditorCanvas';
import PropertyPanel from '../../components/editor/PropertyPanel';
import LayerPanel from '../../components/editor/LayerPanel';
import ClipartPanel from '../../components/editor/ClipartPanel';
import ImageUploader from '../../components/editor/ImageUploader';
import DesignTemplates from '../../components/editor/DesignTemplates';
import ColorPicker from '../../components/editor/ColorPicker';
import PreviewModal from '../../components/editor/PreviewModal';
import ZoomControls from '../../components/editor/ZoomControls';
import KeyboardShortcuts from '../../components/editor/KeyboardShortcuts';
import ToolbarButton from '../../components/editor/ToolbarButton';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';

const LEFT_TABS = [
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'templates', label: 'Templates', icon: Layout },
  { id: 'clipart', label: 'Clipart', icon: Star },
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'bg', label: 'Background', icon: Square },
];

const MAX_UNDO = 50;

export default function EditorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart: cartAddToCart } = useCart();

  const canvasRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const autoSaveTimer = useRef(null);
  const designIdRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [printArea, setPrintArea] = useState(null);
  const [productImage, setProductImage] = useState(null);

  const [activeLeftTab, setActiveLeftTab] = useState('design');
  const [selectedObject, setSelectedObject] = useState(null);
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState(-1);

  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [showPreview, setShowPreview] = useState(false);
  const [designPreviewUrl, setDesignPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [mobilePanelOpen, setMobilePanelOpen] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${productId}`);
        const prod = data.product || data;
        setProduct(prod);

        const pa = prod.printAreas?.[0] || {
          x: 0,
          y: 0,
          width: prod.printWidth || 400,
          height: prod.printHeight || 400,
        };

        const INCH_TO_PX = 96;
        const isSmallDimensions = pa.width < 20 && pa.height < 20;
        const normalizedPA = {
          ...pa,
          x: (pa.x || 0) * (isSmallDimensions ? INCH_TO_PX : 1),
          y: (pa.y || 0) * (isSmallDimensions ? INCH_TO_PX : 1),
          width: pa.width * (isSmallDimensions ? INCH_TO_PX : 1),
          height: pa.height * (isSmallDimensions ? INCH_TO_PX : 1),
        };

        setPrintArea(normalizedPA);
        setCanvasWidth(normalizedPA.width + (normalizedPA.x || 0) * 2 || 500);
        setCanvasHeight(normalizedPA.height + (normalizedPA.y || 0) * 2 || 500);
        setProductImage(prod.mockupImage || prod.image || null);
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const state = JSON.stringify(canvas.toJSON(['id', 'name', '_isGrid', '_isBackground', '_isPrintArea']));
    undoStack.current.push(state);
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    redoStack.current = [];
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(false);
  }, []);

  const refreshObjects = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const objects = canvas.getObjects().filter(
      (o) => !o._isGrid && !o._isBackground && !o._isPrintArea
    );
    setCanvasObjects([...objects]);
    const active = canvas.getActiveObject();
    if (active) {
      const idx = objects.indexOf(active);
      setSelectedObjectIndex(idx);
    }
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const currentState = JSON.stringify(canvas.toJSON(['id', 'name', '_isGrid', '_isBackground', '_isPrintArea']));
    redoStack.current.push(currentState);
    const prevState = undoStack.current.pop();
    canvas.loadFromJSON(prevState, () => {
      canvas.renderAll();
      refreshObjects();
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
    });
  }, [refreshObjects]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const currentState = JSON.stringify(canvas.toJSON(['id', 'name', '_isGrid', '_isBackground', '_isPrintArea']));
    undoStack.current.push(currentState);
    const nextState = redoStack.current.pop();
    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();
      refreshObjects();
      setCanRedo(redoStack.current.length > 0);
      setCanUndo(true);
    });
  }, [refreshObjects]);

  const addText = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    saveCanvasState();
    const text = new fabric.IText('Your Text', {
      fontSize: 36,
      fontFamily: 'Inter',
      fill: '#1D3557',
      fontWeight: 'bold',
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      originX: 'center',
      originY: 'center',
      id: `text-${Date.now()}`,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    refreshObjects();
  }, [canvasWidth, canvasHeight, saveCanvasState, refreshObjects]);

  const addShape = useCallback(
    (type) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      saveCanvasState();
      let shape;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      switch (type) {
        case 'rect':
          shape = new fabric.Rect({
            width: 120,
            height: 80,
            fill: '#E63946',
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            rx: 0,
            ry: 0,
          });
          break;
        case 'circle':
          shape = new fabric.Circle({
            radius: 60,
            fill: '#1D3557',
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            width: 120,
            height: 100,
            fill: '#E63946',
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
          });
          break;
        case 'line':
          shape = new fabric.Line([centerX - 60, centerY, centerX + 60, centerY], {
            stroke: '#1D3557',
            strokeWidth: 3,
          });
          break;
        case 'star5':
        case 'star6':
        case 'hexagon':
        case 'octagon':
        case 'diamond': {
          const points = getShapePoints(type, 60);
          shape = new fabric.Polygon(points, {
            fill: '#E63946',
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
          });
          break;
        }
        default:
          shape = new fabric.Rect({
            width: 100,
            height: 100,
            fill: '#E63946',
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
          });
      }

      shape.id = `shape-${Date.now()}`;
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      refreshObjects();
    },
    [canvasWidth, canvasHeight, saveCanvasState, refreshObjects]
  );

  const getShapePoints = (type, radius) => {
    const points = [];
    let sides;
    switch (type) {
      case 'star5': sides = 10; break;
      case 'star6': sides = 12; break;
      case 'hexagon': sides = 6; break;
      case 'octagon': sides = 8; break;
      case 'diamond': sides = 4; break;
      default: sides = 6;
    }
    const isStar = type.startsWith('star');
    const outerR = radius;
    const innerR = radius * 0.45;
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const r = isStar ? (i % 2 === 0 ? outerR : innerR) : outerR;
      points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
    }
    return points;
  };

  const addImageToCanvas = useCallback(
    (dataUrl, name) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      saveCanvasState();
      fabric.Image.fromURL(dataUrl, (img) => {
        const maxDim = Math.min(canvasWidth, canvasHeight) * 0.5;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          id: `img-${Date.now()}`,
          name: name || 'Image',
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        refreshObjects();
      });
    },
    [canvasWidth, canvasHeight, saveCanvasState, refreshObjects]
  );

  const addClipart = useCallback(
    (clipart) => {
      if (clipart.type === 'shape') {
        addShape(clipart.shapeType);
        return;
      }
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      saveCanvasState();
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120"><path d="${clipart.path}" fill="#1D3557"/></svg>`;
      fabric.loadSVGFromString(svgStr, (objects, options) => {
        const group = fabric.util.groupSVGElements(objects, options);
        group.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          id: `clipart-${Date.now()}`,
          name: clipart.name,
        });
        const maxDim = Math.min(canvasWidth, canvasHeight) * 0.4;
        const scale = Math.min(maxDim / group.width, maxDim / group.height, 1);
        group.scale(scale);
        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
        refreshObjects();
      });
    },
    [canvasWidth, canvasHeight, addShape, saveCanvasState, refreshObjects]
  );

  const loadTemplate = useCallback(
    (templateJson) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      saveCanvasState();
      canvas.loadFromJSON(templateJson, () => {
        canvas.renderAll();
        refreshObjects();
        toast.success('Template loaded');
      });
    },
    [saveCanvasState, refreshObjects]
  );

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    saveCanvasState();
    if (active.type === 'activeSelection') {
      active.forEachObject((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
    } else {
      canvas.remove(active);
    }
    canvas.renderAll();
    setSelectedObject(null);
    refreshObjects();
  }, [saveCanvasState, refreshObjects]);

  const copyObject = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone((cloned) => {
      window._clipboard = cloned;
      toast.success('Copied', { duration: 1000 });
    });
  }, []);

  const pasteObject = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas || !window._clipboard) return;
    saveCanvasState();
    window._clipboard.clone((cloned) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        id: `${cloned.type}-${Date.now()}`,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((obj) => {
          obj.id = `${obj.type}-${Date.now()}-${Math.random()}`;
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      refreshObjects();
    });
  }, [saveCanvasState, refreshObjects]);

  const selectAll = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const objects = canvas.getObjects().filter((o) => !o._isGrid && !o._isBackground && !o._isPrintArea);
    if (objects.length === 0) return;
    const selection = new fabric.ActiveSelection(objects, { canvas });
    canvas.setActiveObject(selection);
    canvas.renderAll();
  }, []);

  const groupSelected = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') return;
    saveCanvasState();
    const group = active.toGroup();
    group.id = `group-${Date.now()}`;
    canvas.renderAll();
    refreshObjects();
  }, [saveCanvasState, refreshObjects]);

  const ungroupSelected = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'group') return;
    saveCanvasState();
    active.toActiveSelection();
    canvas.renderAll();
    refreshObjects();
  }, [saveCanvasState, refreshObjects]);

  const duplicateSelected = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    saveCanvasState();
    active.clone((cloned) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        id: `${cloned.type}-${Date.now()}`,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      refreshObjects();
    });
  }, [saveCanvasState, refreshObjects]);

  const updateSelectedObject = useCallback(
    (props) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      saveCanvasState();
      active.set(props);
      if (props.fill || props.fontSize || props.fontFamily) {
        active.setCoords();
      }
      canvas.renderAll();
      setSelectedObject({ ...active });
      refreshObjects();
    },
    [saveCanvasState, refreshObjects]
  );

  const handleObjectSelect = useCallback(
    (obj) => {
      setSelectedObject(obj);
    },
    []
  );

  const handleObjectReorder = useCallback(
    (fromIdx, toIdx) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      const objects = canvas.getObjects().filter((o) => !o._isGrid && !o._isBackground && !o._isPrintArea);
      if (fromIdx < 0 || fromIdx >= objects.length || toIdx < 0 || toIdx >= objects.length) return;
      saveCanvasState();
      const obj = objects[fromIdx];
      if (toIdx > fromIdx) {
        for (let i = fromIdx; i < toIdx; i++) {
          canvas.bringForward(obj);
        }
      } else {
        for (let i = fromIdx; i > toIdx; i--) {
          canvas.sendBackwards(obj);
        }
      }
      canvas.renderAll();
      refreshObjects();
    },
    [saveCanvasState, refreshObjects]
  );

  const handleVisibilityToggle = useCallback(
    (idx) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      const objects = canvas.getObjects().filter((o) => !o._isGrid && !o._isBackground && !o._isPrintArea);
      const obj = objects[idx];
      if (!obj) return;
      saveCanvasState();
      obj.set('visible', !obj.visible);
      canvas.renderAll();
      refreshObjects();
    },
    [saveCanvasState, refreshObjects]
  );

  const handleLockToggle = useCallback(
    (idx) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      const objects = canvas.getObjects().filter((o) => !o._isGrid && !o._isBackground && !o._isPrintArea);
      const obj = objects[idx];
      if (!obj) return;
      saveCanvasState();
      const isLocked = obj.selectable === false;
      obj.set({
        selectable: isLocked,
        evented: isLocked,
        lockMovementX: !isLocked,
        lockMovementY: !isLocked,
        lockRotation: !isLocked,
        lockScalingX: !isLocked,
        lockScalingY: !isLocked,
      });
      canvas.renderAll();
      refreshObjects();
    },
    [saveCanvasState, refreshObjects]
  );

  const handleLayerDelete = useCallback(
    (idx) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      const objects = canvas.getObjects().filter((o) => !o._isGrid && !o._isBackground && !o._isPrintArea);
      const obj = objects[idx];
      if (!obj) return;
      saveCanvasState();
      canvas.remove(obj);
      canvas.renderAll();
      setSelectedObject(null);
      refreshObjects();
    },
    [saveCanvasState, refreshObjects]
  );

  const handleBgColorChange = useCallback(
    (color) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      setBgColor(color);
      saveCanvasState();
      canvas.setBackgroundColor(color, () => canvas.renderAll());
    },
    [saveCanvasState]
  );

  const handleSave = useCallback(
    async (asDraft = true) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      setSaving(true);
      try {
        const json = canvasRef.current.toJSON();
        const previewUrl = canvasRef.current.toDataUrl();
        const payload = {
          productId,
          canvasJSON: json,
          previewImage: previewUrl,
          isDraft: asDraft,
        };
        let result;
        if (designIdRef.current) {
          result = await api.put(`/designs/${designIdRef.current}`, payload);
        } else {
          result = await api.post('/designs', payload);
          designIdRef.current = result.data.design?._id || result.data._id;
        }
        setLastSaved(new Date());
        toast.success(asDraft ? 'Draft saved' : 'Design saved');
      } catch (err) {
        toast.error('Failed to save design');
      } finally {
        setSaving(false);
      }
    },
    [productId]
  );

  const handlePreview = useCallback(() => {
    const url = canvasRef.current?.toDataUrl();
    setDesignPreviewUrl(url);
    setShowPreview(true);
  }, []);

  const handleDownload = useCallback(() => {
    const url = canvasRef.current?.toDataUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.download = `${product?.name || 'design'}-printjack.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Design downloaded');
  }, [product]);

  const handleAddToCart = useCallback(
    async ({ productId: pid, quantity, size, color }) => {
      try {
        const json = canvasRef.current.toJSON();
        const previewUrl = canvasRef.current.toDataUrl();
        let designId = designIdRef.current;
        if (!designId) {
          const { data } = await api.post('/designs', {
            productId: pid,
            canvasJSON: json,
            previewImage: previewUrl,
            isDraft: false,
          });
          designId = data.design?._id || data._id;
          designIdRef.current = designId;
        }
        await cartAddToCart(pid, quantity, size, color, designId);
        setShowPreview(false);
      } catch (err) {
        toast.error('Failed to add to cart');
      }
    },
    [cartAddToCart]
  );

  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (canvas && canvas.getObjects().length > 0) {
        handleSave(true);
      }
    }, 30000);
    return () => clearInterval(autoSaveTimer.current);
  }, [handleSave]);

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(1);
  }, []);

  const handleCanvasReady = useCallback(() => {
    refreshObjects();
  }, [refreshObjects]);

  const handleObjectSelected = useCallback((obj) => {
    setSelectedObject(obj);
  }, []);

  const handleObjectModified = useCallback(() => {
    refreshObjects();
  }, [refreshObjects]);

  const handleMouseMove = useCallback((pos) => {
    setCursorPos(pos);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <KeyboardShortcuts
        canvasRef={canvasRef}
        onUndo={undo}
        onRedo={redo}
        onDelete={deleteSelected}
        onCopy={copyObject}
        onPaste={pasteObject}
        onGroup={groupSelected}
        onUngroup={ungroupSelected}
        onSelectAll={selectAll}
        onDuplicate={duplicateSelected}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
              {product?.name || 'Design Editor'}
            </h1>
            {product?.variant && (
              <p className="text-xs text-gray-400">{product.variant}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ToolbarButton
            icon={Undo2}
            onClick={undo}
            disabled={!canUndo}
            tooltip="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            icon={Redo2}
            onClick={redo}
            disabled={!canRedo}
            tooltip="Redo (Ctrl+Y)"
          />

          <div className="hidden md:block">
            <ZoomControls
              zoom={zoom}
              onZoomChange={handleZoomChange}
              onFitToScreen={handleFitToScreen}
            />
          </div>

          <div className="hidden md:block">
            <ToolbarButton
              icon={Grid3X3}
              onClick={() => setShowGrid(!showGrid)}
              active={showGrid}
              tooltip="Toggle Grid"
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          <button
            onClick={handleDownload}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Download</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span className="hidden lg:inline">{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={handlePreview}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden lg:inline">Preview</span>
          </button>

          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className="hidden md:flex w-[280px] flex-col bg-white border-r border-gray-200 overflow-hidden flex-shrink-0">
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {LEFT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLeftTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0',
                  activeLeftTab === tab.id
                    ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeLeftTab === 'design' && (
              <div className="space-y-4">
                <ImageUploader onImageAdd={addImageToCanvas} />

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Text</h4>
                  <button
                    onClick={addText}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-navy-700 text-white rounded-lg font-semibold hover:bg-navy-800 transition-colors text-sm"
                  >
                    <Type className="w-4 h-4" />
                    Add Text
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Shape</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: 'rect', icon: Square, label: 'Rectangle' },
                      { type: 'circle', icon: Circle, label: 'Circle' },
                      { type: 'triangle', icon: Triangle, label: 'Triangle' },
                      { type: 'line', icon: Minus, label: 'Line' },
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => addShape(type)}
                        className="flex flex-col items-center gap-1 p-2 bg-gray-50 border border-gray-100 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-all"
                        title={label}
                      >
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="text-[10px] text-gray-400">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      { type: 'diamond', label: 'Diamond' },
                      { type: 'star5', label: 'Star 5' },
                      { type: 'hexagon', label: 'Hexagon' },
                      { type: 'octagon', label: 'Octagon' },
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => addShape(type)}
                        className="flex flex-col items-center gap-1 p-2 bg-gray-50 border border-gray-100 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-all"
                        title={label}
                      >
                        <Star className="w-5 h-5 text-gray-600" />
                        <span className="text-[10px] text-gray-400">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={copyObject}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button
                      onClick={pasteObject}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Clipboard className="w-3.5 h-3.5" /> Paste
                    </button>
                    <button
                      onClick={groupSelected}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Group className="w-3.5 h-3.5" /> Group
                    </button>
                    <button
                      onClick={ungroupSelected}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Ungroup className="w-3.5 h-3.5" /> Ungroup
                    </button>
                    <button
                      onClick={duplicateSelected}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 col-span-2"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate (Ctrl+D)
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-red-600 col-span-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete (Del)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeLeftTab === 'templates' && (
              <DesignTemplates
                onLoadTemplate={loadTemplate}
                productCategory={product?.category}
              />
            )}

            {activeLeftTab === 'clipart' && (
              <ClipartPanel onClipartAdd={addClipart} />
            )}

            {activeLeftTab === 'uploads' && (
              <div className="space-y-3">
                <ImageUploader onImageAdd={addImageToCanvas} />
                <p className="text-xs text-gray-400 text-center">
                  Previously uploaded images will appear here
                </p>
              </div>
            )}

            {activeLeftTab === 'layers' && (
              <LayerPanel
                objects={canvasObjects}
                selectedObjectIndex={selectedObjectIndex}
                onObjectSelect={(idx) => {
                  const canvas = canvasRef.current?.getCanvas?.();
                  if (!canvas) return;
                  const objects = canvas.getObjects().filter(
                    (o) => !o._isGrid && !o._isBackground && !o._isPrintArea
                  );
                  const obj = objects[idx];
                  if (obj) {
                    canvas.setActiveObject(obj);
                    canvas.renderAll();
                    setSelectedObject(obj);
                    setSelectedObjectIndex(idx);
                  }
                }}
                onObjectReorder={handleObjectReorder}
                onObjectVisibilityToggle={handleVisibilityToggle}
                onObjectLockToggle={handleLockToggle}
                onObjectDelete={handleLayerDelete}
              />
            )}

            {activeLeftTab === 'bg' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Background Color
                  </h4>
                  <ColorPicker
                    color={bgColor}
                    onChange={handleBgColorChange}
                    showGradient
                    onGradientChange={(grad) => {
                      const canvas = canvasRef.current?.getCanvas?.();
                      if (!canvas) return;
                      saveCanvasState();
                      canvas.setBackgroundColor(grad, () => canvas.renderAll());
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Colors
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {['#FFFFFF', '#000000', '#E63946', '#1D3557', '#F1FAEE', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#FF8C00'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleBgColorChange(c)}
                        className={clsx(
                          'w-full aspect-square rounded-lg border-2 transition-all hover:scale-110',
                          bgColor === c ? 'border-brand-500 ring-1 ring-brand-300' : 'border-gray-200'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 relative bg-gray-50 overflow-auto">
          <EditorCanvas
            ref={canvasRef}
            productImageUrl={productImage}
            printArea={printArea}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zoom={zoom}
            onZoomChange={handleZoomChange}
            showGrid={showGrid}
            onObjectSelected={handleObjectSelected}
            onObjectModified={handleObjectModified}
            onCanvasReady={handleCanvasReady}
            onMouseMove={handleMouseMove}
          />

          <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-500 shadow-sm">
            <span>{canvasWidth} × {canvasHeight} px</span>
            <span>|</span>
            <span>X: {cursorPos.x} Y: {cursorPos.y}</span>
            {lastSaved && (
              <>
                <span>|</span>
                <span className="text-green-600">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        </main>

        <aside className="hidden md:flex w-[280px] flex-col bg-white border-l border-gray-200 overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Properties</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <PropertyPanel
              selectedObject={selectedObject}
              onObjectUpdate={updateSelectedObject}
              canvasProps={{
                width: canvasWidth,
                height: canvasHeight,
                printArea,
              }}
            />
          </div>
        </aside>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="flex items-center justify-around py-2">
            {LEFT_TABS.slice(0, 5).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMobilePanelOpen(mobilePanelOpen === tab.id ? null : tab.id)}
                className={clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                  mobilePanelOpen === tab.id
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-500'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {mobilePanelOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobilePanelOpen(null)}
            />
            <div className="absolute bottom-14 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[60vh] overflow-hidden flex flex-col z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900 capitalize">{mobilePanelOpen}</h3>
                <button
                  onClick={() => setMobilePanelOpen(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {mobilePanelOpen === 'design' && (
                  <div className="space-y-3">
                    <ImageUploader onImageAdd={(url, name) => { addImageToCanvas(url, name); setMobilePanelOpen(null); }} />
                    <button onClick={addText} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-navy-700 text-white rounded-lg font-semibold text-sm">
                      <Type className="w-4 h-4" /> Add Text
                    </button>
                    <div className="grid grid-cols-4 gap-2">
                      {['rect', 'circle', 'triangle', 'line'].map((type) => (
                        <button key={type} onClick={() => addShape(type)} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                          {type === 'rect' && <Square className="w-5 h-5 text-gray-600" />}
                          {type === 'circle' && <Circle className="w-5 h-5 text-gray-600" />}
                          {type === 'triangle' && <Triangle className="w-5 h-5 text-gray-600" />}
                          {type === 'line' && <Minus className="w-5 h-5 text-gray-600" />}
                          <span className="text-[10px] text-gray-400 capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {mobilePanelOpen === 'templates' && (
                  <DesignTemplates onLoadTemplate={(json) => { loadTemplate(json); setMobilePanelOpen(null); }} productCategory={product?.category} />
                )}
                {mobilePanelOpen === 'clipart' && (
                  <ClipartPanel onClipartAdd={(c) => { addClipart(c); setMobilePanelOpen(null); }} />
                )}
                {mobilePanelOpen === 'layers' && (
                  <LayerPanel
                    objects={canvasObjects}
                    selectedObjectIndex={selectedObjectIndex}
                    onObjectSelect={(idx) => {
                      const canvas = canvasRef.current?.getCanvas?.();
                      if (!canvas) return;
                      const objects = canvas.getObjects().filter(o => !o._isGrid && !o._isBackground && !o._isPrintArea);
                      const obj = objects[idx];
                      if (obj) { canvas.setActiveObject(obj); canvas.renderAll(); setSelectedObject(obj); setSelectedObjectIndex(idx); }
                    }}
                    onObjectReorder={handleObjectReorder}
                    onObjectVisibilityToggle={handleVisibilityToggle}
                    onObjectLockToggle={handleLockToggle}
                    onObjectDelete={handleLayerDelete}
                  />
                )}
                {mobilePanelOpen === 'bg' && (
                  <ColorPicker color={bgColor} onChange={handleBgColorChange} showGradient />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="md:hidden fixed bottom-14 right-3 z-20 flex flex-col gap-2">
          <button onClick={undo} disabled={!canUndo} className="p-2.5 bg-white rounded-full shadow-lg disabled:opacity-30">
            <Undo2 className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2.5 bg-white rounded-full shadow-lg disabled:opacity-30">
            <Redo2 className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={handleSave} className="p-2.5 bg-white rounded-full shadow-lg">
            <Save className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        product={product}
        designPreviewUrl={designPreviewUrl}
        onAddToCart={handleAddToCart}
        onEditDesign={() => setShowPreview(false)}
      />
    </div>
  );
}
