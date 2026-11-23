import React, { useState } from 'react';
import { Sparkles, Palette, Eye, ArrowRight, CheckCircle2, SlidersHorizontal, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShadeSwatch from '../common/ShadeSwatch';
import Badge from '../common/Badge';
import BeforeAfterSlider from '../common/BeforeAfterSlider';
import ShadePreviewModal from './ShadePreviewModal';

export default function RecommendedLookCard({ recommendation }) {
  const navigate = useNavigate();
  const [showSliderView, setShowSliderView] = useState(false);
  const [isShadeModalOpen, setIsShadeModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const look = recommendation;

  return (
    <>
      <div className="relative rounded-3xl bg-white border border-blush-200/80 shadow-soft overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-berry-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spotlight Recommendation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 tracking-tight">
              Recommended For You
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="berry" size="md">
              <Sparkles className="w-3 h-3 text-berry-600" />
              <span>{look.matchScore}% AI Match</span>
            </Badge>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                  : 'bg-white border-ivory-300 text-charcoal-500 hover:text-rose-600'
              }`}
              title={isSaved ? "Saved to your favorites" : "Save Look"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body: Large Preview + Details Beside It */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Large Makeup Preview Image / Interactive Comparison */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative rounded-3xl overflow-hidden shadow-soft-md border border-blush-200 bg-charcoal-900 group">
              {showSliderView ? (
                <BeforeAfterSlider
                  beforeImage={look.beforeImage}
                  afterImage={look.image}
                  beforeLabel="Original"
                  afterLabel="Soft Rose Glam"
                  heightClass="h-72 sm:h-80"
                />
              ) : (
                <div className="relative h-72 sm:h-80">
                  <img
                    src={look.image}
                    alt={look.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Floating look badge on photo */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <span className="text-[11px] text-berry-200 uppercase font-semibold tracking-wider">Look Style</span>
                      <h4 className="text-base font-bold drop-shadow-sm">{look.title}</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/90 text-charcoal-900 font-semibold text-xs backdrop-blur-md shadow-sm">
                      {look.occasion}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Slider View Toggle Button */}
            <button
              onClick={() => setShowSliderView(!showSliderView)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 text-xs font-semibold border border-ivory-300 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-berry-600" />
              <span>{showSliderView ? "Show Single Glam Photo" : "Compare Before / After Simulation"}</span>
            </button>
          </div>

          {/* Right: Detailed Breakdown and Shade Swatches */}
          <div className="lg:col-span-6 space-y-5">
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-charcoal-950">{look.title}</h3>
              </div>
              <div className="text-xs text-berry-600 font-semibold mb-2">
                Recommended for: <span className="text-charcoal-800 font-medium">{look.occasion}</span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                {look.description}
              </p>
            </div>

            {/* Makeup Details Breakdown (Foundation, Lipstick, Eyeshadow, Blush) */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                Cosmetic Shade Breakdown:
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {look.shades.map((shade) => (
                  <div
                    key={shade.category}
                    className="p-3 rounded-2xl bg-ivory-50 border border-ivory-200/80 hover:border-berry-200 transition-colors flex items-center gap-3"
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-7 h-7 rounded-full shadow-inner border border-white/80"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <div className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] text-charcoal-500 font-medium">{shade.category}</div>
                      <div className="text-xs font-bold text-charcoal-900 truncate">{shade.name}</div>
                      <div className="text-[10px] text-charcoal-400 truncate">{shade.finish}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSliderView(true)}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-berry-500 hover:bg-berry-600 text-white text-xs font-semibold shadow-berry-glow transition-all active:scale-98"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Look</span>
              </button>

              <button
                onClick={() => setIsShadeModalOpen(true)}
                className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-ivory-100 text-charcoal-900 border border-blush-300 hover:border-berry-300 text-xs font-semibold shadow-soft transition-all active:scale-98"
              >
                <Palette className="w-4 h-4 text-berry-600" />
                <span>Try Different Shades</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Live Shade Try-on Modal */}
      <ShadePreviewModal
        isOpen={isShadeModalOpen}
        onClose={() => setIsShadeModalOpen(false)}
        initialLook={look}
      />
    </>
  );
}
