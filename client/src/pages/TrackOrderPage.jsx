import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  PackageX,
  RotateCcw,
  PackageCheck,
} from 'lucide-react';
import api from '../utils/api';
import { formatDate } from '../utils/formatters';

const STAGES = [
  { key: 'placed', label: 'Order Placed', icon: CheckCircle2, statuses: ['pending', 'confirmed'] },
  { key: 'printing', label: 'Printing in Progress', icon: Clock, statuses: ['in_production'] },
  { key: 'quality', label: 'Quality Check', icon: ShieldCheck, statuses: ['quality_check'] },
  { key: 'packed', label: 'Packed', icon: PackageCheck, statuses: [] },
  { key: 'shipped', label: 'Shipped', icon: Truck, statuses: ['shipped'] },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, statuses: [] },
  { key: 'delivered', label: 'Delivered', icon: MapPin, statuses: ['delivered'] },
];

const STATUS_TO_INDEX = {
  pending: 0,
  confirmed: 0,
  in_production: 1,
  quality_check: 2,
  shipped: 4,
  delivered: 6,
};

const LIVE_STATUS_TEXT = {
  pending: 'Your order is being confirmed.',
  confirmed: 'Your order is confirmed and queued for production.',
  in_production: 'Your order is currently being printed.',
  quality_check: 'Your order is undergoing quality checks.',
  shipped: 'Your order has been shipped and is on its way.',
  delivered: 'Your order has been delivered. Enjoy!',
  cancelled: 'This order has been cancelled.',
  returned: 'This order has been returned.',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function getStepIndex(status) {
  if (!status) return -1;
  if (status === 'cancelled' || status === 'returned') return -1;
  return STATUS_TO_INDEX[status] ?? 0;
}

function getStepTimestamp(statusHistory, stage) {
  if (!Array.isArray(statusHistory)) return null;
  for (const s of stage.statuses) {
    const entry = statusHistory.find((h) => h.status === s);
    if (entry?.date) return entry.date;
  }
  if (stage.key === 'packed') {
    const shipped = statusHistory.find((h) => h.status === 'shipped');
    return shipped?.date || null;
  }
  if (stage.key === 'out_for_delivery') {
    const delivered = statusHistory.find((h) => h.status === 'delivered');
    return delivered?.date || null;
  }
  return null;
}

function Countdown({ target, done }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (done || !target) return null;

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 text-sm font-medium text-navy-700">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
        {days > 0 ? `${days} day${days > 1 ? 's' : ''} left` : `${hours} hour${hours > 1 ? 's' : ''} left`}
      </div>
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: days <= 0 ? '70%' : `${Math.max(5, 100 - days * 15)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(
        `/orders/track?orderId=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      setOrder(data.order);
    } catch (err) {
      setOrder(null);
      setError(err.response?.data?.message || 'Order not found. Please check your order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = useMemo(() => (order ? getStepIndex(order.status) : -1), [order]);

  const isTerminal = order && ['cancelled', 'returned'].includes(order.status);

  const mainItem = order?.items?.[0];

  const formatEta = (eta) => {
    if (!eta) return null;
    return new Date(eta).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }) + ', ' + new Date(eta).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <Helmet><title>Track Order | PrintJack</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2.5 rounded-xl border border-gray-200 text-navy-700 hover:bg-gray-50 hover:border-navy-300 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-navy-700">Track Your Order</h1>
            <p className="text-sm text-gray-500 mt-0.5">Enter your order ID to see live delivery status</p>
          </div>
        </motion.div>

        {/* Search form */}
        <motion.form
          onSubmit={handleTrack}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., PJ-20260815-0001"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 bg-gray-50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6"
            >
              <PackageX size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Order summary card */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-6"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</p>
                  <p className="text-lg font-bold text-navy-700 mt-0.5">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize ${
                  isTerminal
                    ? 'bg-red-100 text-red-600'
                    : order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {order.status?.replace(/_/g, ' ') || 'Pending'}
                </span>
              </div>

              {mainItem && (
                <div className="mt-5 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-200 flex items-center justify-center">
                    {mainItem.image ? (
                      <img src={mainItem.image} alt={mainItem.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={26} className="text-navy-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-700 truncate">{mainItem.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {mainItem.quantity > 1 ? `×${mainItem.quantity}` : '×1'}
                      {order.items?.length > 1 ? ` + ${order.items.length - 1} more item${order.items.length > 2 ? 's' : ''}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Estimated delivery card */}
            {order.estimatedDelivery && (
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-6 bg-gradient-to-br from-navy-700 to-navy-800 text-white shadow-card"
              >
                <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                  <Clock size={16} />
                  Estimated Delivery
                </div>
                <p className="text-xl sm:text-2xl font-display font-bold mt-2">
                  {order.status === 'delivered'
                    ? 'Delivered'
                    : isTerminal
                      ? 'Order not in transit'
                      : `Arriving by ${formatEta(order.estimatedDelivery)}`}
                </p>
                <Countdown target={order.estimatedDelivery} done={order.status === 'delivered'} />
                {order.trackingNumber && (
                  <p className="mt-4 pt-4 border-t border-white/15 text-sm text-white/80">
                    Tracking: <span className="font-mono font-semibold text-white">{order.trackingNumber}</span>
                    {order.shippingPartner ? ` · ${order.shippingPartner}` : ''}
                  </p>
                )}
              </motion.div>
            )}

            {/* Progress tracker */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-6"
            >
              <h2 className="font-semibold text-navy-700 mb-6">Delivery Progress</h2>

              {isTerminal ? (
                <div className="p-5 bg-red-50 rounded-xl border border-red-100 text-center">
                  <RotateCcw size={32} className="text-red-400 mx-auto mb-2" />
                  <p className="font-semibold text-red-700">
                    {order.status === 'cancelled' ? 'This order has been cancelled' : 'This order has been returned'}
                  </p>
                  <p className="text-sm text-red-500 mt-1">Please contact support if you have any questions.</p>
                </div>
              ) : (
                <motion.ol
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="relative space-y-0"
                >
                  <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-200" />
                  {STAGES.map((stage, i) => {
                    const isCompleted = currentStep >= 0 && i <= currentStep;
                    const isCurrent = i === currentStep;
                    const timestamp = getStepTimestamp(order.statusHistory, stage);
                    const Icon = stage.icon;
                    return (
                      <motion.li
                        key={stage.key}
                        variants={itemVariants}
                        className="relative flex items-start gap-4 py-1.5"
                      >
                        <div className="relative z-10">
                          {isCurrent ? (
                            <div className="relative">
                              <span className="absolute -inset-1.5 rounded-full bg-brand-500/30 animate-ping" />
                              <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/30">
                                <Icon size={20} />
                              </div>
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white border-gray-200 text-gray-300'
                            }`}>
                              {isCompleted ? <CheckCircle size={20} /> : <Icon size={18} />}
                            </div>
                          )}
                        </div>
                        <div className="pt-2.5">
                          <p className={`text-sm font-semibold ${isCompleted || isCurrent ? 'text-navy-700' : 'text-gray-400'}`}>
                            {stage.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${isCurrent ? 'text-brand-500 font-medium' : 'text-gray-400'}`}>
                            {isCurrent
                              ? '● In progress'
                              : isCompleted && timestamp
                                ? formatDate(timestamp)
                                : isCompleted
                                  ? 'Completed'
                                  : ''}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ol>
              )}

              {/* Live status text */}
              {!isTerminal && order.status && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 p-4 bg-gradient-to-r from-brand-50 to-white border border-brand-100 rounded-xl"
                >
                  <p className="text-sm font-medium text-navy-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    {LIVE_STATUS_TEXT[order.status] || 'Your order is being processed.'}
                  </p>
                </motion.div>
              )}
            </motion.div>

            <motion.p variants={itemVariants} className="text-center text-xs text-gray-400">
              Need help? Contact support at{' '}
              <a href="mailto:support@printjack.in" className="text-brand-500 hover:underline">support@printjack.in</a>
            </motion.p>
          </motion.div>
        )}
      </div>
    </>
  );
}