import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import {
  ChevronLeft, Check, Minus, Plus, ShoppingCart, Type,
  Square, Circle, Triangle, Star, Upload, Layout, Palette, Undo2, Redo2,
  Grid3X3, Loader2, Ruler, Package, ArrowRight, Share2, Archive, X, Box, Image,
} from 'lucide-react';
import { clsx } from 'clsx';
import EditorCanvas from '../../components/editor/EditorCanvas';
import DesignTemplates from '../../components/editor/DesignTemplates';
import ClipartPanel from '../../components/editor/ClipartPanel';
import ImageUploader from '../../components/editor/ImageUploader';
import PhotosPanel from '../../components/editor/PhotosPanel';
import BusinessCard3DPreview from '../../components/editor/BusinessCard3DPreview';
import DeliveryNote from '../../components/common/DeliveryNote';
import { useCart } from '../../context/CartContext';
import { useCartFly } from '../../context/CartFlyContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const DRAFT_KEY = (pid) => `printjack-config-draft-${pid}`;

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
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'templates', label: 'Templates', icon: Layout },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'shapes', label: 'Shapes', icon: Square },
  { id: 'clipart', label: 'Clipart', icon: Star },
];

const MAX_UNDO = 50;

const buildCardMockupSvg = (w, h) => {
  const rx = Math.max(6, Math.round(Math.min(w, h) * 0.035));
  const ix = Math.max(4, Math.round(Math.min(w, h) * 0.022));
  const inset = Math.max(10, Math.round(Math.min(w, h) * 0.06));
  const midY = Math.round(h / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fdfbf6"/>
      <stop offset="1" stop-color="#f1e7d4"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="${rx}" fill="url(#cg)"/>
  <rect x="${ix}" y="${ix}" width="${w - ix * 2}" height="${h - ix * 2}" rx="${Math.max(3, rx - 2)}" fill="none" stroke="#d9b45b" stroke-opacity="0.65" stroke-width="2"/>
  <line x1="${inset}" y1="${midY}" x2="${w - inset}" y2="${midY}" stroke="#e6d1a0" stroke-opacity="0.7" stroke-width="2"/>
  <rect x="${Math.round(w * 0.08)}" y="${Math.round(h * 0.2)}" width="${Math.round(w * 0.5)}" height="${Math.round(h * 0.16)}" rx="3" fill="#c9a64e" fill-opacity="0.35"/>
</svg>`;
};

const svgToPngDataUrl = (svg, width, height) =>
  new Promise((resolve) => {
    try {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          resolve('data:image/svg+xml;utf8,' + encodeURIComponent(svg));
        }
      };
      img.onerror = () => resolve('data:image/svg+xml;utf8,' + encodeURIComponent(svg));
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    } catch (err) {
      resolve(null);
    }
  });

export default function ProductConfiguratorPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart: cartAddToCart } = useCart();
  const { flyToCart } = useCartFly();

  const canvasRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const designIdRef = useRef(null);
  const backDesignIdRef = useRef(null);
  const designStateRef = useRef(null);
  const canvasJSONRef = useRef(null);
  const previewUrlRef = useRef(null);
  const addToCartRef = useRef(null);
  const resumeJSONRef = useRef(null);
  const facesRef = useRef([{ canvasJSON: null, previewUrl: null, designState: null }]);

  const { isAuthenticated } = useAuth();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hideQuantity = searchParams.get('hideOptions') === 'true';
  const designKey = searchParams.get('area');
  const isDoubleSided = searchParams.get('sides') === 'double';
  const faceLabels = ['Front', 'Back'];

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
  const [activeFace, setActiveFace] = useState(0);
  const [facePreviews, setFacePreviews] = useState([]);

  const [activeDesignTab, setActiveDesignTab] = useState('templates');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftExists, setDraftExists] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [show3DPreview, setShow3DPreview] = useState(false);

  const isBusinessCard = useCallback((prod) => {
    if (!prod) return false;
    const slug = prod.slug?.toLowerCase() || '';
    const name = prod.name?.toLowerCase() || '';
    const category = prod.category?.name?.toLowerCase() || '';
    return slug.includes('business-card') || name.includes('business card') || category.includes('business card');
  }, []);

  useEffect(() => {
    const readHash = () => {
      const m = window.location.hash.match(/stage=(\w+)/);
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
        const qtyParam = parseInt(searchParams.get('qty') || '', 10);
        if (qtyParam >= (prod.minimumOrderQuantity || 1)) {
          setQuantity(qtyParam);
        }

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

  useEffect(() => {
    const key = DRAFT_KEY(productId);
    try {
      const existing = localStorage.getItem(key);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed?.designId) {
          designIdRef.current = parsed.designId;
          setDraftExists(true);
        }
      }
    } catch {
      // ignore corrupt draft
    }
  }, [productId]);

  const handleResume = async () => {
    const key = DRAFT_KEY(productId);
    const raw = localStorage.getItem(key);
    let designId = designIdRef.current;
    try {
      if (raw) {
        const parsed = JSON.parse(raw);
        designId = parsed.designId || designId;
      }
    } catch {
      // fall through
    }
    if (!designId) return;
    setResuming(true);
    try {
      const { data } = await api.get(`/designs/${designId}`);
      const design = data.design || data;
      const json = design.canvasJSON || design.canvasData;
      if (json) {
        resumeJSONRef.current = json;
      }
      if (design.quantity) setQuantity(design.quantity);
      if (design.size) setSelectedSize(design.size);
      if (design.color) setSelectedColor(design.color);
      setDraftExists(false);
      goToStep('design');
      toast.success('Draft restored');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load your draft');
    } finally {
      setResuming(false);
    }
  };

  const handleSaveDraft = async () => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    setSavingDraft(true);
    try {
      const json = canvasRef.current.toJSON?.() || null;
      const previewUrl = canvasRef.current.toDataUrl?.() || null;
      let designId = designIdRef.current;
      if (designId) {
        await api.put(`/designs/${designId}`, {
          canvasJSON: json,
          previewImage: previewUrl,
          isDraft: true,
          printSpecifications: {
            width: canvasWidth,
            height: canvasHeight,
            bleed: 3,
            colorMode: 'RGB',
          },
        });
      } else {
        const { data } = await api.post('/designs', {
          productId,
          name: `${product?.name || 'Product'} draft`,
          canvasJSON: json,
          previewImage: previewUrl,
          isDraft: true,
          printSpecifications: {
            width: canvasWidth,
            height: canvasHeight,
            bleed: 3,
            colorMode: 'RGB',
          },
        });
        designId = data.design?._id || data._id;
        designIdRef.current = designId;
      }
      try {
        localStorage.setItem(DRAFT_KEY(productId), JSON.stringify({ designId }));
      } catch {
        // storage unavailable
      }
      setDraftExists(true);
      toast.success('Draft saved — resume anytime');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please login to save drafts');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY(productId));
    } catch {
      // ignore
    }
    designIdRef.current = null;
    setDraftExists(false);
    toast.success('Draft cleared');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Configurator link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

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
    const cw = normalizedPA.width + (normalizedPA.x || 0) * 2 || 500;
    const ch = normalizedPA.height + (normalizedPA.y || 0) * 2 || 500;
    setCanvasWidth(cw);
    setCanvasHeight(ch);
    const existingImage = prod.mockupImage || prod.image || null;
    setProductImage(existingImage);
    if (!existingImage && isBusinessCard(prod)) {
      svgToPngDataUrl(buildCardMockupSvg(Math.round(cw), Math.round(ch)), Math.round(cw), Math.round(ch)).then((url) => {
        if (url) setProductImage(url);
      });
    }
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
        .map((o) => {
          try {
            // Fix text objects with undefined styles before serialization
            if (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox') {
              if (!o.styles || typeof o.styles !== 'object') {
                o.styles = {};
              }
              // Ensure each line has styles
              const textLines = o._textLines || (o.text ? o.text.split('\n') : ['']);
              textLines.forEach((_, lineIndex) => {
                if (!o.styles[lineIndex]) {
                  o.styles[lineIndex] = {};
                }
              });
            }
            return o.toObject(['id', 'name']);
          } catch (err) {
            console.warn('Failed to serialize object:', o, err);
            return null;
          }
        })
        .filter(Boolean);
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
      let objects;
      try {
        objects = JSON.parse(state);
      } catch (err) {
        console.warn('Failed to parse design state:', err);
        canvas.renderAll();
        callback?.();
        return;
      }
      if (!objects.length) {
        canvas.renderAll();
        callback?.();
        return;
      }
      try {
        fabric.util.enlivenObjects(objects, (enlivened) => {
          enlivened.forEach((o) => canvas.add(o));
          canvas.renderAll();
          callback?.();
        });
      } catch (err) {
        console.warn('Failed to enliven objects:', err);
        canvas.renderAll();
        callback?.();
      }
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
        const w = img.width || canvasWidth;
        const h = img.height || canvasHeight;
        const maxDim = Math.min(canvasWidth, canvasHeight) * 0.6;
        let scale = Math.min(maxDim / w, maxDim / h, 1);
        if (!Number.isFinite(scale) || scale <= 0) scale = 0.5;
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
        toast.success('Image added to your design');
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

  const addPhoto = useCallback(
    (photo) => {
      const canvas = canvasRef.current?.getCanvas?.();
      if (!canvas) return;
      saveCanvasState();
      const svg = photo.svg;
      fabric.loadSVGFromString(svg, (objects, options) => {
        const group = fabric.util.groupSVGElements(objects, options);
        const cw = canvasWidth;
        const ch = canvasHeight;
        const scale = Math.max(cw / group.width, ch / group.height) * 1.02;
        group.set({
          left: cw / 2,
          top: ch / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          id: `photo-${Date.now()}`,
          name: photo.name,
        });
        canvas.add(group);
        canvas.sendToBack(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
        refreshObjects();
        toast.success(`${photo.name} background added`);
      });
    },
    [canvasWidth, canvasHeight, saveCanvasState, refreshObjects]
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
          if (isDoubleSided) {
            facesRef.current[activeFace] = {
              canvasJSON: canvasJSONRef.current,
              previewUrl: previewUrlRef.current,
              designState: serializeDesign(canvas),
            };
          }
        }
      }
      if (step === 'design' && s !== 'design' && canvas) {
        designStateRef.current = serializeDesign(canvas);
        undoStack.current = [];
        redoStack.current = [];
        setCanUndo(false);
        setCanRedo(false);
      }
      // Restore face state when going back to design step
      if (s === 'design' && step === 'review' && isDoubleSided) {
        const face = facesRef.current[activeFace];
        if (face?.designState) {
          designStateRef.current = face.designState;
        }
      }
      setStep(s);
      window.location.hash = `stage=${s}`;
      if (s === 'review') {
        if (isDoubleSided) {
          const previews = (facesRef.current || []).map((f) => f?.previewUrl || null);
          setFacePreviews(previews);
          setDesignPreviewUrl(previews[0] || null);
          const emptyFace = faceLabels.findIndex((_, i) => !previews[i]);
          if (emptyFace !== -1) {
            toast(`You haven't designed the ${faceLabels[emptyFace]} yet — you can still review.`, {
              icon: '⚠️',
            });
          }
        } else {
          const url = canvasRef.current?.toDataUrl?.() || previewUrlRef.current;
          setDesignPreviewUrl(url || null);
        }
      }
    },
    [step, serializeDesign, isDoubleSided, activeFace]
  );

  const handleCanvasReady = useCallback(() => {
    if (resumeJSONRef.current) {
      const json = resumeJSONRef.current;
      resumeJSONRef.current = null;
      canvasRef.current?.loadFromJSON?.(json);
      refreshObjects();
      return;
    }
    if (isDoubleSided) {
      const face = facesRef.current[activeFace];
      if (face?.designState) {
        applyDesignState(face.designState, () => {
          refreshObjects();
          undoStack.current = [];
          redoStack.current = [];
        });
        return;
      }
      if (designStateRef.current) {
        applyDesignState(designStateRef.current, () => {
          designStateRef.current = null;
          refreshObjects();
          undoStack.current = [];
          redoStack.current = [];
        });
      }
      return;
    }
    if (designStateRef.current) {
      applyDesignState(designStateRef.current, () => {
        designStateRef.current = null;
        refreshObjects();
        undoStack.current = [];
        redoStack.current = [];
      });
    }
  }, [applyDesignState, refreshObjects, isDoubleSided, activeFace]);

  // Restore face design when navigating back to design step
  useEffect(() => {
    if (step === 'design' && isDoubleSided) {
      const face = facesRef.current[activeFace];
      if (face?.designState) {
        applyDesignState(face.designState, () => {
          refreshObjects();
          undoStack.current = [];
          redoStack.current = [];
          setCanUndo(false);
          setCanRedo(false);
        });
      }
    }
  }, [step, isDoubleSided, activeFace, applyDesignState, refreshObjects]);

  const saveActiveFaceState = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;
    facesRef.current[activeFace] = {
      canvasJSON: canvasRef.current.toJSON?.() || null,
      previewUrl: canvasRef.current.toDataUrl?.() || null,
      designState: serializeDesign(canvas),
    };
  }, [activeFace, serializeDesign]);

  const switchFace = useCallback(
    (idx) => {
      if (idx === activeFace) return;
      saveActiveFaceState();
      setActiveFace(idx);
      undoStack.current = [];
      redoStack.current = [];
      setCanUndo(false);
      setCanRedo(false);
      const face = facesRef.current[idx];
      if (face?.designState) {
        applyDesignState(face.designState, () => {
          refreshObjects();
        });
      } else {
        canvasRef.current?.clearCanvas?.();
        refreshObjects();
      }
    },
    [activeFace, saveActiveFaceState, applyDesignState, refreshObjects]
  );

  const loadProductTemplate = useCallback(
    (template) => {
      addImageToCanvas(template.url || template.thumbnail, template.name || 'Template');
    },
    [addImageToCanvas]
  );

  const basePrice = product?.basePrice || product?.price || 299;
  const bulkTiers = Array.isArray(product?.bulkPricing) && product.bulkPricing.length > 0 ? product.bulkPricing : null;
  const pricingTier = useMemo(
    () => {
      if (bulkTiers) {
        const tier = bulkTiers
          .filter((b) => quantity >= b.minQty && quantity <= (b.maxQty ?? Infinity))
          .sort((a, b) => b.minQty - a.minQty)[0];
        return tier ? { price: tier.price, isBulk: true } : null;
      }
      return QUANTITY_TIERS.find((t) => quantity >= t.min && quantity <= t.max);
    },
    [quantity, bulkTiers]
  );
  const unitPrice = useMemo(
    () => (pricingTier?.isBulk ? pricingTier.price : Math.round(basePrice * (pricingTier?.priceMultiplier || 1))),
    [basePrice, pricingTier]
  );
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const handleAddToCart = useCallback(async (e) => {
    if (!product) return;
    const sourceEl = e?.currentTarget || addToCartRef.current;
    setAddingToCart(true);
    try {
      if (isDoubleSided) {
        saveActiveFaceState();
        const faces = [];
        let primaryDesignId;
        for (let i = 0; i < 2; i++) {
          const face = facesRef.current[i];
          const isActive = i === activeFace;
          const canvas = isActive ? canvasRef.current?.getCanvas?.() : null;
          const json = face?.canvasJSON || (isActive ? canvasRef.current?.toJSON?.() : null);
          const previewUrl = face?.previewUrl || (isActive ? canvasRef.current?.toDataUrl?.() : null);
          const hasDesign =
            (canvas ? canvas.getObjects().some((o) => !isDecorationObject(o)) : false) ||
            json?.objects?.length > 0 ||
            (() => {
              if (!face?.designState) return false;
              try {
                const arr = JSON.parse(face.designState);
                return Array.isArray(arr) && arr.length > 0;
              } catch {
                return false;
              }
            })();
          if (!hasDesign) {
            toast.error(`Please design the ${faceLabels[i]} of your card first`);
            setAddingToCart(false);
            return;
          }
          let designId = i === 0 ? designIdRef.current : backDesignIdRef.current;
          if (!designId) {
            const { data } = await api.post('/designs', {
              productId,
              name: `${product.name} — ${faceLabels[i]}`,
              canvasJSON: json,
              previewImage: previewUrl,
              isDraft: false,
              printSpecifications: {
                width: canvasWidth,
                height: canvasHeight,
                bleed: 3,
                colorMode: 'RGB',
              },
            });
            designId = data.design?._id || data._id;
            if (i === 0) designIdRef.current = designId;
            else backDesignIdRef.current = designId;
          }
          faces.push({ name: faceLabels[i], designId, preview: previewUrl });
          if (i === 0) primaryDesignId = designId;
        }
        await cartAddToCart(
          productId,
          quantity,
          selectedSize || undefined,
          selectedColor || undefined,
          primaryDesignId,
          {
            sides: 'double',
            faces,
            preview: faces[0]?.preview || null,
          },
          { width: canvasWidth, height: canvasHeight, bleed: 3, colorMode: 'RGB' }
        );
      } else {
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
              printSpecifications: {
                width: canvasWidth,
                height: canvasHeight,
                bleed: 3,
                colorMode: 'RGB',
              },
            });
            designId = data.design?._id || data._id;
            designIdRef.current = designId;
          }
        }
        await cartAddToCart(
          productId,
          quantity,
          selectedSize || undefined,
          selectedColor || undefined,
          designId,
          undefined,
          { width: canvasWidth, height: canvasHeight, bleed: 3, colorMode: 'RGB' }
        );
      }
      try {
        localStorage.removeItem(DRAFT_KEY(productId));
      } catch {
        // ignore
      }
      setDraftExists(false);
      toast.success('Added to cart!');
      if (addToCartRef.current || sourceEl) {
        flyToCart(sourceEl || addToCartRef.current, productImage || product?.image || product?.images?.[0]?.url || '/placeholder-product.png', { size: 52, trailCount: 24, waveAmp: 34, waveFreq: 3.5 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  }, [product, productId, quantity, selectedSize, selectedColor, cartAddToCart, flyToCart, productImage, isDoubleSided, activeFace, saveActiveFaceState, canvasWidth, canvasHeight]);

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
        <Link to="/products" className="bg-ink hover:bg-pj-green text-paper-50 font-semibold px-6 py-3 rounded-full transition-colors">
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
      <Helmet>
        <title>{product.name ? `Customize ${product.name} | PrintJack` : 'Customize | PrintJack'}</title>
        <meta
          name="description"
          content={`Design and order custom ${product.name || 'printed products'} with bulk pricing on PrintJack. Choose print area, size, colour and quantity, then personalise online.`}
        />
        <meta property="og:title" content={`Customize ${product.name || 'Products'} | PrintJack`} />
        <meta
          property="og:description"
          content={`Design your own ${product.name || 'custom product'} online with free design tools and bulk pricing.`}
        />
        {(product.image || product.images?.[0]?.url) && (
          <meta property="og:image" content={product.image || product.images?.[0]?.url} />
        )}
        <meta property="og:type" content="product" />
      </Helmet>

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
                  {isDoubleSided
                    ? `${faceLabels[activeFace]} side · ${printAreas[selectedPrintArea]?.name || 'Custom print'}`
                    : printAreas[selectedPrintArea]?.name || 'Custom print'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-paper-200 transition-colors"
                title={copied ? 'Link copied!' : 'Share this configurator'}
              >
                {copied ? <Check className="w-4 h-4 text-pj-green" /> : <Share2 className="w-4 h-4 text-ink" />}
              </button>
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
                          ? 'bg-pj-green text-paper-50'
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
            <div className="text-xs text-ink/50 flex-shrink-0 hidden md:block">
              Step {stepIndex + 1} of {STEPS.length}
            </div>
          </div>
        </div>
      </header>

      {/* Draft banner */}
      {draftExists && step !== 'review' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center justify-between gap-3 bg-pj-sage border border-pj-green/40 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Archive className="w-4 h-4 text-pj-green flex-shrink-0" />
              <p className="text-sm text-ink/80 truncate">
                You have a saved draft for this product.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleResume}
                disabled={resuming}
                className="flex items-center gap-1.5 px-4 py-2 bg-pj-green text-paper-50 text-sm font-semibold rounded-full hover:bg-ink transition-colors disabled:opacity-60"
              >
                {resuming && <Loader2 className="w-4 h-4 animate-spin" />}
                {resuming ? 'Restoring...' : 'Resume draft'}
              </button>
              <button
                onClick={handleClearDraft}
                className="p-2 rounded-full hover:bg-paper-200 transition-colors"
                title="Discard draft"
              >
                <X className="w-4 h-4 text-ink/60" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: DETAILS */}
      {step === 'details' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-pj-green uppercase tracking-widest mb-2">Step 1 of 3</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Choose your options</h2>
            <p className="mt-2 text-ink/60">Pick a print area{!hideQuantity && ', size, color and quantity'} to get started.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Print area */}
              {printAreas.length > 0 && (
                <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler className="w-4 h-4 text-pj-green" />
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
                            ? 'border-pj-green bg-pj-sage'
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
                    <Package className="w-4 h-4 text-pj-green" />
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
                    <Palette className="w-4 h-4 text-pj-green" />
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
                    <ShoppingCart className="w-4 h-4 text-pj-green" />
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
                      className="w-24 text-center px-3 py-2 border-2 border-paper-300 rounded-xl text-lg font-bold text-ink outline-none focus:border-pj-green"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full border-2 border-paper-300 flex items-center justify-center hover:border-ink/40 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-ink" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
                    {(bulkTiers || QUANTITY_TIERS).map((tier) => {
                      const min = tier.minQty ?? tier.min;
                      const max = tier.maxQty ?? tier.max;
                      const price = tier.price ?? Math.round(basePrice * tier.priceMultiplier);
                      const active = quantity >= min && quantity <= max;
                      return (
                        <div
                          key={min}
                          className={clsx(
                            'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors',
                            active ? 'bg-pj-sage border border-pj-green/40' : 'border border-transparent'
                          )}
                        >
                          <span className="text-ink/70">
                            {max === Infinity ? `${min}+` : `${min} – ${max}`} units
                          </span>
                          <span className="font-semibold text-ink">
                            ₹{price}
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
                  <div className="flex items-center justify-between text-sm text-pj-green mt-2">
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
                className="w-full flex items-center justify-center gap-2 bg-pj-green hover:bg-ink text-paper-50 font-semibold py-4 rounded-full transition-colors text-lg shadow-lg shadow-pj-green/20"
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-pj-green uppercase tracking-widest mb-1">Step 2 of 3</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {isDoubleSided ? `Design your ${faceLabels[activeFace].toLowerCase()} side` : 'Design your print'}
              </h2>
            </div>
            <p className="hidden md:block text-sm text-ink/50">
              {isDoubleSided
                ? 'You will design both the front and back of your card.'
                : 'Add text, upload artwork, or start from a template — all online.'}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: slim tool rail + content panel */}
            <div className="flex gap-3 lg:w-80 flex-shrink-0">
              <aside className="w-16 flex-shrink-0 bg-paper-50 rounded-2xl border border-paper-200 overflow-hidden flex flex-col items-center py-2">
                {DESIGN_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDesignTab(tab.id)}
                    className={clsx(
                      'w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors mb-1',
                      activeDesignTab === tab.id
                        ? 'text-pj-green bg-pj-sage'
                        : 'text-ink/50 hover:text-ink/80 hover:bg-paper-100'
                    )}
                    title={tab.label}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
                <div className="mt-auto pt-2 border-t border-paper-200 w-full flex flex-col items-center gap-1 py-1">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="w-12 h-10 rounded-lg hover:bg-paper-200 transition-colors disabled:opacity-30 flex items-center justify-center"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4 text-ink" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="w-12 h-10 rounded-lg hover:bg-paper-200 transition-colors disabled:opacity-30 flex items-center justify-center"
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo2 className="w-4 h-4 text-ink" />
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={clsx(
                      'w-12 h-10 rounded-lg transition-colors flex items-center justify-center',
                      showGrid ? 'text-pj-green bg-pj-sage' : 'text-ink/60 hover:bg-paper-200'
                    )}
                    title="Toggle Grid"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </aside>

              <div className="flex-1 min-w-0 bg-paper-50 rounded-2xl border border-paper-200 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-paper-200">
                  <h4 className="text-sm font-semibold text-ink">
                    {DESIGN_TABS.find((t) => t.id === activeDesignTab)?.label || 'Tools'}
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto p-3 max-h-[440px]">
                {activeDesignTab === 'photos' && <PhotosPanel onPhotoAdd={addPhoto} />}
                {activeDesignTab === 'templates' && (
                  <div className="space-y-4">
                    {product.templates?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-2">
                          Product templates
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {product.templates.map((tpl) => (
                            <button
                              key={tpl._id || tpl.url || tpl.name}
                              onClick={() => loadProductTemplate(tpl)}
                              className="group border border-paper-200 rounded-xl overflow-hidden hover:border-pj-green hover:shadow-md transition-all"
                              title={tpl.name}
                            >
                              <div className="aspect-[4/3] bg-paper-100 flex items-center justify-center overflow-hidden">
                                {(tpl.thumbnail || tpl.url) ? (
                                  <img
                                    src={tpl.thumbnail || tpl.url}
                                    alt={tpl.name || 'Template'}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Layout className="w-6 h-6 text-ink/30" />
                                )}
                              </div>
                              <p className="p-2 text-xs font-medium text-ink/70 truncate">{tpl.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-2">
                        Built-in templates
                      </h4>
                      <DesignTemplates onLoadTemplate={loadTemplate} />
                    </div>
                  </div>
                )}
                {activeDesignTab === 'upload' && (
                  <ImageUploader
                    onImageAdd={addImageToCanvas}
                    acceptedFormats={printAreas[selectedPrintArea]?.acceptedFormats || []}
                    maxFileSize={printAreas[selectedPrintArea]?.maxFileSize || 10}
                  />
                )}
                {activeDesignTab === 'text' && (
                  <div className="space-y-3">
                    <button
                      onClick={addText}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ink text-paper-50 rounded-xl font-semibold hover:bg-pj-green transition-colors text-sm"
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
                        className="flex flex-col items-center gap-1 p-2 bg-paper-100 border border-paper-200 rounded-xl hover:border-pj-green hover:bg-pj-sage/40 transition-all"
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
              </div>
            </div>

            {/* Canvas */}
            <main className="flex-1 bg-paper-50 rounded-2xl border border-paper-200 p-4 min-h-[520px]">
              {isDoubleSided && (
                <div className="flex items-center gap-2 mb-4">
                  {faceLabels.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => switchFace(i)}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                        activeFace === i
                          ? 'bg-ink text-paper-50'
                          : 'bg-paper-100 border border-paper-300 text-ink/60 hover:border-ink/40'
                      )}
                    >
                      <span className={clsx('w-2 h-2 rounded-full', activeFace === i ? 'bg-pj-green' : 'bg-paper-300')} />
                      Design {i + 1} · {label}
                      {facesRef.current[i]?.designState && activeFace !== i && (
                        <Check className="w-3.5 h-3.5 text-pj-green" />
                      )}
                    </button>
                  ))}
                  <span className="ml-auto hidden md:inline text-xs text-ink/40">
                    {faceLabels[activeFace]} side — add your {faceLabels[activeFace].toLowerCase()} design below
                  </span>
                </div>
              )}
              {printAreas.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {printAreas.map((area, i) => (
                    <button
                      key={i}
                      onClick={() => handlePrintAreaChange(i)}
                      className={clsx(
                        'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                        selectedPrintArea === i
                          ? 'bg-ink text-paper-50'
                          : 'bg-paper-100 border border-paper-300 text-ink/60 hover:border-ink/40'
                      )}
                    >
                      {area.name || `Print Area ${i + 1}`}
                      {area.description ? ` · ${area.description}` : ''}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider">
                  {isBusinessCard(product) ? 'Your card canvas' : 'Your design canvas'}
                </span>
                <div className="flex items-center gap-1 bg-paper-100 border border-paper-300 rounded-full px-1.5 py-1">
                  <button
                    onClick={() => setZoom(1)}
                    className="px-2 py-1 text-[11px] font-semibold text-ink/70 hover:text-pj-green rounded-full"
                    title="Fit to screen"
                  >
                    Fit
                  </button>
                  <button
                    onClick={() => setZoom(Math.max(0.5, +(zoom - 0.25).toFixed(2)))}
                    className="w-7 h-7 rounded-full hover:bg-paper-200 flex items-center justify-center text-ink"
                    title="Zoom out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-ink w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(3, +(zoom + 0.25).toFixed(2)))}
                    className="w-7 h-7 rounded-full hover:bg-paper-200 flex items-center justify-center text-ink"
                    title="Zoom in"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
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
              <p className="mt-2 px-1 text-[11px] text-ink/40">
                Accepted files: {(printAreas[selectedPrintArea]?.acceptedFormats || ['PNG', 'JPG', 'SVG', 'WebP']).join(', ')} · up to {printAreas[selectedPrintArea]?.maxFileSize || 10}MB · your uploads appear on the {isBusinessCard(product) ? 'card' : 'canvas'} instantly
              </p>
            </main>

            {/* Right options panel */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-20 space-y-4">
                <div className="bg-white rounded-2xl border border-paper-200 shadow-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-pj-sage flex items-center justify-center overflow-hidden flex-shrink-0">
                      {productImage || product.image || product.images?.[0]?.url ? (
                        <img src={productImage || product.image || product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-pj-green" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-ink leading-snug">{product.name}</h3>
                      {product.material && (
                        <p className="text-xs text-ink/50 mt-0.5 truncate">{product.material}</p>
                      )}
                      {!hideQuantity && selectedSize && (
                        <p className="text-xs text-ink/50 mt-0.5">Size: {selectedSize}</p>
                      )}
                      {!hideQuantity && selectedColor && (
                        <p className="text-xs text-ink/50 mt-0.5">Color: {selectedColor}</p>
                      )}
                    </div>
                  </div>

                  {!hideQuantity && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Quantity</span>
                        <span className="text-xs text-ink/40">{quantity} cards</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(product.minimumOrderQuantity || 1, quantity - 1))}
                          className="w-9 h-9 rounded-full border-2 border-paper-300 flex items-center justify-center hover:border-ink/40 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-ink" />
                        </button>
                        <input
                          type="number"
                          min={product.minimumOrderQuantity || 1}
                          max={10000}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(product.minimumOrderQuantity || 1, parseInt(e.target.value) || 1))}
                          className="w-full text-center px-3 py-2 border-2 border-paper-300 rounded-xl text-lg font-bold text-ink outline-none focus:border-pj-green"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-9 h-9 rounded-full border-2 border-paper-300 flex items-center justify-center hover:border-ink/40 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-ink" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="my-4 border-t border-dashed border-paper-300" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink/50">Unit price</span>
                    <span className="font-semibold text-ink">₹{unitPrice}</span>
                  </div>
                  {!hideQuantity && (
                    <div className="flex items-center justify-between text-sm mt-1.5">
                      <span className="text-ink/50">Quantity</span>
                      <span className="font-semibold text-ink">× {quantity}</span>
                    </div>
                  )}
                  {!hideQuantity && pricingTier && pricingTier.priceMultiplier < 1 && (
                    <div className="flex items-center justify-between text-sm mt-1.5 text-pj-green">
                      <span>Bulk discount</span>
                      <span className="font-semibold">-₹{(basePrice * quantity - totalPrice).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-paper-200">
                    <span className="font-semibold text-ink">Total</span>
                    <span className="font-display text-2xl font-bold text-ink">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  <button
                    ref={addToCartRef}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-pj-green hover:bg-ink text-paper-50 font-semibold py-3.5 rounded-full transition-colors text-lg shadow-lg shadow-pj-green/20 disabled:opacity-60"
                  >
                    {addingToCart ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>
                    ) : (
                      <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                    )}
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="mt-2.5 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-paper-300 text-ink font-semibold hover:border-pj-green hover:text-pj-green transition-colors disabled:opacity-60"
                  >
                    {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                    {savingDraft ? 'Saving...' : 'Save Draft'}
                  </button>
                </div>

                <div className="bg-pj-sage rounded-2xl border border-pj-green/30 p-4 text-xs text-ink/70">
                  <p className="font-semibold text-ink mb-1">PrintFinity</p>
                  Print a different design on every card in your pack — free with PrintFinity.
                </div>
              </div>
            </aside>
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
              className="flex items-center justify-center gap-2 bg-pj-green hover:bg-ink text-paper-50 font-semibold py-3.5 rounded-full transition-colors text-lg shadow-lg shadow-pj-green/20"
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
          <div className="flex items-center justify-between mb-8">
            <div className="text-center">
              <p className="text-xs font-semibold text-pj-green uppercase tracking-widest mb-2">Step 3 of 3</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Review your order</h2>
              <p className="mt-2 text-ink/60">Make sure everything looks perfect before adding to cart.</p>
            </div>
            {isBusinessCard(product) && (
              <button
                onClick={() => setShow3DPreview(!show3DPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-pj-green text-white rounded-xl text-sm font-medium hover:bg-ink transition-colors"
              >
                <Box className="w-4 h-4" />
                {show3DPreview ? '2D View' : '3D View'}
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mockup */}
            <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6 flex items-center justify-center min-h-[400px]">
              {show3DPreview && isBusinessCard(product) ? (
                <div className="w-full flex justify-center">
                  <BusinessCard3DPreview
                    frontImage={facePreviews[0] || designPreviewUrl}
                    backImage={facePreviews[1]}
                    width={350}
                  />
                </div>
              ) : isDoubleSided ? (
                <div className="w-full max-w-sm space-y-4">
                  {faceLabels.map((label, i) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-2">
                        {label} design
                      </p>
                      <div className="relative aspect-[2/1.1] rounded-xl overflow-hidden border border-paper-200 bg-white">
                        {(productImage || product.image || product.images?.[0]?.url) && (
                          <img
                            src={productImage || product.image || product.images?.[0]?.url}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        )}
                        {facePreviews[i] && (
                          <img
                            src={facePreviews[i]}
                            alt={`${product.name} ${label} design`}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ mixBlendMode: 'multiply' }}
                          />
                        )}
                        {!facePreviews[i] && (
                          <div className="w-full h-full bg-paper-200 flex items-center justify-center">
                            <Package className="w-10 h-10 text-ink/30" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative aspect-[4/2] w-full max-w-sm rounded-xl overflow-hidden bg-white">
                  {(productImage || product.image || product.images?.[0]?.url) && (
                    <img
                      src={productImage || product.image || product.images?.[0]?.url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}
                  {designPreviewUrl && (
                    <img
                      src={designPreviewUrl}
                      alt="Design overlay"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}
                  {!designPreviewUrl && (
                    <div className="w-full h-full bg-paper-200 flex items-center justify-center">
                      <Package className="w-16 h-16 text-ink/30" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-paper-50 rounded-2xl border border-paper-200 p-6">
              <h3 className="font-display font-semibold text-ink text-lg mb-4">Order summary</h3>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/50">Product</dt>
                  <dd className="font-semibold text-ink text-right">{product.name}</dd>
                </div>
                {isDoubleSided && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Printing</dt>
                    <dd className="font-semibold text-ink text-right">Double sided (Front + Back)</dd>
                  </div>
                )}
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
                  <div className="flex justify-between gap-4 text-pj-green">
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
                <DeliveryNote category={product?.category} />
                <button
                  onClick={() => goToStep('design')}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-paper-300 text-ink font-semibold hover:border-ink transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Design
                </button>
                <button
                  ref={addToCartRef}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex items-center justify-center gap-2 bg-pj-green hover:bg-ink text-paper-50 font-semibold py-4 rounded-full transition-colors text-lg shadow-lg shadow-pj-green/20 disabled:opacity-60"
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

      {/* Mobile sticky price bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-paper-50/95 backdrop-blur border-t border-paper-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-ink/50">Total</p>
            <p className="font-display text-xl font-bold text-ink">₹{totalPrice.toLocaleString()}</p>
          </div>
          {step === 'details' && (
            <button
              onClick={() => goToStep('design')}
              className="flex-1 flex items-center justify-center gap-2 bg-pj-green text-paper-50 font-semibold py-3 rounded-full transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {step === 'design' && (
            <button
              onClick={() => goToStep('review')}
              className="flex-1 flex items-center justify-center gap-2 bg-pj-green text-paper-50 font-semibold py-3 rounded-full transition-colors"
            >
              Review
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {step === 'review' && (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-pj-green text-paper-50 font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
            >
              {addingToCart ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
