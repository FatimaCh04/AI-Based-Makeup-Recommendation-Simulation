import React, { useState } from 'react';
import { Eye, Heart, Calendar, Sparkles } from 'lucide-react';
import BeforeAfterSlider from '../common/BeforeAfterSlider';

export default function RecentLookCard({ look, onViewResult }) {
  const [isFavorite, setIsFavorite] = useState(look.isFavorite);
  const [isComparing, setIsComparing] = useState(false);

  return (
    <div className="group flex flex-col rounded-3xl bg-white border border-blush-200/80 shadow-soft hover:shadow-soft-md transition-all duration-300 overflow-hidden">
      
      {/* Thumbnail / Comparison View */}
      <div className="relative h-44 sm:h-48 w-full bg-charcoal-900 overflow-hidden">
        {isComparing ? (
          <BeforeAfterSlider
            beforeImage={look.beforeImage}
            afterImage={look.afterImage}
            beforeLabel="Before"
            afterLabel="After"
            heightClass="h-44 sm:h-48"
          />
        ) : (
          <>
            <img
              src={look.afterImage}
              alt={look.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            {/* Split before thumbnail preview in top corner */}
            <div
              className="absolute top-3 left-3 w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-md cursor-pointer group/thumb hover:scale-110 transition-transform"
              onClick={() => setIsComparing(true)}
              title="Click to compare Before/After"
            >
              <img src={look.beforeImage} alt="Before" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-charcoal-950/40 flex items-center justify-center text-[8px] text-white font-bold">
                B/A
              </div>
            </div>
          </>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 text-charcoal-700 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Toggle Favorite"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Date & Event Overlay Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-xs ${look.occasionBadgeColor}`}>
            {look.occasion}
          </span>
          <span className="text-[10px] text-white/90 bg-charcoal-950/70 backdrop-blur-md px-2 py-0.5 rounded-full font-medium">
            {look.date}
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          <h4 className="text-sm font-bold text-charcoal-900 group-hover:text-berry-600 transition-colors">
            {look.title}
          </h4>
          <p className="text-xs text-charcoal-500 font-medium">
            {look.makeupStyle}
          </p>
        </div>

        {/* Palette Mini Dots */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-charcoal-400 font-medium mr-1">Shades:</span>
          {look.palette.map((p, idx) => (
            <span
              key={idx}
              className="w-3.5 h-3.5 rounded-full border border-charcoal-200 shadow-2xs"
              style={{ backgroundColor: p.hex }}
              title={`${p.type}: ${p.name}`}
            />
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-2 border-t border-ivory-100 flex items-center justify-between">
          <button
            onClick={() => onViewResult(look)}
            className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-800 hover:text-berry-600 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-berry-500" />
            <span>View Result</span>
          </button>

          {isComparing && (
            <button
              onClick={() => setIsComparing(false)}
              className="text-[10px] font-medium text-charcoal-500 hover:text-charcoal-800 underline"
            >
              Exit Comparison
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
