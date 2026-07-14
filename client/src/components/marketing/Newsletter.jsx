import React, { useState } from 'react';
import { Send, CheckCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function Newsletter({
  variant = 'default',
  title = 'Stay in the Loop',
  subtitle = 'Get exclusive offers, design tips, and new product launches straight to your inbox.',
  className = '',
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      setStatus('success');
      setEmail('');
      toast.success('Subscribed successfully!');
    } catch {
      setStatus('error');
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={`text-center ${className}`}>
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-[#1D3557]">You're subscribed!</h3>
        <p className="text-sm text-gray-500 mt-1">Welcome to the PrintJack family.</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E63946] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#E63946] text-white rounded-xl text-sm font-semibold hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Send size={14} />
          {loading ? '...' : 'Subscribe'}
        </button>
      </form>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`bg-gradient-to-br from-[#1D3557] to-[#1D3557]/90 rounded-2xl p-6 text-white ${className}`}>
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-4">
          <Mail size={20} />
        </div>
        <h3 className="text-lg font-bold mb-1">Subscribe to Blog</h3>
        <p className="text-white/70 text-sm mb-4">Get the latest printing tips and design inspiration.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-[#E63946] text-white rounded-xl text-sm font-semibold hover:bg-[#c62d38] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={14} />
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        <p className="text-white/40 text-xs mt-3 text-center">No spam, unsubscribe anytime.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-[#E63946] to-red-600 rounded-2xl p-8 text-white ${className}`}>
      <div className="text-center">
        <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={24} />
        </div>
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="text-white/80 mt-2 max-w-md mx-auto">{subtitle}</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-5 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1D3557] hover:bg-[#1D3557]/90 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        <p className="text-white/50 text-xs mt-3">No spam, unsubscribe anytime.</p>
      </div>
    </div>
  );
}
