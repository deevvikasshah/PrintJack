import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Truck,
  Zap,
  Banknote,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  ShoppingBag,
  Home,
  Building,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  INDIAN_STATES,
  RAZORPAY_KEY_ID,
  GST_RATE,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
} from '../../utils/constants';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const STEPS = [
  { num: 1, label: 'Address', icon: MapPin },
  { num: 2, label: 'Payment', icon: CreditCard },
  { num: 3, label: 'Confirmation', icon: CheckCircle },
];

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard Shipping', description: '5-7 business days', price: 0 },
  { id: 'express', label: 'Express Shipping', description: '2-3 business days', price: 149 },
];

function AddressForm({ onSave, initialData, onCancel }) {
  const [form, setForm] = useState(
    initialData || {
      label: 'Home',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    }
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <select
          name="label"
          value={form.label}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
        >
          <option value="Home">Home</option>
          <option value="Office">Office</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            required
            maxLength={6}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
          <textarea
            name="street"
            value={form.street}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <select
            name="state"
            value={form.state}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#1D3557] text-white font-medium rounded-xl hover:bg-[#152a47] transition-colors text-sm"
        >
          {initialData ? 'Update Address' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep === step.num
                  ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/30'
                  : currentStep > step.num
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step.num ? <Check size={18} /> : step.num}
            </div>
            <span
              className={`text-xs mt-2 font-medium hidden sm:block ${
                currentStep >= step.num ? 'text-[#1D3557]' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 mb-5 sm:mb-0 transition-colors ${
                currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function AddressStep({ onSelectAddress, selectedAddressId }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/addresses');
      setAddresses(data.addresses || data || []);
      if (data.addresses?.length && !selectedAddressId) {
        const defaultAddr = data.addresses.find((a) => a.isDefault) || data.addresses[0];
        onSelectAddress(defaultAddr, billingSameAsShipping);
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (formData) => {
    try {
      if (editingAddress) {
        const { data } = await api.put(`/addresses/${editingAddress._id}`, formData);
        setAddresses((prev) => prev.map((a) => (a._id === editingAddress._id ? data.address || data : a)));
        toast.success('Address updated');
      } else {
        const { data } = await api.post('/addresses', formData);
        const newAddr = data.address || data;
        setAddresses((prev) => [...prev, newAddr]);
        onSelectAddress(newAddr, billingSameAsShipping);
        toast.success('Address added');
      }
      setShowAddForm(false);
      setEditingAddress(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (selectedAddressId === id) {
        onSelectAddress(null, billingSameAsShipping);
      }
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const getIcon = (label) => {
    if (label === 'Office') return Building;
    return Home;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1D3557] mb-1">Shipping Address</h2>
        <p className="text-sm text-gray-500">Select or add a delivery address</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              const Icon = getIcon(addr.label);
              return (
                <div
                  key={addr._id}
                  onClick={() => onSelectAddress(addr, billingSameAsShipping)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#E63946] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected ? 'border-[#E63946]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 bg-[#E63946] rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-gray-500" />
                        <span className="font-semibold text-sm text-[#1D3557]">
                          {addr.label || 'Address'}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-[#E63946] bg-red-100 px-2 py-0.5 rounded-full uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{addr.fullName}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Phone: {addr.phone}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAddress(addr);
                          setShowAddForm(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(addr._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!showAddForm && (
            <button
              onClick={() => {
                setEditingAddress(null);
                setShowAddForm(true);
              }}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#E63946] hover:text-[#E63946] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} />
              Add New Address
            </button>
          )}

          {showAddForm && (
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-[#1D3557] mb-3">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <AddressForm
                onSave={handleSaveAddress}
                initialData={editingAddress}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                }}
              />
            </div>
          )}

          {/* Billing same as shipping */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="billingSame"
              checked={billingSameAsShipping}
              onChange={(e) => setBillingSameAsShipping(e.target.checked)}
              className="w-4 h-4 text-[#E63946] rounded focus:ring-[#E63946]"
            />
            <label htmlFor="billingSame" className="text-sm text-gray-700">
              Billing address same as shipping
            </label>
          </div>
        </>
      )}
    </div>
  );
}

function PaymentStep({ onBack, onPaymentSuccess }) {
  const { items, totalAmount, discount, coupon } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [couponCode, setCouponCode] = useState(coupon?.code || '');
  const [appliedCoupon, setAppliedCoupon] = useState(coupon);
  const [appliedDiscount, setAppliedDiscount] = useState(discount);
  const [processing, setProcessing] = useState(false);

  const shippingCost =
    shippingMethod === 'express'
      ? SHIPPING_METHODS.find((m) => m.id === 'express').price
      : totalAmount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_COST;

  const gstAmount = totalAmount * GST_RATE;
  const grandTotal = totalAmount - appliedDiscount + shippingCost + gstAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post('/cart/coupon', { code: couponCode.trim() });
      setAppliedCoupon(data.coupon);
      setAppliedDiscount(data.discount);
      toast.success(`Coupon applied! You save ₹${data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      const orderData = {
        shippingAddressId: null,
        paymentMethod: 'razorpay',
        shippingMethod,
        couponCode: appliedCoupon?.code || undefined,
      };

      const { data: order } = await api.post('/orders/checkout', orderData);

      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setProcessing(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount || Math.round(grandTotal * 100),
        currency: 'INR',
        name: 'PrintJack',
        description: `Order #${order.orderNumber || order._id}`,
        order_id: order.razorpayOrderId || order.razorpay_order_id,
        handler: async (response) => {
          try {
            await api.post('/orders/verify-payment', {
              orderId: order._id || order.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            onPaymentSuccess(order);
          } catch {
            toast.error('Payment verification failed. Contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#E63946',
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleCODPayment = async () => {
    setProcessing(true);
    try {
      const { data: order } = await api.post('/orders/checkout', {
        shippingAddressId: null,
        paymentMethod: 'cod',
        shippingMethod,
        couponCode: appliedCoupon?.code || undefined,
      });
      onPaymentSuccess(order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1D3557] mb-4">Order Summary</h3>
        <div className="space-y-3 mb-4">
          {items.map((item) => {
            const product = item.product || {};
            const image = item.image || product.images?.[0] || '/placeholder-product.png';
            const name = item.name || product.name;
            const hasDesign = !!(item.designId || item.design);
            return (
              <div key={item._id} className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img src={image} alt={name} className="w-14 h-14 rounded-lg object-cover" />
                  {hasDesign && (
                    <div className="absolute -top-1 -left-1 bg-[#E63946] text-white rounded-full p-0.5">
                      <span className="block w-3 h-3">
                        <Sparkles size={10} />
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity}
                    {item.size && ` • ${item.size}`}
                    {item.color && ` • ${item.color}`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#1D3557] flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Method */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1D3557] mb-4">Shipping Method</h3>
        <div className="space-y-3">
          {SHIPPING_METHODS.map((method) => {
            const finalPrice =
              method.id === 'express'
                ? method.price
                : totalAmount >= FREE_SHIPPING_THRESHOLD
                ? 0
                : SHIPPING_COST;
            return (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  shippingMethod === method.id
                    ? 'border-[#E63946] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value={method.id}
                  checked={shippingMethod === method.id}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1D3557]">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
                <span className="text-sm font-bold text-[#1D3557]">
                  {finalPrice === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(finalPrice)
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Coupon */}
      {!coupon && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1D3557] mb-3">Apply Coupon</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50 uppercase tracking-wider"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim()}
              className="px-5 py-2.5 border border-[#E63946] text-[#E63946] rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1D3557] mb-4">Payment Method</h3>
        <div className="space-y-3">
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === 'razorpay'
                ? 'border-[#E63946] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#1D3557]" />
                <p className="text-sm font-medium text-[#1D3557]">Razorpay</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                UPI, Credit/Debit Cards, Netbanking, Wallets
              </p>
            </div>
            <Lock size={14} className="text-green-500 flex-shrink-0" />
          </label>

          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === 'cod'
                ? 'border-[#E63946] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Banknote size={18} className="text-[#1D3557]" />
                <p className="text-sm font-medium text-[#1D3557]">Cash on Delivery</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Pay when you receive your order</p>
            </div>
          </label>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1D3557] mb-4">Price Details</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatPrice(totalAmount)}</span>
          </div>
          {appliedDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({appliedCoupon?.code})</span>
              <span className="font-medium">-{formatPrice(appliedDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Shipping</span>
            <span className="font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">GST (18%)</span>
            <span className="font-medium">{formatPrice(gstAmount)}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-[#E63946]">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : handleCODPayment}
          disabled={processing}
          className="flex-1 py-3 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-lg shadow-red-500/20"
        >
          {processing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : paymentMethod === 'cod' ? (
            <>
              <Banknote size={18} />
              Place Order - {formatPrice(grandTotal)}
            </>
          ) : (
            <>
              <Lock size={16} />
              Pay {formatPrice(grandTotal)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ConfirmationStep({ order }) {
  const orderNumber = order?.orderNumber || order?._id?.slice(-8).toUpperCase() || 'N/A';
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto">
      {/* Success Animation */}
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
          <CheckCircle size={48} className="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#1D3557]">Order Placed Successfully!</h2>
        <p className="text-gray-500 mt-2">
          Thank you for your order. We'll send you an email with the order details.
        </p>
      </div>

      {/* Order Number */}
      <div className="bg-gray-50 rounded-xl p-5 inline-block">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order Number</p>
        <p className="text-2xl font-bold text-[#E63946] mt-1 tracking-wider">{orderNumber}</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 text-left">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Estimated Delivery</span>
            <span className="font-medium text-[#1D3557]">{estimatedDelivery}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Items</span>
            <span className="font-medium">{order?.items?.length || 0} products</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-[#E63946]">
              {formatPrice(order?.totalAmount || order?.total || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Email Info */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        A confirmation email has been sent to your registered email address.
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          to="/dashboard/orders"
          className="flex-1 py-3 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#c62d38] transition-colors flex items-center justify-center gap-2"
        >
          <Truck size={18} />
          Track Order
        </Link>
        <Link
          to="/products"
          className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function SparklesIcon({ size }) {
  return <Sparkles size={size || 10} />;
}

export default function CheckoutPage() {
  const { items, coupon: cartCoupon } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    if (items.length === 0 && step !== 3) {
      navigate('/cart');
    }
  }, [items, navigate, step]);

  const handleAddressSelect = useCallback((address, sameBilling) => {
    setSelectedAddress(address);
    setBillingSameAsShipping(sameBilling);
  }, []);

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setStep(2);
  };

  const handlePaymentSuccess = (order) => {
    setOrderResult(order);
    setStep(3);
  };

  return (
    <>
      <Helmet>
        <title>Checkout | PrintJack</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { to: '/cart', label: 'Cart' },
            { label: 'Checkout' },
          ]}
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1D3557] mb-6 text-center">Checkout</h1>

        <StepIndicator currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <AddressStep
                    onSelectAddress={handleAddressSelect}
                    selectedAddressId={selectedAddress?._id}
                  />
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleContinueToPayment}
                    className="px-8 py-3 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#c62d38] transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
                  >
                    Continue to Payment
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <PaymentStep
                onBack={() => setStep(1)}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {step === 3 && <ConfirmationStep order={orderResult} />}
          </div>

          {/* Order Summary Sidebar - Hide on confirmation */}
          {step < 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-[#1D3557] mb-4">
                  Order Summary ({items.length} items)
                </h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const product = item.product || {};
                    const image = item.image || product.images?.[0] || '/placeholder-product.png';
                    const name = item.name || product.name;
                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        <img
                          src={image}
                          alt={name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                  </div>
                  {cartCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(useCart().discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-400">Calculated next</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GST (18%)</span>
                    <span>
                      {formatPrice(
                        items.reduce((s, i) => s + i.price * i.quantity, 0) * GST_RATE
                      )}
                    </span>
                  </div>
                </div>

                {/* Selected Address Preview */}
                {selectedAddress && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 mb-1">Delivering to:</p>
                    <p className="text-sm font-medium text-[#1D3557]">
                      {selectedAddress.label} - {selectedAddress.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedAddress.street}, {selectedAddress.city}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Bar */}
        {step < 3 && (
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-[#E63946]">
                  {formatPrice(
                    items.reduce((s, i) => s + i.price * i.quantity, 0) * (1 + GST_RATE)
                  )}
                </p>
              </div>
              {step === 1 ? (
                <button
                  onClick={handleContinueToPayment}
                  className="px-6 py-3 bg-[#E63946] text-white font-semibold rounded-xl flex items-center gap-2"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <Link
                  to="/cart"
                  className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
