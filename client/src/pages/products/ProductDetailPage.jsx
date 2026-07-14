import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, ChevronRight, ChevronLeft, Minus, Plus, ShoppingCart,
  Share2, MessageCircle, ThumbsUp, Truck, RotateCcw, Shield,
  Ruler, Info, ZoomIn, Heart, Loader2,
} from 'lucide-react';
import BulkPricingTable from '../../components/products/BulkPricingTable';
import SizeGuide from '../../components/products/SizeGuide';
import ReviewForm from '../../components/products/ReviewForm';
import ReviewCard from '../../components/products/ReviewCard';

const mockProduct = {
  _id: '1',
  name: 'Premium Matte Business Card',
  slug: 'premium-matte-business-card',
  category: { name: 'Business Cards', slug: 'business-cards' },
  price: 299,
  bulkPrice: 199,
  bulkPricing: [
    { min: 1, max: 49, price: 299 },
    { min: 50, max: 99, price: 269 },
    { min: 100, max: 249, price: 229 },
    { min: 250, max: 499, price: 199 },
    { min: 500, max: null, price: 149 },
  ],
  rating: 4.8,
  reviewCount: 342,
  discount: 20,
  images: [
    'https://images.unsplash.com/photo-1572044347786-5693577a9077?w=800',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
    'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
  ],
  description: 'Make a lasting impression with our Premium Matte Business Cards. Printed on 350 GSM premium cardstock with a smooth matte finish, these cards feel as good as they look. Perfect for professionals who want to stand out.',
  shortDescription: 'Premium 350 GSM matte finish business cards with vibrant full-color printing.',
  specifications: [
    { label: 'Material', value: '350 GSM Premium Cardstock' },
    { label: 'Finish', value: 'Matte Lamination' },
    { label: 'Size', value: '3.5" x 2" (Standard)' },
    { label: 'Printing', value: 'Full Color, Double-Sided' },
    { label: 'Edges', value: 'Standard Cut / Rounded Available' },
    { label: 'Turnaround', value: '3-5 Business Days' },
    { label: 'Min Order', value: '25 Cards' },
  ],
  colors: [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Cream', hex: '#F5F0E1' },
    { name: 'Light Grey', hex: '#E0E0E0' },
    { name: 'Black', hex: '#000000' },
  ],
  sizes: ['Standard (3.5" × 2")', 'Square (2.5" × 2.5")', 'Mini (2.5" × 1.5")'],
  printArea: { width: '3.5 inches', height: '2 inches', formats: 'AI, PDF, PNG, PSD (min 300 DPI)' },
  reviews: [
    { name: 'Priya Sharma', rating: 5, title: 'Excellent quality!', comment: 'The cards came out exactly as I expected. The matte finish gives them a premium look and feel. Will definitely order again.', date: '2026-01-10', helpful: 12 },
    { name: 'Rahul Mehta', rating: 5, title: 'Perfect for my startup', comment: 'Ordered 200 cards for my new startup. The print quality is top-notch and the turnaround time was impressive. Highly recommended!', date: '2026-01-05', helpful: 8 },
    { name: 'Ananya Patel', rating: 4, title: 'Great cards, minor issue', comment: 'The cards look amazing. Only reason for 4 stars is that one corner had a slight imperfection, but customer service handled it quickly.', date: '2025-12-28', helpful: 5 },
    { name: 'Vikram Singh', rating: 5, title: 'Best value for money', comment: 'Compared prices across many vendors. PrintJack offers the best quality at this price point. The bulk pricing made it even more affordable.', date: '2025-12-20', helpful: 15 },
  ],
  relatedProducts: [
    { _id: '2', name: 'Glossy Business Card', price: 349, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', rating: 4.7 },
    { _id: '3', name: 'Square Business Card', price: 399, image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400', rating: 4.6 },
    { _id: '4', name: 'Letterhead Print', price: 599, image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400', rating: 4.5 },
    { _id: '5', name: 'Envelope Print', price: 449, image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400', rating: 4.4 },
  ],
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product] = useState(mockProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(25);
  const [activeTab, setActiveTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [id]);

  const p = product;
  const discountedPrice = p.discount > 0 ? p.price - (p.price * p.discount) / 100 : p.price;

  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: p.reviews.filter((rev) => Math.round(rev.rating) === r).length,
  }));
  const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/products" className="hover:text-brand-500 transition-colors">Products</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to={`/products?category=${p.category.slug}`} className="hover:text-brand-500 transition-colors">
              {p.category.name}
            </Link>
            <ChevronRight size={14} className="mx-2" />
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
                src={p.images[selectedImage]}
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
            <div className="flex gap-3 mt-4">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div>
            <span className="text-sm font-medium text-navy-700/60 uppercase tracking-wider">{p.category.name}</span>
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
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">{p.rating}</span>
              <button onClick={() => setActiveTab('reviews')} className="text-sm text-brand-500 hover:underline">
                ({p.reviewCount} reviews)
              </button>
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">₹{discountedPrice}</span>
              {p.discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{p.price}</span>
                  <span className="bg-brand-500/10 text-brand-500 text-sm font-bold px-2.5 py-0.5 rounded-full">
                    {p.discount}% OFF
                  </span>
                </>
              )}
            </div>
            {p.bulkPrice && (
              <p className="text-sm text-emerald-600 font-medium mt-1">Bulk pricing from ₹{p.bulkPrice} per unit</p>
            )}

            {/* Bulk pricing */}
            <div className="mt-4">
              <BulkPricingTable pricing={p.bulkPricing} unit="card" />
            </div>

            {/* Short description */}
            <p className="mt-5 text-gray-600 leading-relaxed">{p.shortDescription}</p>

            {/* Color selector */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-900">Color:</span>
                <span className="text-sm text-gray-500">{p.colors[selectedColor].name}</span>
              </div>
              <div className="flex gap-2">
                {p.colors.map((c, i) => (
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

            {/* Size selector */}
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
                {p.sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(i)}
                    className={`px-4 py-2 text-sm rounded-xl border-2 font-medium transition-colors ${
                      selectedSize === i
                        ? 'border-navy-700 bg-navy-700 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5">
              <span className="text-sm font-semibold text-gray-900 block mb-3">Quantity:</span>
              <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
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
            <div className="mt-5 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-navy-700" />
                <span className="text-sm font-semibold text-gray-900">Print Area</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Dimensions: {p.printArea.width} × {p.printArea.height}</p>
                <p>Accepted Formats: {p.printArea.formats}</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 space-y-3">
              <Link
                to={`/editor/${p._id}`}
                className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg shadow-brand-500/20"
              >
                Customize This Product
              </Link>
              <button className="flex items-center justify-center gap-2 w-full border-2 border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white font-bold py-4 rounded-xl transition-colors text-lg">
                <ShoppingCart size={20} />
                Add to Cart
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
                𝕏
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
                { key: 'specifications', label: 'Specifications' },
                { key: 'shipping', label: 'Shipping Info' },
                { key: 'reviews', label: `Reviews (${p.reviewCount})` },
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
                <p className="text-gray-600 leading-relaxed text-lg">{p.description}</p>
                <div className="mt-6 grid sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">Key Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1.5">
                      <li>• Premium 350 GSM cardstock</li>
                      <li>• Smooth matte lamination finish</li>
                      <li>• Full-color double-sided printing</li>
                      <li>• Vibrant, fade-resistant inks</li>
                      <li>• Custom sizes available</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">Best For</h4>
                    <ul className="text-sm text-gray-600 space-y-1.5">
                      <li>• Entrepreneurs & freelancers</li>
                      <li>• Corporate professionals</li>
                      <li>• Networking events</li>
                      <li>• Brand identity packages</li>
                      <li>• Startups & small businesses</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-xl">
                <table className="w-full text-sm">
                  <tbody>
                    {p.specifications.map((spec, i) => (
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
                  <p className="text-sm text-gray-600">3-5 business days after design approval. Free on orders above ₹999.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3">Express Shipping</h4>
                  <p className="text-sm text-gray-600">1-2 business days after design approval. Additional ₹149 charge.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3">Pan India Delivery</h4>
                  <p className="text-sm text-gray-600">We deliver across India including tier 2 and tier 3 cities. Tracking provided for all orders.</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Rating summary */}
                <div className="flex flex-col sm:flex-row gap-8 mb-10">
                  <div className="text-center sm:text-left">
                    <div className="text-5xl font-extrabold text-gray-900">{p.rating}</div>
                    <div className="flex justify-center sm:justify-start mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className={i < Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{p.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {ratingDistribution.map((d) => (
                      <div key={d.stars} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-8">{d.stars} ★</span>
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
                    onClick={() => setShowReviewForm(true)}
                    className="self-start bg-brand-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Individual reviews */}
                <div>
                  {p.reviews.map((review, i) => (
                    <ReviewCard key={i} review={review} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 mb-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Related Products</h2>
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
            {p.relatedProducts.map((rp) => (
              <Link
                key={rp._id}
                to={`/products/${rp._id}`}
                className="flex-shrink-0 w-60 snap-start bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden group"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-500 transition-colors">{rp.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-500">{rp.rating}</span>
                  </div>
                  <p className="mt-2 font-bold text-gray-900">₹{rp.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
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
          <button className="flex-1 flex items-center justify-center gap-2 border-2 border-navy-700 text-navy-700 font-bold py-3 rounded-xl transition-colors">
            <ShoppingCart size={18} /> Add to Cart
          </button>
        </div>
      </div>

      <SizeGuide type="tshirt" isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
      <ReviewForm
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        productName={p.name}
        onSubmit={async (data) => {
          console.log('Review submitted:', data);
        }}
      />
    </div>
  );
}
