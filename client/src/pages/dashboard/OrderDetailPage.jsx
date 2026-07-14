import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Download,
  HelpCircle,
  ExternalLink,
  XCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const TIMELINE_STAGES = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'printing', label: 'Printing' },
  { key: 'quality_check', label: 'Quality Check' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function StatusTimeline({ currentStatus }) {
  const currentIndex = TIMELINE_STAGES.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-center">
        <XCircle size={32} className="text-red-500 mx-auto mb-2" />
        <p className="font-semibold text-red-700">This order has been cancelled</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {TIMELINE_STAGES.map((stage, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
              >
                {isCompleted ? <CheckCircle size={16} /> : index + 1}
              </div>
              {index < TIMELINE_STAGES.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <div className="pb-8">
              <p
                className={`text-sm font-medium ${
                  isCompleted ? 'text-green-700' : 'text-gray-400'
                }`}
              >
                {stage.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-gray-500 mt-0.5">Current status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.order || data);
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await api.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PrintJack-Invoice-${order.orderNumber || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order?.status);

  if (loading) {
    return <Loading fullPage={false} />;
  }

  if (!order) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="p-2 text-gray-500 hover:text-[#1D3557] hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557]">
            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1D3557] mb-4">Order Status</h2>
            <StatusTimeline currentStatus={order.status} />
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1D3557] mb-4">
              Items ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => {
                const image = item.image || item.product?.images?.[0] || '/placeholder-product.png';
                const name = item.name || item.product?.name || 'Product';
                const productId = item.product?._id || item.productId;
                const hasDesign = !!(item.designId || item.design);
                return (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative flex-shrink-0">
                      <img
                        src={image}
                        alt={name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      {hasDesign && (
                        <div className="absolute -top-1 -left-1 bg-[#E63946] text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <span className="text-[10px]">✦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1D3557]">{name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.size && (
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            Color: {item.color}
                          </span>
                        )}
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      {hasDesign && (
                        <Link
                          to={`/editor/${productId}`}
                          className="inline-flex items-center gap-1 text-xs text-[#E63946] hover:underline mt-2"
                        >
                          View Design <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                    <p className="font-bold text-[#1D3557] flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1D3557] mb-4">Price Details</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal || order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">
                  {order.shippingCost === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(order.shippingCost || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GST</span>
                <span className="font-medium">{formatPrice(order.gst || 0)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-[#E63946]">
                  {formatPrice(order.totalAmount || order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1D3557] mb-3 flex items-center gap-2">
                <MapPin size={16} />
                Shipping Address
              </h2>
              <p className="text-sm font-medium text-gray-700">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.street}</p>
              <p className="text-sm text-gray-500">
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </p>
              <p className="text-xs text-gray-400 mt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1D3557] mb-3 flex items-center gap-2">
              <CreditCard size={16} />
              Payment Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${
                    order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {getStatusLabel(order.paymentStatus || 'pending')}
                </span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-xs">{order.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1D3557] mb-3 flex items-center gap-2">
                <Truck size={16} />
                Tracking
              </h2>
              <p className="text-sm text-gray-700 font-medium">{order.trackingNumber}</p>
              {order.courierPartner && (
                <p className="text-xs text-gray-500 mt-1">
                  via {order.courierPartner}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleDownloadInvoice}
              className="w-full py-3 bg-[#1D3557] text-white font-medium rounded-xl hover:bg-[#152a47] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              Download Invoice
            </button>

            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 border border-red-200 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}

            <a
              href="/contact"
              className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <HelpCircle size={16} />
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
        size="sm"
      >
        <div className="text-center py-4">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-1">Are you sure you want to cancel this order?</p>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. You will receive a full refund if payment was made.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {cancelling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Yes, Cancel Order'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
