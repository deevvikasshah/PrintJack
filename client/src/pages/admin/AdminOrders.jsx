import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, ChevronDown, ChevronUp, Eye, Truck, Package,
  CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Calendar,
  MoreVertical, FileText,
} from 'lucide-react';
import { get, patch } from '../../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const limit = 15;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, sort: '-createdAt' };
      if (filters.status) params.status = filters.status;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.search) params.search = filters.search;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const { data } = await get('/admin/orders', { params });
      setOrders(data.orders || data || []);
      setTotalPages(data.totalPages || 1);
      setStats(data.stats || null);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await patch(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      setShowStatusModal(null);
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) return toast.error('Select orders first');
    try {
      await patch('/admin/orders/bulk-update', { orderIds: selectedOrders, action });
      setSelectedOrders([]);
      fetchOrders();
      toast.success('Bulk action completed');
    } catch (err) {
      toast.error('Bulk action failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['Order #', 'Customer', 'Email', 'Items', 'Total', 'Payment Status', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.orderNumber || o._id?.slice(-6),
      o.user?.name || o.shippingAddress?.name || '',
      o.user?.email || '',
      o.items?.length || 0,
      o.totalAmount,
      o.paymentStatus,
      o.status,
      new Date(o.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported');
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o._id));
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const statCards = [
    { label: 'Total', value: stats?.total || orders.length, color: 'text-[#1D3557]' },
    { label: 'Pending', value: stats?.pending || 0, color: 'text-yellow-600' },
    { label: 'Processing', value: stats?.processing || 0, color: 'text-indigo-600' },
    { label: 'Shipped', value: stats?.shipped || 0, color: 'text-blue-600' },
    { label: 'Delivered', value: stats?.delivered || 0, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">Order Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#1D3557] text-white text-sm font-medium rounded-xl hover:bg-[#152840] transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946]"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          >
            <option value="">All Status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{getStatusLabel(s)}</option>
            ))}
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
          >
            <option value="">All Payment</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{getStatusLabel(s)}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/20"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">{selectedOrders.length} selected</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Bulk Actions</option>
              <option value="mark_shipped">Mark Shipped</option>
              <option value="mark_delivered">Mark Delivered</option>
              <option value="cancel">Cancel Orders</option>
            </select>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12"><Loading fullPage={false} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-400">No orders found</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr
                          className="hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order._id)}
                              onChange={() => toggleSelectOrder(order._id)}
                              className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#1D3557]">
                            {order.orderNumber || order._id?.slice(-6)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{order.user?.name || order.shippingAddress?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600">{order.items?.length || 0}</td>
                          <td className="px-4 py-3 font-medium text-[#1D3557]">{formatPrice(order.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                              {getStatusLabel(order.paymentStatus)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                {expandedOrder === order._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => {
                                    setShowStatusModal(showStatusModal === order._id ? null : order._id);
                                    setNewStatus(order.status);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-[#1D3557] hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Update Status"
                                >
                                  <RefreshCw size={14} />
                                </button>
                                {showStatusModal === order._id && (
                                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2">
                                    <p className="text-xs text-gray-400 px-2 mb-1">Update Status</p>
                                    <select
                                      value={newStatus}
                                      onChange={(e) => setNewStatus(e.target.value)}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2"
                                    >
                                      {ORDER_STATUSES.map((s) => (
                                        <option key={s} value={s}>{getStatusLabel(s)}</option>
                                      ))}
                                    </select>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => updateOrderStatus(order._id, newStatus)}
                                        className="flex-1 px-3 py-1.5 bg-[#E63946] text-white text-xs font-medium rounded-lg hover:bg-[#c62d38]"
                                      >
                                        Update
                                      </button>
                                      <button
                                        onClick={() => setShowStatusModal(null)}
                                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedOrder === order._id && (
                          <tr>
                            <td colSpan={9} className="px-4 py-4 bg-gray-50/80">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Details */}
                                <div>
                                  <h4 className="text-sm font-semibold text-[#1D3557] mb-3">Order Details</h4>
                                  <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Order ID:</span>
                                      <span className="font-medium">{order._id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Payment Method:</span>
                                      <span className="font-medium capitalize">{order.paymentMethod || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Subtotal:</span>
                                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Shipping:</span>
                                      <span className="font-medium">{formatPrice(order.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Tax:</span>
                                      <span className="font-medium">{formatPrice(order.tax)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Discount:</span>
                                        <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between border-t border-gray-100 pt-2">
                                      <span className="text-gray-700 font-semibold">Total:</span>
                                      <span className="font-bold text-[#E63946]">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                  <h4 className="text-sm font-semibold text-[#1D3557] mb-3">Shipping Address</h4>
                                  <div className="bg-white rounded-xl p-4 text-sm text-gray-600">
                                    <p className="font-medium text-[#1D3557]">{order.shippingAddress?.name}</p>
                                    <p>{order.shippingAddress?.street}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                    <p>Phone: {order.shippingAddress?.phone}</p>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div className="md:col-span-2">
                                  <h4 className="text-sm font-semibold text-[#1D3557] mb-3">Items</h4>
                                  <div className="space-y-2">
                                    {order.items?.map((item, idx) => (
                                      <div key={idx} className="bg-white rounded-xl p-3 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                          {item.product?.images?.[0] || item.image ? (
                                            <img src={item.product?.images?.[0] || item.image} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                              <Package size={20} />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-[#1D3557] truncate">{item.product?.name || item.name}</p>
                                          <p className="text-xs text-gray-400">
                                            {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`} &middot; Qty: {item.quantity}
                                          </p>
                                        </div>
                                        <p className="text-sm font-semibold text-[#1D3557]">{formatPrice(item.price * item.quantity)}</p>
                                        {item.designImage && (
                                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.designImage} alt="Design" className="w-full h-full object-cover" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
