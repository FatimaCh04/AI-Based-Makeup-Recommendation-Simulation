import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Original',
  afterLabel  = 'Makeup Result',
  className   = '',
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging,     setIsDragging]     = useState(false);
  const containerRef = useRef(null);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x    = clientX - rect.left;
    const pct  = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  // Global mouse events so dragging outside the container still works
  useEffect(() => {
    const onMove = (e) => { if (isDragging) updatePosition(e.clientX); };
    const onUp   = ()  => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [isDragging, updatePosition]);

  // Prevent the page from scrolling while dragging the slider on touch
  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();          // ← key: stops vertical scroll during horizontal drag
    if (e.touches[0]) updatePosition(e.touches[0].clientX);
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl bg-[#30232A] border border-[#F8DCE5] shadow-sm cursor-ew-resize group touch-none ${className}`}
      style={{ touchAction: 'none' }}   /* CSS-level scroll prevention */
      onMouseDown={(e) => { setIsDragging(true); updatePosition(e.clientX); }}
      onTouchStart={(e) => {
        setIsDragging(true);
        if (e.touches[0]) updatePosition(e.touches[0].clientX);
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
      onTouchCancel={() => setIsDragging(false)}
    >
      {/*
        Responsive aspect ratio:
          • Mobile  (<640px) : 3/4  (taller, face fills frame well)
          • Tablet  (640px+) : 4/5
          • Desktop (768px+) : 4/5, max 440px tall
        Uses a padding-bottom trick so the ratio holds across all widths.
      */}
      <div className="relative w-full" style={{ paddingBottom: 'min(72%, 320px)' }}>
        <div className="absolute inset-0">
          {/* After image (makeup result) — full width baseline */}
          <img
            src={afterImage || beforeImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
            draggable={false}
          />

          {/* Before image clipped from left to sliderPosition */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Before label */}
          <div
            className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-[#30232A]/75 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/10 pointer-events-none transition-opacity duration-200"
            style={{ opacity: sliderPosition < 12 ? 0 : 1 }}
          >
            {beforeLabel}
          </div>

          {/* After label */}
          <div
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B92F60]/85 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: sliderPosition > 88 ? 0 : 1 }}
          >
            <Sparkles className="w-3 h-3 text-[#F8DCE5]" />
            <span>{afterLabel}</span>
          </div>

          {/* Divider line + handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-0.5 bg-white pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.4)]"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#B92F60] shadow-md flex items-center justify-center border border-[#F8DCE5] group-hover:scale-105 active:scale-95 transition-transform">
              <SlidersHorizontal className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
