import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ChevronRight, Minus, Plus, ShoppingCart,
  Share2, MessageCircle, Truck, RotateCcw, Shield,
  Ruler, Info, ZoomIn, Heart, Loader2, Upload, FileImage,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BulkPricingTable from '../../components/products/BulkPricingTable';
import SizeGuide from '../../components/products/SizeGuide';
import ReviewForm from '../../components/products/ReviewForm';
import ReviewCard from '../../components/products/ReviewCard';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

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

  const [uploadingDesign, setUploadingDesign] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const fileInputRef = useRef(null);

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
    } catch {
      // toast already shown by CartContext
    } finally {
      setAddingToCart(false);
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
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setUploadingDesign(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data: designRes } = await api.post('/designs', {
        productId: p._id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        canvasData: { uploadedFile: dataUrl, fileName: file.name, fileType: file.type },
        previewImage: dataUrl,
      });

      const designId = designRes.design?._id || designRes._id;

      const selectedSizeValue = sizes.length > 0 ? (typeof sizes[selectedSize] === 'string' ? sizes[selectedSize] : sizes[selectedSize]?.name) : undefined;
      const selectedColorValue = colors.length > 0 ? colors[selectedColor]?.name : undefined;
      await addToCart(p._id, quantity, selectedSizeValue, selectedColorValue, designId);
      toast.success('Design uploaded and added to cart!');
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">{error || 'Product not found'}</p>
        <Link to="/products" className="bg-brand-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
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

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500 flex-wrap gap-1">
            <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-1" />
            <Link to="/products" className="hover:text-brand-500 transition-colors">Products</Link>
            {p.category && (
              <>
                <ChevronRight size={14} className="mx-1" />
                <Link to={`/products?category=${p.category.slug || p.category._id}`} className="hover:text-brand-500 transition-colors">
                  {typeof p.category === 'object' ? p.category.name : p.category}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="mx-1" />
            <span className="text-gray-900 font-medium truncate">{p.name}</span>
          </nav>
        </div>
      </div>

      {/* Main product */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div>
            <motion.div
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-crosshair"
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
                      selectedImage === i ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-gray-400'
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
              <span className="text-sm font-medium text-navy-700/60 uppercase tracking-wider">
                {typeof p.category === 'object' ? p.category.name : p.category}
              </span>
            )}
            <div className="flex items-start justify-between gap-4 mt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{p.name}</h1>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`p-2 rounded-full border transition-colors flex-shrink-0 ${
                  wishlisted ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-200 text-gray-400 hover:text-brand-500'
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
                <span className="text-sm font-medium text-gray-900">{p.rating}</span>
                {p.reviewCount > 0 && (
                  <button onClick={() => setActiveTab('reviews')} className="text-sm text-brand-500 hover:underline">
                    ({p.reviewCount} reviews)
                  </button>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">&#8377;{discountedPrice}</span>
              {p.discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">&#8377;{p.price}</span>
                  <span className="bg-brand-500/10 text-brand-500 text-sm font-bold px-2.5 py-0.5 rounded-full">
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
                  <span className="text-sm font-semibold text-gray-900">Color:</span>
                  <span className="text-sm text-gray-500">{colors[selectedColor]?.name || ''}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(i)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === i
                          ? 'border-navy-700 ring-2 ring-navy-700/20 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
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
                  <span className="text-sm font-semibold text-gray-900">Size:</span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-brand-500 hover:underline flex items-center gap-1"
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
                          ? 'border-navy-700 bg-navy-700 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
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
              <span className="text-sm font-semibold text-gray-900 block mb-3">Quantity:</span>
              <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(p.minOrder || 1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Print area info */}
            {p.printArea && (
              <div className="mt-5 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-navy-700" />
                  <span className="text-sm font-semibold text-gray-900">Print Area</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {p.printArea.width && <p>Dimensions: {p.printArea.width} {p.printArea.height ? `× ${p.printArea.height}` : ''}</p>}
                  {p.printArea.formats && <p>Accepted Formats: {p.printArea.formats}</p>}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-6 space-y-3">
              <Link
                to={`/editor/${p._id}`}
                className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-brand-500/20"
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
                className="flex items-center justify-center gap-2 w-full border-2 border-brand-500 text-brand-500 hover:bg-brand-50 font-bold py-4 rounded-xl transition-colors text-lg disabled:opacity-50"
              >
                {uploadingDesign ? (
                  <><Loader2 size={20} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={20} /> Upload Your Design</>
                )}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || cartLoading}
                className="flex items-center justify-center gap-2 w-full border-2 border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white font-bold py-4 rounded-xl transition-colors text-lg disabled:opacity-50"
              >
                {addingToCart ? (
                  <><Loader2 size={20} className="animate-spin" /> Adding...</>
                ) : (
                  <><ShoppingCart size={20} /> Add to Cart</>
                )}
              </button>
            </div>

            {/* Share */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm text-gray-500 flex items-center gap-1"><Share2 size={14} /> Share:</span>
              <button className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <MessageCircle size={16} />
              </button>
              <button className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors text-xs font-bold">
                f
              </button>
              <button className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors text-xs font-bold">
                X
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: 'Free Shipping 999+' },
                { icon: RotateCcw, text: 'Easy Returns' },
                { icon: Shield, text: 'Quality Assured' },
              ].map((b, i) => (
                <div key={i} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <b.icon size={18} className="mx-auto text-navy-700 mb-1" />
                  <span className="text-xs text-gray-600 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
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
                      ? 'border-brand-500 text-brand-500'
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
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
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
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3">Standard Shipping</h4>
                  <p className="text-sm text-gray-600">3-5 business days after design approval. Free on orders above &#8377;999.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3">Express Shipping</h4>
                  <p className="text-sm text-gray-600">1-2 business days after design approval. Additional &#8377;149 charge.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3">Pan India Delivery</h4>
                  <p className="text-sm text-gray-600">We deliver across India including tier 2 and tier 3 cities. Tracking provided for all orders.</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-8 mb-10">
                  <div className="text-center sm:text-left">
                    <div className="text-5xl font-extrabold text-gray-900">{p.rating || '0'}</div>
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
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
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
                    className="self-start bg-brand-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Write a Review
                  </button>
                </div>

                <div>
                  {reviews.length > 0 ? reviews.map((review, i) => (
                    <ReviewCard key={i} review={review} index={i} />
                  )) : (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-12">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Related Products</h2>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp._id}
                  to={`/products/${rp.slug || rp._id}`}
                  className="flex-shrink-0 w-60 snap-start bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img src={rp.images?.[0] || rp.image || '/placeholder-product.png'} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-500 transition-colors">{rp.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{rp.rating || 0}</span>
                    </div>
                    <p className="mt-2 font-bold text-gray-900">&#8377;{rp.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:hidden z-30 shadow-lg">
        <div className="flex gap-3">
          <Link
            to={`/editor/${p._id}`}
            className="flex-1 bg-brand-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-center transition-colors"
          >
            Customize
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || cartLoading}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-navy-700 text-navy-700 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
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
