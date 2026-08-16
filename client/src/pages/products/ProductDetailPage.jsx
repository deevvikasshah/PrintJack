import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Star, ChevronRight, Minus, Plus, ShoppingCart,
  Share2, MessageCircle, Truck, RotateCcw, Shield,
  Ruler, Info, ZoomIn, Heart, Loader2, Upload, FileImage, Zap, PenTool,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BulkPricingTable from '../../components/products/BulkPricingTable';
import SizeGuide from '../../components/products/SizeGuide';
import ReviewForm from '../../components/products/ReviewForm';
import ProductCalculator from '../../components/products/ProductCalculator';
import ReviewCard from '../../components/products/ReviewCard';
import DeliveryNote from '../../components/common/DeliveryNote';
import { useCart } from '../../context/CartContext';
import { useCartFly } from '../../context/CartFlyContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { compressImageFile, fileToDataUrl, uploadPrintFile, validateDesignUpload } from '../../utils/fileUtils';

function normalizeProduct(p) {
  return {
    ...p,
    price: p.basePrice || p.price || 0,
    bulkPrice: p.bulkPrice || (p.bulkPricing && p.bulkPricing.length > 0 ? p.bulkPricing[0].price : null),
    rating: p.averageRating || p.rating || 0,
    reviewCount: p.totalReviews || p.reviewCount || 0,
    images: p.images ? p.images.map((i) => (typeof i === 'string' ? i : i.url || i)) : [],
    colors: p.colors ? p.colors.map((c) => ({ name: c.name || c, hex: c.hexCode || c.hex || '#ccc' })) : [],
    sizes: p.sizes ? p.sizes.map((s) => (typeof s === 'string' ? s : s.name || s)) : [],
    discount: p.discount || 0,
    minOrder: p.minimumOrderQuantity || 1,
    specifications: p.specifications
      ? Object.entries(p.specifications).map(([label, value]) => ({ label, value }))
      : [],
  };
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { flyToCart } = useCartFly();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('recent');
  const [reviewFilter, setReviewFilter] = useState('all');

const [uploadingDesign, setUploadingDesign] = useState(false);
const [addingToCart, setAddingToCart] = useState(false);
const [buyingNow, setBuyingNow] = useState(false);
  const fileInputRef = useRef(null);
  const addToCartRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          const raw = data.product || data.data;
          const p = normalizeProduct(raw);
          setProduct(p);
          setReviews(raw.reviews || []);
          setSelectedImage(0);
          setSelectedColor(0);
          setSelectedSize(0);
          setQuantity(p.minOrder || 1);
          if (raw.relatedProducts) {
            setRelatedProducts(raw.relatedProducts.map(normalizeProduct));
          }
        } else {
          setError('Product not found');
        }
      } catch {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      const selectedSizeValue = sizes.length > 0 ? (typeof sizes[selectedSize] === 'string' ? sizes[selectedSize] : sizes[selectedSize]?.name) : undefined;
      const selectedColorValue = colors.length > 0 ? colors[selectedColor]?.name : undefined;
      await addToCart(p._id, quantity, selectedSizeValue, selectedColorValue);
      if (addToCartRef.current) flyToCart(addToCartRef.current, images[selectedImage] || images[0]);
    } catch {
      // toast already shown by CartContext
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    setBuyingNow(true);
    try {
      const selectedSizeValue = sizes.length > 0 ? (typeof sizes[selectedSize] === 'string' ? sizes[selectedSize] : sizes[selectedSize]?.name) : undefined;
      const selectedColorValue = colors.length > 0 ? colors[selectedColor]?.name : undefined;
      await addToCart(p._id, quantity, selectedSizeValue, selectedColorValue);
      if (addToCartRef.current) flyToCart(addToCartRef.current, images[selectedImage] || images[0]);
      navigate('/checkout');
    } catch {
      // toast already shown by CartContext
    } finally {
      setBuyingNow(false);
    }
  };

  const handleUploadDesign = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAuthenticated) {
      toast.error('Please login to upload designs');
      navigate('/login');
      return;
    }
    const check = validateDesignUpload(file);
    if (!check.ok) {
      toast.error(check.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploadingDesign(true);
    try {
      let previewDataUrl = null;
      let printFile = null;

      if (check.kind === 'raster') {
        const compressed = await compressImageFile(file, { maxDim: 1600, quality: 0.85 });
        previewDataUrl = await fileToDataUrl(new File([compressed.blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', { type: 'image/webp' }));
      } else if (check.kind === 'vector') {
        const { data } = await uploadPrintFile(file);
        printFile = {
          url: data.file.url,
          publicId: data.file.publicId,
          format: data.file.format,
          resourceType: data.file.resourceType,
          bytes: data.file.bytes,
          fileName: file.name,
          previewUrl: data.file.preview?.url || null,
        };
        previewDataUrl = data.file.preview?.url || null;
      }

      const { data: designRes } = await api.post('/designs', {
        productId: p._id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        canvasData: previewDataUrl
          ? { uploadedFile: previewDataUrl, fileName: file.name, fileType: file.type }
          : null,
        previewImage: previewDataUrl,
        printFile,
      });

      const designId = designRes.design?._id || designRes._id;

      const selectedSizeValue = sizes.length > 0 ? (typeof sizes[selectedSize] === 'string' ? sizes[selectedSize] : sizes[selectedSize]?.name) : undefined;
      const selectedColorValue = colors.length > 0 ? colors[selectedColor]?.name : undefined;
      await addToCart(p._id, quantity, selectedSizeValue, selectedColorValue, designId);
      toast.success(check.kind === 'vector' ? 'Vector design uploaded for print!' : 'Design uploaded and added to cart!');
      if (addToCartRef.current) flyToCart(addToCartRef.current, images[selectedImage] || images[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload design');
    } finally {
      setUploadingDesign(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    const { data } = await api.post(`/products/${p._id}/reviews`, reviewData);
    if (data.review) {
      setReviews((prev) => [data.review, ...prev]);
    }
    toast.success('Review submitted successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-pj-green" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-paper-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">{error || 'Product not found'}</p>
        <Link to="/products" className="bg-pj-green hover:bg-pj-green/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  const p = product;
  const images = p.images && p.images.length > 0 ? p.images : ['/placeholder-product.png'];
  const discountedPrice = p.discount > 0 ? p.price - (p.price * p.discount) / 100 : p.price;
  const colors = p.colors || [];
  const sizes = p.sizes || [];
  const specs = p.specifications || [];

  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => Math.round(rev.rating) === r).length,
  }));
  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  const filteredReviews = reviews.filter((rev) => {
    if (reviewFilter === 'withPhotos') return rev.photos && rev.photos.length > 0;
    if (reviewFilter === 'verified') return rev.verifiedPurchase;
    if (reviewFilter === 'all') return true;
    return Math.round(rev.rating) === parseInt(reviewFilter, 10);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (reviewSort === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (reviewSort === 'lowest') return (a.rating || 0) - (b.rating || 0);
    if (reviewSort === 'helpful') return (b.helpful?.count || 0) - (a.helpful?.count || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="min-h-screen bg-paper-50">
      <Helmet>
        <title>{p.name ? `${p.name} | PrintJack` : 'Products | PrintJack'}</title>
        <meta
          name="description"
          content={p.metaDescription || p.shortDescription || `Buy custom ${p.name || 'products'} online at PrintJack with bulk pricing, free design tools and pan-India delivery.`}
        />
        <meta property="og:title" content={`${p.name || 'Products'} | PrintJack`} />
        <meta
          property="og:description"
          content={p.shortDescription || `Custom ${p.name || 'products'} with bulk pricing and free design tools.`}
        />
        {(p.metaTitle || p.name) && (
          <meta property="og:title" content={p.metaTitle || `${p.name} | PrintJack`} />
        )}
        {images[0] && images[0] !== '/placeholder-product.png' && (
          <meta property="og:image" content={images[0]} />
        )}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://printjack.vercel.app/products/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-paper-100 border-b border-paper-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500 flex-wrap gap-1">
            <Link to="/" className="hover:text-pj-green transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-1" />
            <Link to="/products" className="hover:text-pj-green transition-colors">Products</Link>
            {p.category && (
              <>
                <ChevronRight size={14} className="mx-1" />
                <Link to={`/products?category=${p.category.slug || p.category._id}`} className="hover:text-pj-green transition-colors">
                  {typeof p.category === 'object' ? p.category.name : p.category}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="mx-1" />
            <span className="text-ink font-medium truncate">{p.name}</span>
          </nav>
        </div>
      </div>

      {/* Main product */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div>
            <motion.div
              className="relative aspect-square rounded-2xl overflow-hidden bg-paper-100 border border-paper-200 cursor-crosshair"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              <img
                src={images[selectedImage]}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: zoomed ? 'scale(1.8)' : 'scale(1)',
                }}
              />
              {!zoomed && (
                <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-gray-500">
                  <ZoomIn size={14} /> Hover to zoom
                </div>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === i ? 'border-pj-green ring-2 ring-pj-green/20' : 'border-paper-200 hover:border-paper-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            {p.category && (
              <span className="text-sm font-medium text-ink/60 uppercase tracking-wider">
                {typeof p.category === 'object' ? p.category.name : p.category}
              </span>
            )}
            <div className="flex items-start justify-between gap-4 mt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">{p.name}</h1>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`p-2 rounded-full border transition-colors flex-shrink-0 ${
                  wishlisted ? 'bg-pj-green border-pj-green text-white' : 'border-paper-200 text-gray-400 hover:text-pj-green'
                }`}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Rating */}
            {p.rating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink">{p.rating}</span>
                {p.reviewCount > 0 && (
                  <button onClick={() => setActiveTab('reviews')} className="text-sm text-pj-green hover:underline">
                    ({p.reviewCount} reviews)
                  </button>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-ink">&#8377;{discountedPrice}</span>
              {p.discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">&#8377;{p.price}</span>
                  <span className="bg-pj-green/10 text-pj-green text-sm font-bold px-2.5 py-0.5 rounded-full">
                    {p.discount}% OFF
                  </span>
                </>
              )}
            </div>
            {p.bulkPrice && (
              <p className="text-sm text-emerald-600 font-medium mt-1">Bulk pricing from &#8377;{p.bulkPrice} per unit</p>
            )}

{/* Bulk pricing */}
             {p.bulkPricing && p.bulkPricing.length > 0 && (
               <div className="mt-4">
                 <BulkPricingTable pricing={p.bulkPricing} unit="unit" />
               </div>
             )}

             {/* Price Calculator */}
             <ProductCalculator productId={p._id} product={p} />

             {/* Short description */}
            {p.shortDescription && (
              <p className="mt-5 text-gray-600 leading-relaxed">{p.shortDescription}</p>
            )}
            {!p.shortDescription && p.description && (
              <p className="mt-5 text-gray-600 leading-relaxed line-clamp-3">{p.description}</p>
            )}

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-ink">Color:</span>
                  <span className="text-sm text-gray-500">{colors[selectedColor]?.name || ''}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(i)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === i
                          ? 'border-ink ring-2 ring-ink/20 scale-110'
                          : 'border-paper-200 hover:border-paper-300'
                      } ${c.hex === '#FFFFFF' ? 'ring-1 ring-gray-100' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-ink">Size:</span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-pj-green hover:underline flex items-center gap-1"
                  >
                    <Ruler size={12} /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(i)}
                      className={`px-4 py-2 text-sm rounded-xl border-2 font-semibold transition-colors ${
                        selectedSize === i
                          ? 'border-ink bg-ink text-white'
                          : 'border-paper-200 text-gray-600 hover:border-paper-300'
                      }`}
                    >
                      {typeof s === 'string' ? s : s.name || s.label || s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5">
              <span className="text-sm font-semibold text-ink block mb-3">Quantity:</span>
              <div className="inline-flex items-center border border-paper-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(p.minOrder || 1, quantity - 1))}
                  className="p-3 hover:bg-paper-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-paper-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Print area info */}
            {(p.printArea || (p.printAreas && p.printAreas.length > 0)) && (
              <div className="mt-5 bg-paper-100 rounded-xl p-4 border border-paper-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-pj-green" />
                  <span className="text-sm font-semibold text-ink">Print Area</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {Array.isArray(p.printAreas) && p.printAreas.length > 0
                    ? p.printAreas.map((area, i) => (
                        <p key={i}>
                          {area.name && <span className="font-medium text-ink">{area.name}: </span>}
                          {area.width ? `${area.width}${area.height ? ` × ${area.height}` : ''}` : ''}
                          {area.formats ? ` — ${area.formats}` : ''}
                        </p>
                      ))
                    : (
                      <>
                        {p.printArea.width && <p>Dimensions: {p.printArea.width} {p.printArea.height ? `× ${p.printArea.height}` : ''}</p>}
                        {p.printArea.formats && <p>Accepted Formats: {p.printArea.formats}</p>}
                      </>
                    )}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-6 space-y-3">
              <DeliveryNote category={p.category} />
              <Link
                to={`/configure/${p._id}`}
                className="flex items-center justify-center gap-2 w-full bg-pj-green hover:bg-pj-green/90 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-pj-green/20"
              >
                Create Your Design
              </Link>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.pdf,.ai,.psd,.svg"
                onChange={handleUploadDesign}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDesign}
                className="flex items-center justify-center gap-2 w-full border-2 border-pj-green text-pj-green hover:bg-pj-sage font-bold py-4 rounded-xl transition-colors text-lg disabled:opacity-50"
              >
                {uploadingDesign ? (
                  <><Loader2 size={20} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={20} /> Upload Your Design</>
                )}
              </button>

              <button
                ref={addToCartRef}
                onClick={handleAddToCart}
                disabled={addingToCart || cartLoading}
                className="flex items-center justify-center gap-2 w-full border-2 border-ink text-ink hover:bg-ink hover:text-white font-bold py-4 rounded-xl transition-colors text-lg disabled:opacity-50"
              >
                {addingToCart ? (
                  <><Loader2 size={20} className="animate-spin" /> Adding...</>
                ) : (
                  <><ShoppingCart size={20} /> Add to Cart</>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buyingNow || cartLoading}
                className="flex items-center justify-center gap-2 w-full bg-pj-green text-white hover:bg-pj-green/90 font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-pj-green/20 disabled:opacity-50"
              >
                {buyingNow ? (
                  <><Loader2 size={20} className="animate-spin" /> Placing...</>
                ) : (
                  <><Zap size={20} /> Buy Now</>
                )}
              </button>
            </div>

            {/* Share */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Share2 size={14} /> Share:</span>
              {[
                {
                  label: 'WhatsApp',
                  url: `https://wa.me/?text=${encodeURIComponent(`Check out ${p.name} on PrintJack — ${window.location.href}`)}`,
                  cls: 'bg-emerald-500 hover:bg-emerald-600',
                  icon: <MessageCircle size={16} />,
                },
                {
                  label: 'Facebook',
                  url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                  cls: 'bg-blue-600 hover:bg-blue-700 text-xs font-bold',
                  icon: 'f',
                },
                {
                  label: 'X',
                  url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${p.name} on PrintJack`)}&url=${encodeURIComponent(window.location.href)}`,
                  cls: 'bg-sky-500 hover:bg-sky-600 text-xs font-bold',
                  icon: 'X',
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Share on ${s.label}`}
                  className={`w-9 h-9 rounded-full ${s.cls} text-white flex items-center justify-center transition-colors`}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: 'Free Shipping ₹999+' },
                { icon: RotateCcw, text: 'Easy Returns' },
                { icon: Shield, text: 'Quality Assured' },
              ].map((b, i) => (
                <div key={i} className="text-center p-3 bg-paper-100 rounded-xl border border-paper-200">
                  <b.icon size={18} className="mx-auto text-pj-green mb-1" />
                  <span className="text-xs text-gray-600 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-paper-200">
            <div className="flex gap-0 overflow-x-auto">
              {[
                { key: 'description', label: 'Description' },
                ...(specs.length > 0 ? [{ key: 'specifications', label: 'Specifications' }] : []),
                { key: 'shipping', label: 'Shipping Info' },
                { key: 'reviews', label: `Reviews (${reviews.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-pj-green text-pj-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">{p.description || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'specifications' && specs.length > 0 && (
              <div className="max-w-xl">
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((spec, i) => (
                      <tr key={i} className={`border-b border-paper-200 ${i % 2 === 0 ? 'bg-paper-100/50' : ''}`}>
                        <td className="py-3 px-4 font-semibold text-gray-700 w-1/3">{spec.label}</td>
                        <td className="py-3 px-4 text-gray-600">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-paper-100 rounded-xl p-5 border border-paper-200">
                  <h4 className="font-bold text-ink mb-3">Standard Shipping</h4>
                  <p className="text-sm text-gray-600">3-5 business days after design approval. Free on orders above &#8377;999.</p>
                </div>
                <div className="bg-paper-100 rounded-xl p-5 border border-paper-200">
                  <h4 className="font-bold text-ink mb-3">Express Shipping</h4>
                  <p className="text-sm text-gray-600">1-2 business days after design approval. Additional &#8377;149 charge.</p>
                </div>
                <div className="bg-paper-100 rounded-xl p-5 border border-paper-200">
                  <h4 className="font-bold text-ink mb-3">Pan India Delivery</h4>
                  <p className="text-sm text-gray-600">We deliver across India including tier 2 and tier 3 cities. Tracking provided for all orders.</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-8 mb-10">
                  <div className="text-center sm:text-left">
                    <div className="text-5xl font-extrabold text-ink">{p.rating || '0'}</div>
                    <div className="flex justify-center sm:justify-start mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className={i < Math.round(p.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {ratingDistribution.map((d) => (
                      <div key={d.stars} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-8">{d.stars} *</span>
                        <div className="flex-1 bg-paper-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${(d.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-8 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Please login to write a review');
                        navigate('/login');
                        return;
                      }
                      setShowReviewForm(true);
                    }}
                    className="self-start bg-pj-green hover:bg-pj-green/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Write a Review
                  </button>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setReviewFilter('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          reviewFilter === 'all' ? 'bg-ink text-white border-ink' : 'border-paper-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setReviewFilter('withPhotos')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          reviewFilter === 'withPhotos' ? 'bg-ink text-white border-ink' : 'border-paper-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        With Photos
                      </button>
                      <button
                        onClick={() => setReviewFilter('verified')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          reviewFilter === 'verified' ? 'bg-ink text-white border-ink' : 'border-paper-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Verified Buyers
                      </button>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <button
                          key={r}
                          onClick={() => setReviewFilter(reviewFilter === String(r) ? 'all' : String(r))}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                            reviewFilter === String(r) ? 'bg-ink text-white border-ink' : 'border-paper-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {r} Star
                        </button>
                      ))}
                    </div>
                    <select
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value)}
                      className="px-3 py-1.5 text-xs font-medium border border-paper-200 rounded-full text-gray-600 focus:outline-none focus:ring-2 focus:ring-pj-green/20"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="helpful">Most Helpful</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                  {sortedReviews.length > 0 ? sortedReviews.map((review, i) => (
                    <ReviewCard key={review._id || i} review={{ ...review, productId: p._id }} index={i} />
                  )) : (
                    <p className="text-gray-500 text-center py-8">No reviews match this filter.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-12">
            <h2 className="text-2xl font-extrabold text-ink mb-6">Related Products</h2>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp._id}
                  to={`/products/${rp.slug || rp._id}`}
                  className="flex-shrink-0 w-60 snap-start bg-white rounded-2xl border border-paper-200 hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden bg-paper-100">
                    <img src={rp.images?.[0] || rp.image || '/placeholder-product.png'} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-ink text-sm group-hover:text-pj-green transition-colors">{rp.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{rp.rating || 0}</span>
                    </div>
                    <p className="mt-2 font-bold text-ink">&#8377;{rp.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-paper-200 p-3 lg:hidden z-30 shadow-lg">
        <div className="flex gap-3">
          <Link
            to={`/configure/${p._id}`}
            className="w-12 flex items-center justify-center bg-pj-green hover:bg-pj-green/90 text-white font-bold py-3 rounded-xl transition-colors"
            title="Customize"
          >
            <PenTool size={20} />
          </Link>
          <button
            onClick={handleBuyNow}
            disabled={buyingNow || cartLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-pj-green text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {buyingNow ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            {buyingNow ? 'Placing...' : 'Buy Now'}
          </button>
          <button
            ref={addToCartRef}
            onClick={handleAddToCart}
            disabled={addingToCart || cartLoading}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-ink text-ink font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {addingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {sizes.length > 0 && <SizeGuide type="tshirt" isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />}
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        productName={p.name}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}
