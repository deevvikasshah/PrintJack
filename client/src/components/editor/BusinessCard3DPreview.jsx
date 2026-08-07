import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Box, Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export default function BusinessCard3DPreview({
  frontImage,
  backImage,
  isBusinessCard = true,
  width = 350,
  height = 200,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  const animate = (timestamp) => {
    if (!isPlaying) return;
    const speed = 0.3;
    setRotation((prev) => (prev + speed) % 360);
    animationRef.current = requestAnimationFrame(animate);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetRotation = () => setRotation(0);
  const flipCard = () => setShowBack(!showBack);

  const aspectRatio = isBusinessCard ? 3.5 / 2 : 1;

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="relative"
        style={{
          width: width,
          height: width / aspectRatio,
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `rotateY(${showBack ? 180 : 0}deg) rotateY(${rotation}deg)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-xl shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(2px)',
              backgroundImage: frontImage ? `url(${frontImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: frontImage ? 'transparent' : '#f3f4f6',
            }}
          >
            {!frontImage && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Box className="w-12 h-12" />
              </div>
            )}
          </div>

          <div
            className="absolute inset-0 rounded-xl shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(2px)',
              backgroundImage: backImage ? `url(${backImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: backImage ? 'transparent' : '#f3f4f6',
            }}
          >
            {!backImage && (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Box className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200">
          <button
            onClick={resetRotation}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title="Reset rotation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title={isPlaying ? 'Pause rotation' : 'Play rotation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={flipCard}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title="Flip card"
          >
            <Box className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200 text-xs text-gray-600">
        <span>{showBack ? 'Back' : 'Front'}</span>
        <span className="w-px h-4 bg-gray-200" />
        <span>Auto-rotate: {isPlaying ? 'On' : 'Off'}</span>
      </div>
    </div>
  );
}