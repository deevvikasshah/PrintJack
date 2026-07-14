import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Copy,
  Share2,
  MessageCircle,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  Gift,
  Loader2,
  Info,
  Award,
  Send,
} from 'lucide-react';
import api from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const SHARE_OPTIONS = [
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-500 hover:bg-green-600',
    getUrl: (text, url) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  },
  {
    name: 'Email',
    icon: Mail,
    color: 'bg-blue-500 hover:bg-blue-600',
    getUrl: (text, url) => `mailto:?subject=${encodeURIComponent('Join PrintJack!')}&body=${encodeURIComponent(text + '\n\n' + url)}`,
  },
  {
    name: 'Twitter',
    icon: ExternalLink,
    color: 'bg-sky-500 hover:bg-sky-600',
    getUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
];

const HOW_IT_WORKS = [
  {
    icon: Send,
    title: 'Share Your Code',
    description: 'Share your unique referral code with friends and family',
  },
  {
    icon: UserCheck,
    title: 'Friend Signs Up',
    description: 'Your friend creates an account using your referral code',
  },
  {
    icon: Gift,
    title: 'Both Get Rewarded',
    description: 'You earn 100 points, your friend gets 10% off their first order',
  },
];

function UserCheck(props) {
  return <Users {...props} />;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    rewardsEarned: 0,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || user?.referral?.code || 'PRINTJACK-' + (user?._id?.slice(-6).toUpperCase() || 'XXXXXX');
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.allSettled([
        api.get('/referrals/stats'),
        api.get('/referrals/history', { params: { page: currentPage, limit: 10 } }),
      ]);

      if (statsRes.status === 'fulfilled') {
        const s = statsRes.value.data;
        setStats({
          totalReferrals: s.totalReferrals || s.total || 0,
          successfulReferrals: s.successfulReferrals || s.successful || 0,
          pendingReferrals: s.pendingReferrals || s.pending || 0,
          rewardsEarned: s.rewardsEarned || s.rewards || 0,
        });
      }

      if (historyRes.status === 'fulfilled') {
        const h = historyRes.value.data;
        setHistory(h.referrals || h.history || h || []);
        setTotalPages(h.totalPages || 1);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareText = `Join PrintJack and get 10% off your first order! Use my referral code: ${referralCode}`;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D3557] mb-6">Referral Program</h1>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-[#E63946] to-[#c62d38] rounded-2xl p-6 sm:p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-white/80">Your Referral Code</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-wider">{referralCode}</p>
          </div>
        </div>

        {/* Copy Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={handleCopyCode}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-[#E63946] font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
          >
            <ExternalLink size={16} />
            Copy Referral Link
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3 mt-4">
          {SHARE_OPTIONS.map((option) => (
            <a
              key={option.name}
              href={option.getUrl(shareText, referralLink)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium text-sm transition-colors ${option.color}`}
            >
              <option.icon size={16} />
              <span className="hidden sm:inline">{option.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Referrals', value: stats.totalReferrals, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Successful', value: stats.successfulReferrals, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Pending', value: stats.pendingReferrals, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Rewards Earned', value: stats.rewardsEarned, icon: Award, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color} mb-2`}>
              <stat.icon size={16} />
            </div>
            <p className="text-2xl font-bold text-[#1D3557]">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* How It Works */}
        <div>
          <h2 className="font-semibold text-[#1D3557] mb-4">How It Works</h2>
          <div className="space-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex gap-4">
                <div className="w-10 h-10 bg-[#E63946] rounded-xl flex items-center justify-center flex-shrink-0">
                  <step.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1D3557]">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral History */}
        <div>
          <h2 className="font-semibold text-[#1D3557] mb-4">Referral History</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Info size={24} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No referrals yet</p>
              <p className="text-xs text-gray-400">Share your code to start earning rewards!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((ref, i) => (
                <div
                  key={ref._id || i}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      ref.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}
                  >
                    {ref.status === 'completed' ? (
                      <CheckCircle size={18} className="text-green-600" />
                    ) : (
                      <Clock size={18} className="text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {ref.referredEmail || ref.friendEmail || ref.email || 'Friend'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(ref.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        ref.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {ref.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                    {ref.reward && (
                      <p className="text-xs text-gray-500 mt-1">+{ref.reward} pts</p>
                    )}
                  </div>
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
      </div>
    </div>
  );
}
