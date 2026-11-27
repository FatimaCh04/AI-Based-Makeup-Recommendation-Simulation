import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, SlidersHorizontal, Maximize2, Minimize2 } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Original',
  afterLabel  = 'Makeup Result',
  className   = '',
  defaultFit  = 'contain', // 'contain' fits full picture (zoomed out); 'cover' fills box
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging,     setIsDragging]     = useState(false);
  const [imgRatio,       setImgRatio]       = useState(null);
  const [fitMode,        setFitMode]        = useState(defaultFit);
  const containerRef = useRef(null);

  // Measure natural aspect ratio when image loads or changes
  useEffect(() => {
    const src = afterImage || beforeImage;
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setImgRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = src;
  }, [beforeImage, afterImage]);

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
    e.preventDefault(); // stops vertical scroll during horizontal drag
    if (e.touches[0]) updatePosition(e.touches[0].clientX);
  }, [isDragging, updatePosition]);

  const toggleFit = (e) => {
    e.stopPropagation();
    setFitMode(prev => prev === 'contain' ? 'cover' : 'contain');
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl bg-[#1A1417] border border-[#F8DCE5] shadow-sm cursor-ew-resize group touch-none w-full flex items-center justify-center ${className}`}
      style={{ touchAction: 'none' }}
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
        Responsive Container:
        - Uses the image's real aspect ratio if detected (e.g. 3/4 or 9/16 portrait)
        - max-height of min(75vh, 560px) so on mobile it shows the full face comfortably
      */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{
          aspectRatio: imgRatio ? `${imgRatio}` : '3/4',
          maxHeight: 'min(75vh, 560px)',
          minHeight: '280px',
        }}
      >
        <div className="absolute inset-0">
          {/* After image (makeup result) — full width baseline */}
          <img
            src={afterImage || beforeImage}
            alt={afterLabel}
            className={`absolute inset-0 w-full h-full pointer-events-none select-none transition-all duration-200 ${
              fitMode === 'cover' ? 'object-cover object-center' : 'object-contain object-center'
            }`}
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
              className={`absolute inset-0 w-full h-full pointer-events-none select-none transition-all duration-200 ${
                fitMode === 'cover' ? 'object-cover object-center' : 'object-contain object-center'
              }`}
              draggable={false}
            />
          </div>

          {/* Zoom / Fit toggle button */}
          <button
            type="button"
            onClick={toggleFit}
            className="absolute top-2.5 right-2.5 z-30 px-2.5 py-1 rounded-full bg-[#181316]/80 hover:bg-[#181316] backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            title={fitMode === 'contain' ? 'Zoom in to fill container' : 'Zoom out to fit entire photo'}
          >
            {fitMode === 'contain' ? (
              <>
                <Maximize2 className="w-3 h-3 text-[#F8DCE5]" />
                <span>Full Pic</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3 h-3 text-[#F8DCE5]" />
                <span>Fill</span>
              </>
            )}
          </button>

          {/* Before label */}
          <div
            className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-[#181316]/80 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/10 pointer-events-none transition-opacity duration-200"
            style={{ opacity: sliderPosition < 12 ? 0 : 1 }}
          >
            {beforeLabel}
          </div>

          {/* After label */}
          <div
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B92F60]/90 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/20 pointer-events-none transition-opacity duration-200"
            style={{ opacity: sliderPosition > 88 ? 0 : 1 }}
          >
            <Sparkles className="w-3 h-3 text-[#F8DCE5]" />
            <span>{afterLabel}</span>
          </div>

          {/* Divider line + handle */}
          <div
            className="absolute top-0 bottom-0 z-20 w-0.5 bg-white pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.5)]"
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
