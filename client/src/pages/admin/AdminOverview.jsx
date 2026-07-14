import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Clock, Users, Package, TrendingUp, TrendingDown,
  Plus, BarChart3, Ticket, ChevronRight, Check, X as XIcon, Eye, Star,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { get } from '../../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import Loading from '../../components/common/Loading';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [ordersChart, setOrdersChart] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingDesigns, setPendingDesigns] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, ordersRes, recentOrdersRes, designsRes, topRes] = await Promise.allSettled([
        get('/analytics/dashboard-stats'),
        get('/analytics/revenue-chart?period=30'),
        get('/analytics/orders-by-status'),
        get('/admin/orders?limit=10&sort=-createdAt'),
        get('/admin/designs?status=pending&limit=5'),
        get('/analytics/top-products?limit=5'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (revenueRes.status === 'fulfilled') setRevenueChart(revenueRes.value.data);
      if (ordersRes.status === 'fulfilled') setOrdersChart(ordersRes.value.data);
      if (recentOrdersRes.status === 'fulfilled') setRecentOrders(recentOrdersRes.value.data.orders || recentOrdersRes.value.data || []);
      if (designsRes.status === 'fulfilled') setPendingDesigns(designsRes.value.data.designs || designsRes.value.data || []);
      if (topRes.status === 'fulfilled') setTopProducts(topRes.value.data.products || topRes.value.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDesignAction = async (designId, action, notes = '') => {
    try {
      await get(`/admin/designs/${designId}/${action}`, { params: { notes } });
      setPendingDesigns((prev) => prev.filter((d) => d._id !== designId));
    } catch (err) {
      console.error('Failed to update design', err);
    }
  };

  if (loading) return <Loading fullPage={false} />;

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), change: stats?.revenueChange || 0, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, change: stats?.ordersChange || 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, change: 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Active Users', value: stats?.activeUsers || 0, change: stats?.usersChange || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Products', value: stats?.totalProducts || 0, change: 0, icon: Package, color: 'bg-[#1D3557]' },
  ];

  const revenueChartData = {
    labels: revenueChart?.labels || Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Revenue',
        data: revenueChart?.data || Array.from({ length: 30 }, () => Math.floor(Math.random() * 10000) + 1000),
        borderColor: '#E63946',
        backgroundColor: 'rgba(230, 57, 70, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#E63946',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1D3557',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 12,
        callbacks: { label: (ctx) => `Revenue: ${formatPrice(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 7, color: '#9CA3AF', font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 }, callback: (v) => `₹${(v / 1000).toFixed(0)}k` } },
    },
  };

  const ordersChartData = {
    labels: (ordersChart?.labels || ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).map(getStatusLabel),
    datasets: [
      {
        data: ordersChart?.data || [5, 12, 8, 45, 3],
        backgroundColor: ['#FBBF24', '#6366F1', '#3B82F6', '#22C55E', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const ordersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } },
    },
    cutout: '65%',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D3557]">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
              {card.change !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(card.change)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#1D3557]">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1D3557]">Revenue (Last 30 Days)</h2>
            <Link to="/admin/analytics" className="text-sm text-[#E63946] hover:underline flex items-center gap-1">
              View Details <ChevronRight size={14} />
            </Link>
          </div>
          <div className="h-64">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1D3557] mb-4">Orders by Status</h2>
          <div className="h-64">
            <Doughnut data={ordersChartData} options={ordersChartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Orders + Pending Designs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1D3557]">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-[#E63946] hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Order #</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No orders yet</td></tr>
                ) : (
                  recentOrders.slice(0, 10).map((order) => (
                    <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                      <td className="px-6 py-3 font-medium text-[#1D3557]">{order.orderNumber || order._id?.slice(-6)}</td>
                      <td className="px-6 py-3 text-gray-600">{order.user?.name || order.shippingAddress?.name || 'N/A'}</td>
                      <td className="px-6 py-3 text-gray-600 font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Design Approvals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1D3557]">Pending Designs</h2>
            <Link to="/admin/designs" className="text-sm text-[#E63946] hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {pendingDesigns.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No pending designs</p>
            ) : (
              pendingDesigns.map((design) => (
                <div key={design._id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {design.previewImage || design.thumbnail ? (
                        <img src={design.previewImage || design.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D3557] truncate">{design.product?.name || 'Custom Design'}</p>
                      <p className="text-xs text-gray-400">{design.user?.name} &middot; {formatDate(design.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleDesignAction(design._id, 'approve')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleDesignAction(design._id, 'reject')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XIcon size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Products + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1D3557]">Top Selling Products</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">No product data yet</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product._id} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50/50">
                  <span className="text-sm font-bold text-gray-300 w-6">#{index + 1}</span>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D3557] truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.totalSold || 0} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1D3557]">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-0.5 text-xs text-yellow-500">
                      <Star size={10} fill="currentColor" />
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#1D3557] mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1D3557] group-hover:text-green-700">Add Product</p>
                <p className="text-xs text-gray-400">Create a new product listing</p>
              </div>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1D3557] group-hover:text-blue-700">View Reports</p>
                <p className="text-xs text-gray-400">Analytics and performance data</p>
              </div>
            </Link>
            <Link
              to="/admin/coupons"
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Ticket size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1D3557] group-hover:text-purple-700">Manage Coupons</p>
                <p className="text-xs text-gray-400">Create and manage discount codes</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
