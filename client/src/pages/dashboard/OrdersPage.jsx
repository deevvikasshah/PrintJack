import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Truck, Eye } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_TAB_MAP = {
  all: null,
  processing: ['pending', 'confirmed', 'processing', 'printing', 'quality_check'],
  shipped: ['shipped', 'out_for_delivery'],
  delivered: ['delivered'],
  cancelled: ['cancelled', 'returned'],
};

const TIMELINE_STAGES = [
  'pending',
  'confirmed',
  'processing',
  'printing',
  'quality_check',
  'shipped',
  'out_for_delivery',
  'delivered',
];

function StatusTimeline({ currentStatus }) {
  const currentIndex = TIMELINE_STAGES.indexOf(currentStatus);

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex items-center min-w-[600px] px-4">
        {TIMELINE_STAGES.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={`text-[10px] mt-1.5 text-center whitespace-nowrap ${
                    isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {getStatusLabel(stage)}
                </span>
              </div>
              {index < TIMELINE_STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-5 ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Order Header */}
      <div
        className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Items Preview */}
            <div className="flex -space-x-2 flex-shrink-0">
              {order.items?.slice(0, 3).map((item, i) => {
                const image = item.image || item.product?.images?.[0] || '/placeholder-product.png';
                return (
                  <img
                    key={i}
                    src={image}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover border-2 border-white"
                  />
                );
              })}
              {order.items?.length > 3 && (
                <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                  +{order.items.length - 3}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-[#1D3557]">
                  #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                </p>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(order.createdAt)} • {order.items?.length || 0} item
                {(order.items?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <p className="font-bold text-[#1D3557] text-sm sm:text-base">
              {formatPrice(order.totalAmount || order.total)}
            </p>
            {expanded ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
          {/* Status Timeline */}
          <StatusTimeline currentStatus={order.status} />

          {/* Items List */}
          <div className="mt-5 space-y-3">
            {order.items?.map((item, i) => {
              const image = item.image || item.product?.images?.[0] || '/placeholder-product.png';
              const name = item.name || item.product?.name || 'Product';
              const hasDesign = !!(item.designId || item.design);
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="relative flex-shrink-0">
                    <img src={image} alt={name} className="w-14 h-14 rounded-lg object-cover" />
                    {hasDesign && (
                      <div className="absolute -top-1 -left-1 bg-[#E63946] text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="text-[8px]">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
                    <p className="text-xs text-gray-500">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && ' • '}
                      {item.color && `Color: ${item.color}`}
                      {` • Qty: ${item.quantity}`}
                    </p>
                    {hasDesign && (
                      <Link
                        to={`/editor/${item.product?._id || item.productId}`}
                        className="text-xs text-[#E63946] hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        View Design <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#1D3557] flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="mt-4 p-3 bg-white rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-1">Shipping Address</p>
              <p className="text-sm text-[#1D3557]">{order.shippingAddress.fullName}</p>
              <p className="text-xs text-gray-500">
                {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          )}

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
              <Truck size={16} className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-700">Tracking Number</p>
                <p className="text-sm font-semibold text-blue-800">{order.trackingNumber}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/dashboard/orders/${order._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E63946] text-white text-sm font-medium rounded-xl hover:bg-[#c62d38] transition-colors"
            >
              <Eye size={14} />
              View Details
            </Link>
            {order.status === 'delivered' && (
              <button
                onClick={() => toast.success('Reorder feature coming soon!')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} />
                Reorder
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const statuses = STATUS_TAB_MAP[activeTab];
      const params = { page: currentPage, limit: 10 };
      if (statuses) params.status = statuses.join(',');
      const { data } = await api.get('/orders/my', { params });
      setOrders(data.orders || data || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 10) || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all' ? orders.length : 0;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557] mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-[#E63946] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No ${
            activeTab === 'all' ? '' : activeTab + ' '
          }orders found`}
          description={
            activeTab === 'all'
              ? "You haven't placed any orders yet. Start exploring our products!"
              : `You don't have any ${activeTab} orders at the moment.`
          }
          actionLabel={activeTab === 'all' ? 'Start Shopping' : null}
          actionTo="/products"
        />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
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
