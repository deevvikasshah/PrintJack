import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const quickViewSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const {
    _id,
    name,
    slug,
    images = [],
    category,
    price,
    bulkPrice,
    rating = 0,
    reviewCount = 0,
    discount = 0,
    badge,
    sizes = [],
  } = product;

  const firstImage = images && images[0];
  const image = typeof firstImage === 'string' ? firstImage : firstImage?.url || firstImage || '/placeholder-product.png';
  const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;
  const hasSizes = sizes.length > 0 || (category?.name && ['Apparel', 'T-Shirts', 'Hoodies'].includes(category.name));

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="group relative bg-paper-50 rounded-2xl border border-ink/10 hover:border-ink/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-paper-200">
          <Link to={`/products/${slug || _id}`}>
            <img
              src={image}
              alt={name}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 bg-paper-200 animate-pulse" />
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-pj-green text-white text-xs font-semibold px-3 py-1 rounded-full">
                Save {discount}%
              </span>
            )}
            {badge === 'bestseller' && (
              <span className="bg-ink text-paper-50 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={12} /> Best Seller
              </span>
            )}
            {badge === 'new' && (
              <span className="bg-ink text-paper-50 text-xs font-semibold px-3 py-1 rounded-full">
                New
              </span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                setWishlisted(!wishlisted);
              }}
              className={`p-2 rounded-full shadow-md transition-colors ${
                wishlisted
                  ? 'bg-pj-green text-white'
                  : 'bg-white text-ink/70 hover:text-pj-green'
              }`}
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              className="p-2 rounded-full bg-white text-ink/70 hover:text-pj-green shadow-md transition-colors"
            >
              <Eye size={18} />
            </button>
          </div>

          {/* Customize overlay on hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Link
              to={`/configure/${_id}`}
              className="block w-full text-center bg-ink hover:bg-pj-green text-paper-50 font-semibold py-2.5 rounded-full transition-colors text-sm"
            >
              Customize Now
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          {category && (
            <span className="text-xs text-ink/50 uppercase tracking-wider">
              {category.name || category}
            </span>
          )}
          <Link to={`/products/${slug || _id}`}>
            <h3 className="mt-1 font-display text-base text-ink leading-snug line-clamp-2 hover:text-pj-green transition-colors min-h-[2.75rem]">
              {name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(rating)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-ink/15 fill-ink/15'
                  }
                />
              ))}
            </div>
            <span className="text-xs text-ink/50">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-display text-xl text-ink">
              ₹{discount > 0 ? discountedPrice.toFixed(0) : price}
            </span>
            {discount > 0 && (
              <span className="text-sm text-ink/40 line-through">₹{price}</span>
            )}
          </div>
          {bulkPrice && (
            <p className="text-xs text-pj-green font-medium mt-0.5">
              Bulk from ₹{bulkPrice}
            </p>
          )}

          {/* Size quick-select */}
          {hasSizes && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {quickViewSizes.slice(0, 5).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                  className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                    selectedSize === s
                      ? 'border-ink bg-ink text-paper-50'
                      : 'border-ink/15 text-ink/60 hover:border-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2 mt-4">
            <Link
              to={`/configure/${_id}`}
              className="flex-1 text-center bg-ink hover:bg-pj-green text-paper-50 text-sm font-semibold py-2.5 rounded-full transition-colors"
            >
              Customize
            </Link>
            <button
              onClick={async () => {
                if (!isAuthenticated) { navigate('/login'); return; }
                setAdding(true);
                try { await addToCart(_id, 1, selectedSize); } finally { setAdding(false); }
              }}
              disabled={adding}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-ink/20 hover:border-ink text-ink/80 hover:text-ink text-sm font-semibold rounded-full transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={15} />
              {adding ? '...' : 'Add'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setQuickViewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-square bg-paper-200">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col">
                  <button
                    onClick={() => setQuickViewOpen(false)}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                  {category && (
                    <span className="text-xs text-ink/50 uppercase tracking-wider">
                      {category.name || category}
                    </span>
                  )}
                  <h3 className="mt-1 font-display text-xl text-ink">{name}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.round(rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-ink/15 fill-ink/15'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-ink/50">({reviewCount} reviews)</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-2xl text-ink">
                      ₹{discount > 0 ? discountedPrice.toFixed(0) : price}
                    </span>
                    {discount > 0 && (
                      <span className="text-sm text-ink/40 line-through">₹{price}</span>
                    )}
                  </div>
                  {bulkPrice && (
                    <p className="text-sm text-pj-green font-medium mt-1">
                      Bulk pricing from ₹{bulkPrice}
                    </p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <Link
                      to={`/configure/${_id}`}
                      className="flex-1 text-center bg-ink hover:bg-pj-green text-paper-50 font-semibold py-3 rounded-full transition-colors"
                    >
                      Customize Now
                    </Link>
                    <button
                      onClick={async () => {
                        if (!isAuthenticated) { navigate('/login'); return; }
                        setAdding(true);
                        try { await addToCart(_id, 1, selectedSize); setQuickViewOpen(false); } finally { setAdding(false); }
                      }}
                      disabled={adding}
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-ink/20 hover:border-ink text-ink/80 font-semibold rounded-full transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart size={18} />
                      {adding ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                  <Link
                    to={`/products/${slug || _id}`}
                    className="mt-3 text-center text-sm text-pj-green hover:text-ink font-medium transition-colors"
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
