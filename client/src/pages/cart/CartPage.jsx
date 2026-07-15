import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  Sparkles,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, GST_RATE } from '../../utils/constants';
import Breadcrumb from '../../components/common/Breadcrumb';
import EmptyState from '../../components/common/EmptyState';

export default function CartPage() {
  const {
    items,
    totalAmount,
    discount,
    coupon,
    itemCount,
    loading,
    updateItem,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = totalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const gst = totalAmount * GST_RATE;
  const grandTotal = totalAmount + shipping + gst;
  const freeShippingRemaining = FREE_SHIPPING_THRESHOLD - totalAmount;

  const handleQuantityChange = useCallback(
    async (itemId, newQuantity) => {
      if (newQuantity < 1) return;
      setUpdatingItemId(itemId);
      try {
        await updateItem(itemId, newQuantity);
      } finally {
        setUpdatingItemId(null);
      }
    },
    [updateItem]
  );

  const handleRemove = useCallback(
    async (itemId) => {
      setRemovingItemId(itemId);
      try {
        await removeItem(itemId);
      } finally {
        setRemovingItemId(null);
      }
    },
    [removeItem]
  );

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart | PrintJack</title>
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Looks like you haven't added any products to your cart yet. Browse our collection and find something you love!"
            actionLabel="Start Shopping"
            actionTo="/products"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${itemCount} items) | PrintJack`}</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Cart' }]} />

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1D3557] mb-2">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>

        {/* Free shipping progress */}
        {freeShippingRemaining > 0 && (
          <div className="mt-4 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-sm text-[#1D3557]">
              <Truck size={16} className="text-blue-500" />
              <span>
                Add <span className="font-bold text-blue-600">{formatPrice(freeShippingRemaining)}</span> more for{' '}
                <span className="font-bold text-green-600">FREE shipping!</span>
              </span>
            </div>
            <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalAmount / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {totalAmount >= FREE_SHIPPING_THRESHOLD && (
          <div className="mt-4 mb-6 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2 text-sm text-green-700">
            <Truck size={16} />
            <span className="font-medium">You qualify for FREE shipping!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const product = item.product || {};
                const image = item.image || product.images?.[0] || '/placeholder-product.png';
                const productName = item.name || product.name || 'Product';
                const productId = product._id || item.productId;
                const hasDesign = !!(item.designId || item.design);
                const isUpdating = updatingItemId === item._id;
                const isRemoving = removingItemId === item._id;

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isRemoving ? 0.5 : 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <Link to={`/products/${product.slug || productId}`}>
                        <img
                          src={image}
                          alt={productName}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover"
                        />
                      </Link>
                      {hasDesign && (
                        <div className="absolute -top-1 -left-1 bg-[#E63946] text-white rounded-full p-1">
                          <Sparkles size={12} />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/products/${product.slug || productId}`}
                            className="font-semibold text-[#1D3557] hover:text-[#E63946] transition-colors line-clamp-2 text-sm sm:text-base"
                          >
                            {productName}
                          </Link>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.size && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Color: {item.color}
                              </span>
                            )}
                            {hasDesign && (
                              <span className="text-xs text-[#E63946] bg-red-50 px-2 py-0.5 rounded-full font-medium">
                                Custom Design
                              </span>
                            )}
                          </div>
                          {hasDesign && (
                            <Link
                              to={`/editor/${productId}`}
                              className="inline-flex items-center gap-1 text-xs text-[#E63946] hover:underline mt-1.5"
                            >
                              <Sparkles size={12} />
                              Edit Design
                            </Link>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(item._id)}
                          disabled={isRemoving}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                          title="Remove item"
                        >
                          {isRemoving ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} />
                          </button>
                          {isUpdating ? (
                            <span className="px-4 py-2">
                              <Loader2 size={14} className="animate-spin text-[#E63946]" />
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (val > 0 && val <= 99) {
                                  handleQuantityChange(item._id, val);
                                }
                              }}
                              className="w-12 text-center text-sm font-medium border-x border-gray-200 py-2 focus:outline-none focus:bg-gray-50"
                            />
                          )}
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={item.quantity >= 99 || isUpdating}
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <p className="font-bold text-[#E63946] text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">
                              {formatPrice(item.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E63946] transition-colors mt-4"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[#1D3557] mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="font-medium">{formatPrice(gst)}</span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-[#E63946]">{formatPrice(grandTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <p className="text-xs text-green-600 mt-1 text-right">
                      You're saving {formatPrice(discount)} on this order!
                    </p>
                  )}
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mt-5">
                {!coupon ? (
                  <form onSubmit={handleApplyCoupon}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50 uppercase tracking-wider"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!couponCode.trim() || loading}
                        className="px-4 py-2.5 border border-[#E63946] text-[#E63946] rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-green-600" />
                      <div>
                        <span className="text-sm text-green-700 font-semibold">{coupon.code}</span>
                        <p className="text-xs text-green-600">
                          {coupon.type === 'percentage'
                            ? `${coupon.value}% off`
                            : `${formatPrice(coupon.value)} off`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full mt-5 py-3.5 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#c62d38] transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-red-500/20"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="w-full mt-3 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag size={16} />
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
                  <span>100% secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Truck size={16} className="text-blue-500 flex-shrink-0" />
                  <span>Free shipping on orders above ₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
