import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Download, Calendar,
  DollarSign, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { get } from '../../utils/api';
import { formatPrice } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [revenuePeriod, setRevenuePeriod] = useState('daily');

  const [metrics, setMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [ordersByStatus, setOrdersByStatus] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState(null);
  const [customerAcquisition, setCustomerAcquisition] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, revenuePeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;
      params.period = revenuePeriod;

      const [metricsRes, revenueRes, ordersRes, topRes, catRes, custRes] = await Promise.allSettled([
        get('/analytics/metrics', { params }),
        get('/analytics/revenue-chart', { params: { ...params, period: revenuePeriod } }),
        get('/analytics/orders-by-status', { params }),
        get('/analytics/top-products', { params: { limit: 10 } }),
        get('/analytics/category-performance', { params }),
        get('/analytics/customer-acquisition', { params }),
      ]);

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data);
      if (revenueRes.status === 'fulfilled') setRevenueData(revenueRes.value.data);
      if (ordersRes.status === 'fulfilled') setOrdersByStatus(ordersRes.value.data);
      if (topRes.status === 'fulfilled') setTopProducts(topRes.value.data.products || topRes.value.data || []);
      if (catRes.status === 'fulfilled') setCategoryPerformance(catRes.value.data);
      if (custRes.status === 'fulfilled') setCustomerAcquisition(custRes.value.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;
      const { data } = await get('/analytics/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const lineChartOptions = {
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
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 7, color: '#9CA3AF', font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 }, callback: (v) => `₹${(v / 1000).toFixed(0)}k` } },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } },
    },
  };

  const revenueChart = {
    labels: revenueData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: revenueData?.data || [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: '#E63946',
      backgroundColor: 'rgba(230, 57, 70, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#E63946',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  };

  const ordersChart = {
    labels: (ordersByStatus?.labels || ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).map((s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())),
    datasets: [{
      label: 'Orders',
      data: ordersByStatus?.data || [5, 12, 8, 45, 3],
      backgroundColor: ['#FBBF24', '#6366F1', '#3B82F6', '#22C55E', '#EF4444'],
      borderRadius: 8,
      barThickness: 32,
    }],
  };

  const categoryChart = {
    labels: categoryPerformance?.labels || ['T-Shirts', 'Hoodies', 'Mugs', 'Phone Cases', 'Stickers'],
    datasets: [{
      data: categoryPerformance?.data || [35, 25, 20, 12, 8],
      backgroundColor: ['#E63946', '#1D3557', '#2563EB', '#16A34A', '#9333EA'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const customerChart = {
    labels: customerAcquisition?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Customers',
      data: customerAcquisition?.data || [15, 25, 20, 35, 30, 45],
      borderColor: '#1D3557',
      backgroundColor: 'rgba(29, 53, 87, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#1D3557',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  };

  if (loading) return <Loading fullPage={false} />;

  const keyMetrics = [
    { label: 'Average Order Value', value: formatPrice(metrics?.aov || 0), change: metrics?.aovChange || 0, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Conversion Rate', value: `${metrics?.conversionRate || 0}%`, change: metrics?.conversionChange || 0, icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Repeat Customer Rate', value: `${metrics?.repeatCustomerRate || 0}%`, change: metrics?.repeatChange || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: formatPrice(metrics?.totalRevenue || 0), change: metrics?.revenueChange || 0, icon: DollarSign, color: 'bg-[#E63946]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#1D3557]">Analytics & Reports</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#1D3557] text-white text-sm font-medium rounded-xl hover:bg-[#152840] transition-colors"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${metric.color} rounded-xl flex items-center justify-center`}>
                <metric.icon size={20} className="text-white" />
              </div>
              {metric.change !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(metric.change)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#1D3557]">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1D3557]">Revenue</h2>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {['daily', 'weekly', 'monthly'].map((period) => (
              <button
                key={period}
                onClick={() => setRevenuePeriod(period)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  revenuePeriod === period
                    ? 'bg-white text-[#1D3557] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <Line data={revenueChart} options={lineChartOptions} />
        </div>
      </div>

      {/* Orders by Status + Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1D3557] mb-4">Orders by Status</h2>
          <div className="h-72">
            <Bar data={ordersChart} options={barChartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1D3557] mb-4">Category Performance</h2>
          <div className="h-72">
            <Pie data={categoryChart} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#1D3557]">Top Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Units Sold</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No data yet</td></tr>
              ) : (
                topProducts.map((product, idx) => (
                  <tr key={product._id || idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-bold text-gray-300">{idx + 1}</td>
                    <td className="px-6 py-3 font-medium text-[#1D3557]">{product.name}</td>
                    <td className="px-6 py-3 text-gray-500 capitalize">{product.category?.replace(/-/g, ' ')}</td>
                    <td className="px-6 py-3 text-gray-600">{product.totalSold || 0}</td>
                    <td className="px-6 py-3 font-semibold text-[#1D3557]">{formatPrice(product.totalRevenue || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Acquisition */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1D3557] mb-4">Customer Acquisition</h2>
        <div className="h-72">
          <Line data={customerChart} options={{
            ...lineChartOptions,
            scales: {
              ...lineChartOptions.scales,
              y: { ...lineChartOptions.scales.y, ticks: { ...lineChartOptions.scales.y.ticks, callback: (v) => v } },
            },
          }} />
        </div>
      </div>
    </div>
  );
}
