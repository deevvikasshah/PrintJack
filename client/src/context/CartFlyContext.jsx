import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const CartFlyContext = createContext(null);

export const useCartFly = () => useContext(CartFlyContext);

const TRAIL_COLORS = [
  '#E63946', '#F72585', '#9B5DE5', '#7B2CBF',
  '#00B4D8', '#2A9D8F', '#FFD166', '#FF9F1C',
  '#EF476F', '#3A0CA3',
];

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function bezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

export function CartFlyProvider({ children }) {
  const cartRef = useRef(null);
  const [flies, setFlies] = useState({});
  const [trail, setTrail] = useState([]);
  const pidRef = useRef(0);
  const frameRef = useRef({});
  const trailTimerRef = useRef({});

  const registerCart = useCallback((el) => {
    cartRef.current = el;
  }, []);

  const flyToCart = useCallback((source, imageSrc, opts = {}) => {
    const target = cartRef.current;
    if (!source || !target) return;

    const size = opts.size || 56;
    const sRect = source.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    if (sRect.width === 0 && sRect.height === 0) return;

    const start = { x: sRect.left + sRect.width / 2, y: sRect.top + sRect.height / 2 };
    const end = { x: tRect.left + tRect.width / 2, y: tRect.top + tRect.height / 2 };
    const dx = end.x - start.x;
    const distX = Math.abs(dx);

    const curve = opts.curve != null ? opts.curve : Math.max(120, Math.min(220, distX * 0.35));
    const c1 = { x: start.x + dx * 0.25, y: start.y - curve * 0.8 };
    const c2 = { x: start.x + dx * 0.75, y: start.y - curve * 0.5 };

    const id = Date.now() + '_' + pidRef.current++;
    const duration = opts.duration || 1000;
    const waveAmp = opts.waveAmp != null ? opts.waveAmp : 26;
    const waveFreq = opts.waveFreq != null ? opts.waveFreq : 3;
    const trailCount = opts.trailCount != null ? opts.trailCount : 18;

    setFlies((prev) => ({
      ...prev,
      [id]: {
        id,
        start,
        c1,
        c2,
        end,
        x: start.x,
        y: start.y,
        imageSrc,
        size,
        scale: 1,
        rotation: 0,
        wobble: 0,
        z: 60,
      },
    }));

    // Colourful trail spawn
    const colors = [];
    for (let i = 0; i < trailCount; i++) {
      colors.push(TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)]);
    }

    const t0 = performance.now();
    let lastEmit = 0;
    let emitCount = 0;

    const animate = (now) => {
      const elapsed = now - t0;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuad(t);

      const base = bezierPoint(start, c1, c2, end, eased);
      const wiggle = Math.sin(eased * Math.PI * waveFreq) * waveAmp * (1 - eased * 0.7);
      const point = { x: base.x, y: base.y - wiggle };

      // Emit trail particles along the wave
      if (now - lastEmit > 26 && emitCount < trailCount * 3) {
        lastEmit = now;
        const pId = pidRef.current++;
        const pColor = emitCount < trailCount ? colors[emitCount] : colors[emitCount % trailCount];

        setTrail((prev) => [
          ...prev.slice(-60),
          {
            id: pId,
            x: point.x + (Math.random() - 0.5) * 14,
            y: point.y + (Math.random() - 0.5) * 14,
            color: pColor,
            size: 6 + Math.random() * 10,
            life: 3000,
            born: performance.now(),
          },
        ]);
        trailTimerRef.current[pId] = setTimeout(() => {
          setTrail((prev) => prev.filter((q) => q.id !== pId));
          delete trailTimerRef.current[pId];
        }, 3000);
        emitCount++;
      }

      const scale = 1 - t * 0.5;
      const rotation = (t > 0.7 ? (t - 0.7) / 0.3 : 0) * 30;
      const wobble = t > 0.9 ? (1 - (t - 0.9) / 0.1) * 6 : 0;

      setFlies((prev) => {
        const fly = prev[id];
        if (!fly) return prev;
        return { ...prev, [id]: { ...fly, x: point.x, y: point.y, scale, rotation, wobble } };
      });

      if (t < 1) {
        frameRef.current[id] = requestAnimationFrame(animate);
      } else {
        setFlies((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        delete frameRef.current[id];
        if (target.classList) {
          target.classList.add('cart-fly-pop');
          setTimeout(() => target.classList.remove('cart-fly-pop'), 550);
        }
      }
    };
    frameRef.current[id] = requestAnimationFrame(animate);
  }, []);

  const value = { registerCart, flyToCart };

  return (
    <CartFlyContext.Provider value={value}>
      {children}
      <div className="cart-fly-overlay" aria-hidden="true">
        {Object.entries(flies).map(([id, f]) => (
          <img
            key={id}
            src={f.imageSrc}
            alt=""
            style={{
              position: 'absolute',
              left: f.x,
              top: f.y,
              width: f.size,
              height: f.size,
              objectFit: 'contain',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.6)',
              boxShadow:
                '0 0 0 3px rgba(255,255,255,0.25), 0 0 24px 6px rgba(229,57,70,0.55)',
              transform: `translate(-50%, -50%) scale(${f.scale}) translate(0, ${f.wobble}px) rotate(${f.rotation}deg)`,
              opacity: 1,
              zIndex: 60,
              pointerEvents: 'none',
              willChange: 'transform, left, top',
            }}
          />
        ))}
        {trail.map((p) => {
          const age = performance.now() - p.born;
          const remain = 1 - Math.max(0, age / p.life);
          return (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, #ffffff, ${p.color} 55%, ${p.color})`,
                boxShadow: `0 0 12px 2px ${p.color}`,
                transform: 'translate(-50%, -50%)',
                opacity: Math.min(1, remain * 1.4),
                zIndex: 55,
                pointerEvents: 'none',
                willChange: 'transform, opacity',
              }}
            />
          );
        })}
      </div>
    </CartFlyContext.Provider>
  );
}