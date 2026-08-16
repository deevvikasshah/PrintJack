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
  const [now, setNow] = useState(() => new Date());

  const isTrackPage = pathname === '/track-order';

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(timer);
  }, []);

  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

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

  const ticks = [...Array(12)].map((_, i) => {
    const rad = ((i * 30 - 90) * Math.PI) / 180;
    const r1 = 39;
    const r2 = i % 3 === 0 ? 33 : 35;
    return {
      key: i,
      x1: 50 + r1 * Math.cos(rad),
      y1: 50 + r1 * Math.sin(rad),
      x2: 50 + r2 * Math.cos(rad),
      y2: 50 + r2 * Math.sin(rad),
      major: i % 3 === 0,
    };
  });

  return (
    <>
      {expanding && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1 }}
        >
          <motion.div
            className="absolute rounded-full bg-gradient-to-br from-navy-700 to-brand-500"
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
        className="clock-fab-glow group fixed bottom-44 right-6 z-[70] w-16 h-16 rounded-full bg-gradient-to-br from-navy-700 via-navy-800 to-brand-600 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl"
      >
        <span className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping" style={{ animationDuration: '2.5s' }} />
        <span className="absolute inset-1 rounded-full ring-1 ring-white/20" />
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

        <svg viewBox="0 0 100 100" className="relative w-10 h-10" fill="none" stroke="currentColor" strokeLinecap="round">
          <defs>
            <radialGradient id="fab-clock-face" cx="50%" cy="38%" r="75%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#fab-clock-face)" strokeOpacity="0.35" />
          <circle cx="50" cy="50" r="40" strokeOpacity="0.22" />
          {ticks.map((t) => (
            <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 3.5 : 2} strokeOpacity={t.major ? 0.85 : 0.4} />
          ))}
          <g className="clock-hand" strokeWidth="5" style={{ transform: `rotate(${hourDeg}deg)` }}>
            <line x1="50" y1="50" x2="50" y2="30" />
          </g>
          <g className="clock-hand" strokeWidth="4" style={{ transform: `rotate(${minuteDeg}deg)` }}>
            <line x1="50" y1="50" x2="50" y2="21" />
          </g>
          <g className="clock-hand" stroke="#E63946" strokeWidth="2.5" style={{ transform: `rotate(${secondDeg}deg)` }}>
            <line x1="50" y1="54" x2="50" y2="17" />
          </g>
          <circle cx="50" cy="50" r="4.5" fill="#E63946" stroke="none" />
          <circle cx="50" cy="50" r="1.8" fill="#fff" stroke="none" />
        </svg>
      </button>
    </>
  );
}