import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Split, Columns2, Sparkles, ArrowRight } from 'lucide-react';
import BeforeAfterSlider from '../components/common/BeforeAfterSlider';

export default function ComparisonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'side-by-side'

  const beforeImage = location.state?.capturedImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
  const afterImage = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/result')}
            className="p-2.5 rounded-2xl bg-white border border-pink-200 text-charcoal-700 hover:bg-pink-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Before / After Comparison</h1>
            <p className="text-xs text-charcoal-500">Inspect makeup simulation accuracy</p>
          </div>
        </div>
      </div>

      {/* Comparison Canvas */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-pink-100 shadow-soft space-y-6">
        
        {viewMode === 'split' ? (
          <BeforeAfterSlider
            beforeImage={beforeImage}
            afterImage={afterImage}
            beforeLabel="Before"
            afterLabel="After"
            heightClass="h-[460px]"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-charcoal-900 shadow-md">
                <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-charcoal-950/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                  Original (Before)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-charcoal-900 shadow-md">
                <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-pink-600 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                  Simulated Makeup (After)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Switcher Buttons (Screen 9 Bottom) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-pink-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'split'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-ivory-100 text-charcoal-700 hover:bg-pink-50'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Split Slider</span>
            </button>

            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-ivory-100 text-charcoal-700 hover:bg-pink-50'
              }`}
            >
              <Columns2 className="w-4 h-4" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/result')}
            className="px-5 py-2.5 rounded-xl bg-ivory-100 hover:bg-pink-100 text-charcoal-800 text-xs font-bold border border-pink-200 transition-colors flex items-center gap-1.5"
          >
            <span>Back to Result</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
