import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import {
  ChevronLeft, Check, Minus, Plus, ShoppingCart, Type,
  Square, Circle, Triangle, Star, Upload, Layout, Palette, Undo2, Redo2,
  Grid3X3, Loader2, Ruler, Package, ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import EditorCanvas from '../../components/editor/EditorCanvas';
import DesignTemplates from '../../components/editor/DesignTemplates';
import ClipartPanel from '../../components/editor/ClipartPanel';
import ImageUploader from '../../components/editor/ImageUploader';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';

const STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'design', label: 'Design' },
  { id: 'review', label: 'Review' },
];

const QUANTITY_TIERS = [
  { min: 1, max: 9, priceMultiplier: 1.0 },
  { min: 10, max: 24, priceMultiplier: 0.9 },
  { min: 25, max: 49, priceMultiplier: 0.8 },
  { min: 50, max: 99, priceMultiplier: 0.7 },
  { min: 100, max: 249, priceMultiplier: 0.6 },
  { min: 250, max: 499, priceMultiplier: 0.5 },
  { min: 500, max: Infinity, priceMultiplier: 0.4 },
];

const DESIGN_TABS = [
  { id: 'templates', label: 'Templates', icon: Layout },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'shapes', label: 'Shapes', icon: Square },
  { id: 'clipart', label: 'Clipart', icon: Star },
];

const MAX_UNDO = 50;

export default function ProductConfiguratorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart: cartAddToCart } = useCart();

  const canvasRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const designIdRef = useRef(null);
  const designStateRef = useRef(null);
  const canvasJSONRef = useRef(null);
  const previewUrlRef = useRef(null);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hideQuantity = searchParams.get('feature-hideQuantityAndPaper') === 'true';
  const designKey = searchParams.get('designKey');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('details');

  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [printArea, setPrintArea] = useState(null);
  const [productImage, setProductImage] = useState(null);

  const [selectedPrintArea, setSelectedPrintArea] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [designPreviewUrl, setDesignPreviewUrl] = useState(null);

  const [activeDesignTab, setActiveDesignTab] = useState('templates');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const readHash = () => {
      const m = window.location.hash.match(/step=(\w+)/);
      if (m && STEPS.some((s) => s.id === m[1])) {
        setStep(m[1]);
      }
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${productId}`);
        const prod = data.product || data;
        setProduct(prod);

        const areas = prod.printAreas || [];
        let initialIdx = 0;
        if (designKey && areas.length > 0) {
          const matched = areas.findIndex((a) => (a.name || '').toLowerCase() === designKey.toLowerCase());
          if (matched >= 0) initialIdx = matched;
        }
        setSelectedPrintArea(initialIdx);

        const sizes = prod.sizes || [];
        if (sizes.length > 0) {
          setSelectedSize(typeof sizes[0] === 'string' ? sizes[0] : sizes[0]?.name || '');
        }
        const colors = prod.colors || [];
        if (colors.length > 0) {
          setSelectedColor(colors[0]?.name || '');
        }
        setQuantity(prod.minimumOrderQuantity || 1);

        setupCanvas(prod, areas[initialIdx] || null);
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const setupCanvas = (prod, area) => {
    const pa = area || {
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
  };

  const handlePrintAreaChange = (idx) => {
    setSelectedPrintArea(idx);
    setupCanvas(product, (product.printAreas || [])[idx] || null);
  };

  const isDecorationObject = useCallback((o) => {
    return o._isGrid === true || o._isBackground === true || o._isPrintArea === true;
  }, []);

  const serializeDesign = useCallback(
    (canvas) => {
      const objects = canvas
        .getObjects()
        .filter((o) => !isDecorationObject(o))
        .map((o) => o.toObject(['id', 'name']));
      return JSON.stringify(objects);
    },
    [isDecorationObject]
  );

  const applyDesignState = useCallback(
    (state, callback) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) {
        callback?.();
        return;
      }
      canvas.discardActiveObject();
      canvas
        .getObjects()
        .filter((o) => !isDecorationObject(o))
        .forEach((o) => canvas.remove(o));
      const objects = JSON.parse(state);
      if (!objects.length) {
        canvas.renderAll();
        callback?.();
        return;
      }
      fabric.util.enlivenObjects(objects, (enlivened) => {
        enlivened.forEach((o) => canvas.add(o));
        canvas.renderAll();
        callback?.();
      });
    },
    [isDecorationObject]
  );

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    const state = serializeDesign(canvas);
    undoStack.current.push(state);
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    redoStack.current = [];
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(false);
  }, [serializeDesign]);

  const refreshObjects = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    canvas.renderAll();
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    redoStack.current.push(serializeDesign(canvas));
    const prevState = undoStack.current.pop();
    applyDesignState(prevState, () => {
      refreshObjects();
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
    });
  }, [serializeDesign, applyDesignState, refreshObjects]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    undoStack.current.push(serializeDesign(canvas));
    const nextState = redoStack.current.pop();
    applyDesignState(nextState, () => {
      refreshObjects();
      setCanRedo(redoStack.current.length > 0);
      setCanUndo(true);
    });
  }, [serializeDesign, applyDesignState, refreshObjects]);

  const addText = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    saveCanvasState();
    const text = new fabric.IText('Your Text', {
      fontSize: 36,
      fontFamily: 'Fraunces',
      fill: '#17150F',
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
            width: 120, height: 80, fill: '#1F7A5A',
            left: centerX, top: centerY, originX: 'center', originY: 'center',
          });
          break;
        case 'circle':
          shape = new fabric.Circle({
            radius: 60, fill: '#17150F',
            left: centerX, top: centerY, originX: 'center', originY: 'center',
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            width: 120, height: 100, fill: '#BFAC8A',
            left: centerX, top: centerY, originX: 'center', originY: 'center',
          });
          break;
        case 'line':
          shape = new fabric.Line([centerX - 60, centerY, centerX + 60, centerY], {
            stroke: '#17150F', strokeWidth: 3,
          });
          break;
        case 'star5':
        case 'star6':
        case 'hexagon':
        case 'octagon':
        case 'diamond': {
          const points = getShapePoints(type, 60);
          shape = new fabric.Polygon(points, {
            fill: '#1F7A5A',
            left: centerX, top: centerY, originX: 'center', originY: 'center',
          });
          break;
        }
        default:
          shape = new fabric.Rect({
            width: 100, height: 100, fill: '#1F7A5A',
            left: centerX, top: centerY, originX: 'center', originY: 'center',
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
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120"><path d="${clipart.path}" fill="#17150F"/></svg>`;
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
      const objects = templateJson?.objects || templateJson;
      applyDesignState(JSON.stringify(objects || []), () => {
        refreshObjects();
        toast.success('Template loaded');
      });
    },
    [saveCanvasState, applyDesignState, refreshObjects]
  );

  const goToStep = useCallback(
    (s) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (canvas) {
        const hasDesign = canvas.getObjects().some(
          (o) => !o._isGrid && !o._isBackground && !o._isPrintArea
        );
        if (hasDesign) {
          canvasJSONRef.current = canvasRef.current.toJSON?.() || null;
          previewUrlRef.current = canvasRef.current.toDataUrl?.() || null;
        }
      }
      if (step === 'design' && s !== 'design' && canvas) {
        designStateRef.current = serializeDesign(canvas);
        undoStack.current = [];
        redoStack.current = [];
        setCanUndo(false);
        setCanRedo(false);
      }
      setStep(s);
      window.location.hash = `step=${s}`;
      if (s === 'review') {
        const url = canvasRef.current?.toDataUrl?.() || previewUrlRef.current;
        setDesignPreviewUrl(url || null);
      }
    },
    [step, serializeDesign]
  );

  const handleCanvasReady = useCallback(() => {
    if (designStateRef.current) {
      applyDesignState(designStateRef.current, () => {
        designStateRef.current = null;
        refreshObjects();
        undoStack.current = [];
        redoStack.current = [];
      });
    }
  }, [applyDesignState, refreshObjects]);

  const basePrice = product?.basePrice || product?.price || 299;
  const pricingTier = useMemo(
    () => QUANTITY_TIERS.find((t) => quantity >= t.min && quantity <= t.max),
    [quantity]
  );
  const unitPrice = useMemo(
    () => Math.round(basePrice * (pricingTier?.priceMultiplier || 1)),
    [basePrice, pricingTier]
  );
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const canvas = canvasRef.current?.getCanvas?.();
      const json = canvas ? canvasRef.current.toJSON?.() : canvasJSONRef.current;
      const previewUrl = canvas ? canvasRef.current.toDataUrl?.() : previewUrlRef.current;
      const hasDesign = json?.objects?.length > 0;
      let designId;
      if (hasDesign) {
        designId = designIdRef.current;
        if (!designId) {
          const { data } = await api.post('/designs', {
            productId,
            canvasJSON: json,
            previewImage: previewUrl,
            isDraft: false,
          });
          designId = data.design?._id || data._id;
          designIdRef.current = designId;
        }
      }
      await cartAddToCart(productId, quantity, selectedSize || undefined, selectedColor || undefined, designId);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  }, [product, productId, quantity, selectedSize, selectedColor, cartAddToCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto" />
          <p className="text-sm text-ink/50 mt-4">Loading configurator...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-paper-100 flex flex-col items-center justify-center gap-4">
        <p className="text-ink/60 text-lg">Product not found</p>
        <Link to="/products" className="bg-ink hover:bg-moo-green text-paper-50 font-semibold px-6 py-3 rounded-full transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const printAreas = product.printAreas || [];
  const stepOrder = ['details', 'design', 'review'];
  const currentStepOrder = stepOrder.indexOf(step);

  return (
    <div className="min-h-screen bg-paper-100 pb-24">
      {/* Sticky header with progress */}
      <header className="sticky top-0 z-30 bg-paper-50/95 backdrop-blur border-b border-paper-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => (step === 'details' ? navigate(-1) : goToStep(stepOrder[currentStepOrder - 1]))}
                className="p-2 rounded-full hover:bg-paper-200 transition-colors flex-shrink-0"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5 text-ink" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-display font-semibold text-ink truncate">
                  {product.name}
                </h1>
                <p className="text-xs text-ink/50 hidden sm:block truncate">
                  {printAreas[selectedPrintArea]?.name || 'Custom print'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {STEPS.map((s, i) => {
                const isActive = s.id === step;
                const isDone = stepIndex > i;
                return (
                  <button
                    key={s.id}
                    onClick={() => goToStep(s.id)}
                    className={clsx(
                      'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-ink text-paper-50'
                        : isDone
                          ? 'bg-moo-green text-paper-50'
                          : 'bg-paper-200 text-ink/50 hover:bg-paper-300'
                    )}
                  >
                    <span className="w-4 h-4 rounded-full bg-paper-50/20 text-[10px] flex items-center justify-center">
                      {isDone ? <Check className="w-2.5 h-2.5" /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* STEP 1: DETAILS */}
      {step === 'details' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-moo-green uppercase tracking-widest mb-2">Step 1 of 3</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Choose your options</h2>
            <p className="mt-2 text-ink/60">Pick a print area{!hideQuantity && ', size, color and quantity'} to get started.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Print area */}
              {printAreas.length > 0 && (
                <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler className="w-4 h-4 text-moo-green" />
                    <h3 className="font-display font-semibold text-ink">Print Area</h3>
                  </div>
                  <div className="space-y-2">
                    {printAreas.map((area, i) => (
                      <button
                        key={i}
                        onClick={() => handlePrintAreaChange(i)}
                        className={clsx(
                          'w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all',
                          selectedPrintArea === i
                            ? 'border-moo-green bg-moo-sage'
                            : 'border-paper-200 hover:border-paper-300'
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink">{area.name || `Area ${i + 1}`}</p>
                          {area.description && (
                            <p className="text-xs text-ink/60 mt-0.5">{area.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-ink/50 flex-shrink-0 ml-3">
                          {area.width} × {area.height}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {!hideQuantity && sizes.length > 0 && (
                <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-moo-green" />
                    <h3 className="font-display font-semibold text-ink">Size</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const label = typeof s === 'string' ? s : s.name || s.label || s;
                      const extra = typeof s === 'object' && s.additionalPrice ? s.additionalPrice : 0;
                      return (
                        <button
                          key={label}
                          onClick={() => setSelectedSize(label)}
                          className={clsx(
                            'px-4 py-2.5 text-sm rounded-full border-2 font-semibold transition-colors',
                            selectedSize === label
                              ? 'border-ink bg-ink text-paper-50'
                              : 'border-paper-300 text-ink/70 hover:border-ink/40'
                          )}
                        >
                          {label}
                          {extra > 0 && <span className="text-xs opacity-70 ml-1">+₹{extra}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color */}
              {!hideQuantity && colors.length > 0 && (
                <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-4 h-4 text-moo-green" />
                    <h3 className="font-display font-semibold text-ink">Color</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c) => {
                      const name = c.name || c;
                      const hex = c.hexCode || c.hex || '#ccc';
                      const extra = c.additionalPrice || 0;
                      return (
                        <button
                          key={name}
                          onClick={() => setSelectedColor(name)}
                          className={clsx(
                            'flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all',
                            selectedColor === name
                              ? 'border-ink bg-paper-100'
                              : 'border-paper-300 hover:border-ink/40'
                          )}
                          title={name}
                        >
                          <span
                            className="w-6 h-6 rounded-full border border-paper-300 flex-shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="text-xs font-medium text-ink/80">{name}</span>
                          {extra > 0 && <span className="text-xs text-ink/50">+₹{extra}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accepted formats */}
              {printAreas[selectedPrintArea]?.acceptedFormats?.length > 0 && (
                <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
                  <h3 className="font-display font-semibold text-ink mb-2">Accepted formats</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {printAreas[selectedPrintArea].acceptedFormats.map((f) => (
                      <span key={f} className="text-xs font-medium bg-paper-200 text-ink/70 px-2.5 py-1 rounded-full uppercase">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity + price */}
            <div className="space-y-6">
              {!hideQuantity && (
                <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-4 h-4 text-moo-green" />
                    <h3 className="font-display font-semibold text-ink">Quantity</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(product.minimumOrderQuantity || 1, quantity - 1))}
                      className="w-10 h-10 rounded-full border-2 border-paper-300 flex items-center justify-center hover:border-ink/40 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-ink" />
                    </button>
                    <input
                      type="number"
                      min={product.minimumOrderQuantity || 1}
                      max={10000}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(product.minimumOrderQuantity || 1, parseInt(e.target.value) || 1))}
                      className="w-24 text-center px-3 py-2 border-2 border-paper-300 rounded-xl text-lg font-bold text-ink outline-none focus:border-moo-green"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full border-2 border-paper-300 flex items-center justify-center hover:border-ink/40 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-ink" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
                    {QUANTITY_TIERS.map((tier) => {
                      const active = quantity >= tier.min && quantity <= tier.max;
                      return (
                        <div
                          key={tier.min}
                          className={clsx(
                            'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors',
                            active ? 'bg-moo-sage border border-moo-green/40' : 'border border-transparent'
                          )}
                        >
                          <span className="text-ink/70">
                            {tier.max === Infinity ? `${tier.min}+` : `${tier.min} – ${tier.max}`} units
                          </span>
                          <span className="font-semibold text-ink">
                            ₹{Math.round(basePrice * tier.priceMultiplier)}
                            <span className="text-xs font-normal text-ink/50 ml-1">/unit</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price summary */}
              <div className="bg-ink text-paper-100 rounded-2xl p-6">
                <div className="flex items-center justify-between text-sm text-paper-100/70">
                  <span>Unit price</span>
                  <span>₹{unitPrice}</span>
                </div>
                {!hideQuantity && (
                  <div className="flex items-center justify-between text-sm text-paper-100/70 mt-2">
                    <span>Quantity</span>
                    <span>× {quantity}</span>
                  </div>
                )}
                {!hideQuantity && pricingTier && pricingTier.priceMultiplier < 1 && (
                  <div className="flex items-center justify-between text-sm text-moo-green mt-2">
                    <span>Bulk discount ({Math.round((1 - pricingTier.priceMultiplier) * 100)}% off)</span>
                    <span>-₹{(basePrice * quantity - totalPrice).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xl font-bold mt-3 pt-3 border-t border-paper-100/20">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => goToStep('design')}
                className="w-full flex items-center justify-center gap-2 bg-moo-green hover:bg-ink text-paper-50 font-semibold py-4 rounded-full transition-colors text-lg shadow-lg shadow-moo-green/20"
              >
                Continue to Design
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DESIGN */}
      {step === 'design' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-moo-green uppercase tracking-widest mb-2">Step 2 of 3</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Design your print</h2>
            <p className="mt-2 text-ink/60">Add text, upload artwork, or start from a template.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left toolbar */}
            <aside className="lg:w-72 flex-shrink-0 bg-paper-50 rounded-2xl border border-paper-200 overflow-hidden flex flex-col">
              <div className="flex border-b border-paper-200 overflow-x-auto no-scrollbar">
                {DESIGN_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDesignTab(tab.id)}
                    className={clsx(
                      'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors min-w-[64px]',
                      activeDesignTab === tab.id
                        ? 'text-moo-green bg-moo-sage/60'
                        : 'text-ink/50 hover:text-ink/80 hover:bg-paper-100'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-b border-paper-200">
                <div className="flex gap-1">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-1.5 rounded-lg hover:bg-paper-200 transition-colors disabled:opacity-30"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4 text-ink" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-1.5 rounded-lg hover:bg-paper-200 transition-colors disabled:opacity-30"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo2 className="w-4 h-4 text-ink" />
                  </button>
                </div>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    showGrid ? 'text-moo-green bg-moo-sage' : 'text-ink/60 hover:bg-paper-200'
                  )}
                  title="Toggle Grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 max-h-[420px]">
                {activeDesignTab === 'templates' && <DesignTemplates onLoadTemplate={loadTemplate} />}
                {activeDesignTab === 'upload' && <ImageUploader onImageAdd={addImageToCanvas} />}
                {activeDesignTab === 'text' && (
                  <div className="space-y-3">
                    <button
                      onClick={addText}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ink text-paper-50 rounded-xl font-semibold hover:bg-moo-green transition-colors text-sm"
                    >
                      <Type className="w-4 h-4" />
                      Add Text
                    </button>
                    <p className="text-xs text-ink/50 text-center">
                      Click the text on canvas to edit, then use the handles to resize.
                    </p>
                  </div>
                )}
                {activeDesignTab === 'shapes' && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: 'rect', icon: Square, label: 'Rectangle' },
                      { type: 'circle', icon: Circle, label: 'Circle' },
                      { type: 'triangle', icon: Triangle, label: 'Triangle' },
                      { type: 'line', icon: Minus, label: 'Line' },
                      { type: 'diamond', icon: Star, label: 'Diamond' },
                      { type: 'star5', icon: Star, label: 'Star' },
                      { type: 'hexagon', icon: Star, label: 'Hexagon' },
                      { type: 'octagon', icon: Star, label: 'Octagon' },
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => addShape(type)}
                        className="flex flex-col items-center gap-1 p-2 bg-paper-100 border border-paper-200 rounded-xl hover:border-moo-green hover:bg-moo-sage/40 transition-all"
                        title={label}
                      >
                        <Icon className="w-5 h-5 text-ink/70" />
                        <span className="text-[10px] text-ink/50">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {activeDesignTab === 'clipart' && <ClipartPanel onClipartAdd={addClipart} />}
              </div>
            </aside>

            {/* Canvas */}
            <main className="flex-1 bg-paper-50 rounded-2xl border border-paper-200 p-4 min-h-[520px]">
              <EditorCanvas
                ref={canvasRef}
                productImageUrl={productImage}
                printArea={printArea}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                zoom={zoom}
                onZoomChange={setZoom}
                showGrid={showGrid}
                onObjectSelected={() => {}}
                onObjectModified={refreshObjects}
                onModifyStart={saveCanvasState}
                onCanvasReady={handleCanvasReady}
                onMouseMove={(pos) => setCursorPos(pos)}
              />
              <div className="mt-2 flex items-center justify-between px-1 text-xs text-ink/50">
                <span>{canvasWidth} × {canvasHeight} px</span>
                <span>X: {cursorPos.x} Y: {cursorPos.y}</span>
              </div>
            </main>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 max-w-2xl mx-auto">
            <button
              onClick={() => goToStep('details')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-paper-300 text-ink font-semibold hover:border-ink transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Details
            </button>
            <button
              onClick={() => goToStep('review')}
              className="flex items-center justify-center gap-2 bg-moo-green hover:bg-ink text-paper-50 font-semibold py-3.5 rounded-full transition-colors text-lg shadow-lg shadow-moo-green/20"
            >
              Review Design
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {step === 'review' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-moo-green uppercase tracking-widest mb-2">Step 3 of 3</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Review your order</h2>
            <p className="mt-2 text-ink/60">Make sure everything looks perfect before adding to cart.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mockup */}
            <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6 flex items-center justify-center min-h-[400px]">
              <div className="relative max-w-sm w-full">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full rounded-xl shadow-lg" />
                )}
                {designPreviewUrl && (
                  <img
                    src={designPreviewUrl}
                    alt="Design overlay"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                )}
                {!product.image && !designPreviewUrl && (
                  <div className="w-full aspect-square bg-paper-200 rounded-xl flex items-center justify-center">
                    <Package className="w-16 h-16 text-ink/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
              <h3 className="font-display font-semibold text-ink text-lg mb-4">Order summary</h3>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/50">Product</dt>
                  <dd className="font-semibold text-ink text-right">{product.name}</dd>
                </div>
                {printAreas[selectedPrintArea] && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Print area</dt>
                    <dd className="font-semibold text-ink text-right">
                      {printAreas[selectedPrintArea].name}
                      <span className="text-ink/50 font-normal ml-1">
                        ({printAreas[selectedPrintArea].width} × {printAreas[selectedPrintArea].height})
                      </span>
                    </dd>
                  </div>
                )}
                {!hideQuantity && selectedSize && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Size</dt>
                    <dd className="font-semibold text-ink">{selectedSize}</dd>
                  </div>
                )}
                {!hideQuantity && selectedColor && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Color</dt>
                    <dd className="font-semibold text-ink">{selectedColor}</dd>
                  </div>
                )}
                {!hideQuantity && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Quantity</dt>
                    <dd className="font-semibold text-ink">{quantity}</dd>
                  </div>
                )}
                {!hideQuantity && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Unit price</dt>
                    <dd className="font-semibold text-ink">₹{unitPrice}</dd>
                  </div>
                )}
                {!hideQuantity && pricingTier && pricingTier.priceMultiplier < 1 && (
                  <div className="flex justify-between gap-4 text-moo-green">
                    <dt>Bulk discount ({Math.round((1 - pricingTier.priceMultiplier) * 100)}% off)</dt>
                    <dd className="font-semibold">-₹{(basePrice * quantity - totalPrice).toLocaleString()}</dd>
                  </div>
                )}
              </dl>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-paper-300">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display text-3xl font-bold text-ink">₹{totalPrice.toLocaleString()}</span>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => goToStep('design')}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-paper-300 text-ink font-semibold hover:border-ink transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Design
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex items-center justify-center gap-2 bg-moo-green hover:bg-ink text-paper-50 font-semibold py-4 rounded-full transition-colors text-lg shadow-lg shadow-moo-green/20 disabled:opacity-60"
                >
                  {addingToCart ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Add to Cart — ₹{totalPrice.toLocaleString()}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
