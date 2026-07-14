import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import { useApi } from '../hooks/useApi';
import api from '../utils/api';
import { formatDate, getStatusLabel, getStatusColor } from '../utils/formatters';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const { execute: trackOrder, data: orderData, loading, error } = useApi(api.get);

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      trackOrder(`/orders/track?orderId=${orderId.trim()}&email=${email.trim()}`);
    }
  };

  const statuses = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'printing', label: 'Printing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const currentStep = orderData?.order ? statuses.findIndex((s) => s.key === orderData.order.status) : -1;

  return (
    <>
      <Helmet><title>Track Order | PrintJack</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Track Order' }]} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1D3557] mb-3">Track Your Order</h1>
          <p className="text-gray-500">Enter your order ID to check the status of your order.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., PJ-12345"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] bg-gray-50"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#E63946] text-white font-medium rounded-xl hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Search size={18} />
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-6">
            <p className="text-sm text-red-600">Order not found. Please check your order ID and try again.</p>
          </div>
        )}

        {orderData?.order && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#1D3557]">Order {orderData.order.orderId}</h2>
                <p className="text-sm text-gray-500">Placed on {formatDate(orderData.order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderData.order.status)}`}>
                {getStatusLabel(orderData.order.status)}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {statuses.map((status, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={status.key} className="relative flex items-start gap-4">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-[#E63946]' : 'bg-gray-100'
                      }`}>
                        <status.icon size={20} className={isCompleted ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div className="pt-3">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-[#1D3557]' : 'text-gray-400'}`}>{status.label}</p>
                        {isCurrent && orderData.order.updatedAt && (
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(orderData.order.updatedAt)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {orderData.order.trackingNumber && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="text-sm font-mono font-medium text-[#1D3557]">{orderData.order.trackingNumber}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
