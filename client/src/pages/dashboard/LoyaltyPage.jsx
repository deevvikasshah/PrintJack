import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Star,
  Gift,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Info,
} from 'lucide-react';
import api from '../../utils/api';
import { formatDate, formatPrice } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';

const EARN_INFO = [
  {
    icon: ShoppingBag,
    title: 'Shop & Earn',
    description: 'Earn 1 point for every ₹10 spent on orders',
    points: '1 pt / ₹10',
  },
  {
    icon: Users,
    title: 'Refer Friends',
    description: 'Earn 100 points for each successful referral',
    points: '100 pts',
  },
  {
    icon: Star,
    title: 'Write Reviews',
    description: 'Earn 25 points for verified product reviews',
    points: '25 pts',
  },
  {
    icon: Gift,
    title: 'Birthday Bonus',
    description: 'Get 50 bonus points on your birthday',
    points: '50 pts',
  },
];

const REDEEM_OPTIONS = [
  { points: 100, value: 50, label: '₹50 Off' },
  { points: 250, value: 150, label: '₹150 Off' },
  { points: 500, value: 350, label: '₹350 Off' },
  { points: 1000, value: 750, label: '₹750 Off' },
];

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [redeeming, setRedeeming] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/loyalty/history', {
        params: { page: currentPage, limit: 15 },
      });
      setHistory(data.history || data.points || data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRedeem = async (option) => {
    if ((user?.loyaltyPoints || 0) < option.points) {
      return;
    }
    try {
      setRedeeming(option.points);
      await api.post('/loyalty/redeem', { points: option.points });
      fetchHistory();
    } catch (err) {
      const { default: toast } = await import('react-hot-toast');
      toast.error(err.response?.data?.message || 'Failed to redeem points');
    } finally {
      setRedeeming(null);
    }
  };

  const currentPoints = user?.loyaltyPoints || 0;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557] mb-6">Loyalty Points</h1>

      {/* Points Balance */}
      <div className="bg-gradient-to-br from-[#1D3557] to-[#2a4a7a] rounded-2xl p-6 sm:p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Award size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-white/70">Current Balance</p>
            <p className="text-3xl sm:text-4xl font-bold">{currentPoints.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-sm text-white/60">
          {currentPoints >= 100
            ? 'You can redeem your points for discounts!'
            : `Earn ${100 - currentPoints} more points to start redeeming.`}
        </p>
        {/* Progress bar to next redemption */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>0 pts</span>
            <span>100 pts</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((currentPoints / 100) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Points History */}
        <div className="lg:col-span-1">
          <h2 className="font-semibold text-[#1D3557] mb-4">Points History</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Info size={24} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No points history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, i) => (
                <div
                  key={entry._id || i}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      entry.points > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {entry.points > 0 ? (
                      <ArrowUpRight size={18} className="text-green-600" />
                    ) : (
                      <ArrowDownRight size={18} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {entry.description || entry.type || 'Transaction'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold flex-shrink-0 ${
                      entry.points > 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {entry.points > 0 ? '+' : ''}{entry.points}
                  </span>
                </div>
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* How to Earn */}
          <div>
            <h2 className="font-semibold text-[#1D3557] mb-4">How to Earn Points</h2>
            <div className="space-y-3">
              {EARN_INFO.map((info, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <info.icon size={18} className="text-[#E63946]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1D3557]">{info.title}</p>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                  <span className="text-xs font-bold text-[#E63946] bg-red-50 px-2 py-1 rounded-lg flex-shrink-0">
                    {info.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Redeem Options */}
          <div>
            <h2 className="font-semibold text-[#1D3557] mb-4">Redeem Points</h2>
            <div className="grid grid-cols-2 gap-3">
              {REDEEM_OPTIONS.map((option) => {
                const canRedeem = currentPoints >= option.points;
                return (
                  <div
                    key={option.points}
                    className={`bg-white rounded-xl border p-4 text-center transition-all ${
                      canRedeem
                        ? 'border-[#E63946] hover:shadow-md cursor-pointer'
                        : 'border-gray-200 opacity-50'
                    }`}
                  >
                    <p className="text-2xl font-bold text-[#1D3557]">{option.label}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.points} points
                    </p>
                    <button
                      onClick={() => handleRedeem(option)}
                      disabled={!canRedeem || redeeming === option.points}
                      className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                        canRedeem
                          ? 'bg-[#E63946] text-white hover:bg-[#c62d38]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      {redeeming === option.points ? (
                        <Loader2 size={14} className="animate-spin mx-auto" />
                      ) : canRedeem ? (
                        'Redeem'
                      ) : (
                        'Not enough'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
