import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Math.max(subtotal - discount, 0);
  }, [items, discount]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      const cart = data.cart || data;
      setItems(cart.items || []);
      setCoupon(cart.coupon || null);
      setDiscount(cart.discount || 0);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setItems([]);
      setCoupon(null);
      setDiscount(0);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (productId, quantity = 1, size, color, designId) => {
    try {
      setLoading(true);
      const { data } = await api.post('/cart/add', {
        productId,
        quantity,
        size,
        color,
        designId,
      });
      const cart = data.cart || data;
      setItems(cart.items || []);
      setCoupon(cart.coupon || null);
      setDiscount(cart.discount || 0);
      toast.success('Item added to cart');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, quantity, size, color) => {
    try {
      setLoading(true);
      const { data } = await api.put(`/cart/item/${itemId}`, { quantity, size, color });
      const cart = data.cart || data;
      setItems(cart.items || []);
      setCoupon(cart.coupon || null);
      setDiscount(cart.discount || 0);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update item';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const { data } = await api.delete(`/cart/item/${itemId}`);
      const cart = data.cart || data;
      setItems(cart.items || []);
      setCoupon(cart.coupon || null);
      setDiscount(cart.discount || 0);
      toast.success('Item removed from cart');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete('/cart/clear');
      setItems([]);
      setCoupon(null);
      setDiscount(0);
      toast.success('Cart cleared');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    try {
      setLoading(true);
      const { data } = await api.post('/cart/coupon', { code });
      setCoupon(data.coupon);
      setDiscount(data.discount);
      toast.success(`Coupon applied! You save ₹${data.discount}`);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    try {
      setLoading(true);
      await api.delete('/cart/coupon');
      setCoupon(null);
      setDiscount(0);
      toast.success('Coupon removed');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove coupon';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (checkoutData) => {
    try {
      setLoading(true);
      const { data } = await api.post('/orders/checkout', checkoutData);
      toast.success('Order placed successfully!');
      setItems([]);
      setCoupon(null);
      setDiscount(0);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Checkout failed';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    items,
    totalAmount,
    discount,
    coupon,
    loading,
    itemCount,
    fetchCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
