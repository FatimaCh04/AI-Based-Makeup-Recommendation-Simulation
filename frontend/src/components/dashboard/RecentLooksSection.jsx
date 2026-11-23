import React, { useState } from 'react';
import { History, Sparkles, ArrowRight, Camera, X, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecentLookCard from './RecentLookCard';
import { mockRecentLooks } from '../../data/mockRecentLooks';
import BeforeAfterSlider from '../common/BeforeAfterSlider';

export default function RecentLooksSection() {
  const navigate = useNavigate();
  const [looks, setLooks] = useState(mockRecentLooks);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [selectedResultLook, setSelectedResultLook] = useState(null);

  return (
    <section className="space-y-4">
      {/* Section Header with Empty-State Demo Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-berry-600 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Analysis History</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 tracking-tight">
            Your Recent Looks
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-normal">
            Browse and compare your previously simulated cosmetic sessions.
          </p>
        </div>

        {/* Evaluator / Preview State Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-charcoal-400">Preview:</span>
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
              showEmptyState
                ? 'bg-berry-50 border-berry-300 text-berry-700'
                : 'bg-white border-ivory-300 text-charcoal-600 hover:bg-ivory-100'
            }`}
          >
            {showEmptyState ? 'Show Populated State' : 'Simulate Empty State'}
          </button>
        </div>
      </div>

      {/* Content: Either Empty State or Populated Grid */}
      {showEmptyState ? (
        /* Empty State */
        <div className="rounded-3xl bg-white border border-blush-200/80 shadow-soft p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-berry-50 border border-berry-100 mx-auto flex items-center justify-center text-berry-600 shadow-soft">
            <Camera className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-charcoal-900">
              No makeup looks yet
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto leading-relaxed">
              Start your first AI analysis and discover your personalized look with facial landmark estimation and virtual try-on.
            </p>
          </div>

          <div>
            <button
              onClick={() => navigate('/analysis')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-berry-500 hover:bg-berry-600 text-white text-xs sm:text-sm font-semibold shadow-berry-glow transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Analysis</span>
            </button>
          </div>
        </div>
      ) : (
        /* Populated Grid of Recent Looks */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {looks.map((look) => (
            <RecentLookCard
              key={look.id}
              look={look}
              onViewResult={(lookItem) => setSelectedResultLook(lookItem)}
            />
          ))}
        </div>
      )}

      {/* View Result Detailed Modal */}
      {selectedResultLook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blush-200 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200 bg-ivory-50/80">
              <div>
                <h3 className="text-base font-bold text-charcoal-900">{selectedResultLook.title}</h3>
                <p className="text-xs text-charcoal-500">{selectedResultLook.occasion} • {selectedResultLook.date}</p>
              </div>
              <button
                onClick={() => setSelectedResultLook(null)}
                className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <BeforeAfterSlider
                beforeImage={selectedResultLook.beforeImage}
                afterImage={selectedResultLook.afterImage}
                beforeLabel="Original"
                afterLabel={selectedResultLook.makeupStyle}
                heightClass="h-72"
              />

              <div className="space-y-2">
                <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                  Simulated Cosmetic Palette:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedResultLook.palette.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border border-charcoal-200 flex-shrink-0"
                        style={{ backgroundColor: item.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] text-charcoal-400 uppercase font-semibold">{item.type}</div>
                        <div className="text-xs font-bold text-charcoal-900 truncate">{item.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-ivory-200 bg-ivory-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedResultLook(null)}
                className="px-4 py-2 rounded-xl bg-ivory-200 text-xs font-semibold text-charcoal-700 hover:bg-ivory-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedResultLook(null);
                  navigate('/try-makeup', { state: { look: selectedResultLook } });
                }}
                className="px-5 py-2 rounded-xl bg-berry-500 hover:bg-berry-600 text-white text-xs font-semibold shadow-berry-glow transition-all"
              >
                Adjust In Try-On Studio
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
