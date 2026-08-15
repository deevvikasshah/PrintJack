import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const ACTIVE_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'in_production',
  'quality_check',
  'shipped',
];

export default function TrackOrderFab() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [expanding, setExpanding] = useState(false);
  const [activeOrders, setActiveOrders] = useState(0);

  const isTrackPage = pathname === '/track-order';

  const fetchActiveOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('printjack_token');
      if (!token) return;
      const { data } = await api.get('/orders/my', {
        params: { limit: 50, status: ACTIVE_ORDER_STATUSES.join(',') },
      });
      if (data?.orders) {
        setActiveOrders(data.orders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.orderStatus)).length);
      }
    } catch {
      setActiveOrders(0);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrders();
    const timer = setInterval(fetchActiveOrders, 120000);
    return () => clearInterval(timer);
  }, [fetchActiveOrders]);

  const handleClick = () => {
    if (expanding) return;
    setExpanding(true);
    setTimeout(() => navigate('/track-order'), 550);
  };

  if (isTrackPage) return null;

  return (
    <>
      {expanding && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1 }}
        >
          <motion.div
            className="absolute rounded-full bg-navy-700"
            style={{ width: 64, height: 64, bottom: 176, right: 24 }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 45, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}

      <button
        onClick={handleClick}
        aria-label="Track your order"
        title="Track your order"
        className="clock-fab-glow group fixed bottom-44 right-6 z-[70] w-16 h-16 rounded-full bg-navy-700 hover:bg-navy-800 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping" style={{ animationDuration: '2.5s' }} />
        {activeOrders > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1">
            <span className="rounded-full h-5 bg-brand-500 border-2 border-white flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-white leading-none">
                {activeOrders > 9 ? '9+' : activeOrders}
              </span>
            </span>
          </span>
        )}
        <span className="absolute -top-12 right-0 bg-navy-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none shadow-lg">
          Track your order
        </span>

        <svg viewBox="0 0 100 100" className="relative w-9 h-9" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
          <circle cx="50" cy="50" r="40" strokeOpacity="0.25" />
          <circle cx="50" cy="50" r="40" className="opacity-40" strokeDasharray="4 6" />
          <g className="clock-hand clock-minute-hand" strokeWidth="5">
            <line x1="50" y1="50" x2="50" y2="26" />
          </g>
          <g className="clock-hand clock-second-hand" stroke="#E63946" strokeWidth="3">
            <line x1="50" y1="52" x2="50" y2="18" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#E63946" stroke="none" />
        </svg>
      </button>
    </>
  );
}