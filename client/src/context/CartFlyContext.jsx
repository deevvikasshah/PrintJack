import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const CartFlyContext = createContext(null);

export const useCartFly = () => useContext(CartFlyContext);

const TRAIL_COLORS = [
  '#FF2E97', '#7B2FFF', '#00C6FF', '#00E5A0',
  '#FFD23F', '#FF5E62', '#6C5CE7', '#29FFC6',
  '#FF9A3D', '#38BDF8',
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

  const registerCart = useCallback((el) => {
    cartRef.current = el;
  }, []);

  const flyToCart = useCallback((source, imageSrc, opts = {}) => {
    const target = cartRef.current;
    if (!source || !target) return;

    const size = opts.size || 60;
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
    const trailCount = opts.trailCount != null ? opts.trailCount : 16;

    setFlies((prev) => ({
      ...prev,
      [id]: {
        id,
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

      // Staggered colorful trail particles, each fades independently via CSS
      if (now - lastEmit > 46 && emitCount < trailCount) {
        lastEmit = now;
        const pId = pidRef.current++;
        const pColor = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
        const pDelay = Math.min(emitCount * 40, 260); // stagger so they vanish one-by-one
        const pLife = 1500 + Math.random() * 800;     // ~1.5-2.3s each

        setTrail((prev) => [
          ...prev.slice(-80),
          {
            id: pId,
            x: point.x + (Math.random() - 0.5) * 22,
            y: point.y + (Math.random() - 0.5) * 22,
            color: pColor,
            size: 8 + Math.random() * 14,
            delayMs: pDelay,
            lifeMs: pLife,
            styleIdx: Math.floor(Math.random() * 3),
          },
        ]);
        // Remove from DOM after animation completes
        setTimeout(() => {
          setTrail((prev) => prev.filter((q) => q.id !== pId));
        }, pLife + Math.max(pDelay, 200));
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
              transform: `translate(-50%, -50%) scale(${f.scale}) translate(0, ${f.wobble}px) rotate(${f.rotation}deg)`,
              opacity: 1,
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.65)) drop-shadow(0 4px 14px rgba(0,0,0,0.25))',
              zIndex: 60,
              pointerEvents: 'none',
              willChange: 'transform, left, top',
            }}
          />
        ))}
        {trail.map((p) => (
          <span
            key={p.id}
            className="cart-fly-bubble"
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              '--bubble-color': p.color,
              '--bubble-delay': `${p.delayMs}ms`,
              '--bubble-dur': `${p.lifeMs}ms`,
              '--bubble-idx': String(p.styleIdx),
              zIndex: 55,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </CartFlyContext.Provider>
  );
}