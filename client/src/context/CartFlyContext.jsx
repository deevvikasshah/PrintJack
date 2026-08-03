import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const CartFlyContext = createContext(null);

export const useCartFly = () => useContext(CartFlyContext);

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

    const start = {
      x: sRect.left + sRect.width / 2,
      y: sRect.top + sRect.height / 2,
    };
    const end = {
      x: tRect.left + tRect.width / 2,
      y: tRect.top + tRect.height / 2,
    };

    const dx = end.x - start.x;
    const distX = Math.abs(dx);
    const curve = opts.curve != null ? opts.curve : 150;
    const c1 = { x: start.x + dx * 0.2, y: start.y - curve - Math.min(distX * 0.2, 60) };
    const c2 = { x: start.x + dx * 0.8, y: start.y - curve - Math.min(distX * 0.1, 30) };

    const id = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const duration = opts.duration || 900;

    if (frameRef.current[id]) cancelAnimationFrame(frameRef.current[id]);
    setFlies((prev) => ({
      ...prev,
      [id]: {
        id,
        x: start.x,
        y: start.y,
        start,
        c1,
        c2,
        end,
        imageSrc,
        size,
        scale: 1,
        opacity: 1,
        rotation: 0,
        progress: 0,
        wobble: 0,
        z: 40 + Math.random() * 20,
      },
    }));

    const t0 = performance.now();
    const animate = (now) => {
      const elapsed = now - t0;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuad(t);

      const point = bezierPoint(start, c1, c2, end, eased);
      const scale = 1 - t * 0.45;
      const wobble = t > 0.92 ? (1 - Math.min((t - 0.92) / 0.08, 1)) * 8 : 0;
      const rotation = (t > 0.85 ? (t - 0.85) / 0.15 : 0) * 25;

      setFlies((prev) => {
        const fly = prev[id];
        if (!fly) return prev;
        return {
          ...prev,
          [id]: { ...fly, x: point.x, y: point.y, scale, opacity: 1, rotation, progress: t, wobble },
        };
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
          setTimeout(() => target.classList.remove('cart-fly-pop'), 500);
        }
      }
    };
    frameRef.current[id] = requestAnimationFrame(animate);
  }, []);

  const value = {
    registerCart,
    flyToCart,
  };

  return (
    <CartFlyContext.Provider value={value}>
      {children}
      <div className="cart-fly-overlay" aria-hidden="true">
        {Object.values(flies).map((f) => (
          <img
            key={f.id}
            src={f.imageSrc}
            alt=""
            style={{
              position: 'absolute',
              left: f.x || f.start.x,
              top: f.y || f.start.y,
              width: f.size,
              height: f.size,
              objectFit: 'contain',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              transform: `translate(-50%, -50%) scale(${f.scale || 1}) translate(0, ${f.wobble || 0}px)         rotate(${f.rotation || 0}deg)`,
              opacity: f.opacity ?? 1,
              zIndex: f.z,
              pointerEvents: 'none',
              willChange: 'transform, left, top',
            }}
          />
        ))}
      </div>
    </CartFlyContext.Provider>
  );
}