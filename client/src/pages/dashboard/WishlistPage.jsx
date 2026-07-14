import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Star, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const { addToCart } = useCart();

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist', { params: { page: currentPage, limit: 12 } });
      setItems(data.wishlist || data.items || data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (itemId) => {
    try {
      setRemovingId(itemId);
      await api.delete(`/wishlist/${itemId}`);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      setAddingToCart(item._id);
      const product = item.product || item;
      await addToCart(product._id || item.productId, 1, product.sizes?.[0] || 'M', product.colors?.[0] || null);
      await api.delete(`/wishlist/${item._id}`);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      toast.success('Moved to cart');
    } catch {
      // Error handled by addToCart
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557] mb-6">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you love to your wishlist and review them anytime."
          actionLabel="Explore Products"
          actionTo="/products"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const product = item.product || item;
              const image = product.images?.[0] || product.image || '/placeholder-product.png';
              const name = product.name || 'Product';
              const slug = product.slug || product._id;
              const price = product.price || 0;
              const discount = product.discount || 0;
              const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;
              const rating = product.rating || 0;
              const reviewCount = product.reviewCount || 0;
              const isAdding = addingToCart === item._id;
              const isRemoving = removingId === item._id;

              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all ${
                    isRemoving ? 'opacity-50' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <Link to={`/products/${slug}`}>
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-[#E63946] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        -{discount}%
                      </span>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur text-gray-400 hover:text-red-500 rounded-full shadow-md transition-colors disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <Link to={`/products/${slug}`}>
                      <h3 className="font-semibold text-[#1D3557] text-sm line-clamp-2 hover:text-[#E63946] transition-colors min-h-[2.5rem]">
                        {name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < Math.round(rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 fill-gray-200'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">({reviewCount})</span>
                    </div>

                    {/* Price */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{discount > 0 ? discountedPrice.toFixed(0) : price}
                      </span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">₹{price}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={isAdding}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#E63946] hover:bg-[#c62d38] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isAdding ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart size={14} />
                            Move to Cart
                          </>
                        )}
                      </button>
                      <Link
                        to={`/products/${slug}`}
                        className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-600 hover:border-[#1D3557] hover:text-[#1D3557] rounded-xl transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
