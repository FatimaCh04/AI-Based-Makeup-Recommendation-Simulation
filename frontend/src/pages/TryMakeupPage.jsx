import React, { useState } from 'react';
import { Palette, Sparkles, RefreshCw, Heart, Sliders, Check } from 'lucide-react';
import BeforeAfterSlider from '../components/common/BeforeAfterSlider';
import Badge from '../components/common/Badge';

export default function TryMakeupPage() {
  const [activeTab, setActiveTab] = useState('Lipstick');
  const [selectedLipstick, setSelectedLipstick] = useState({ name: "Rose Nude", hex: "#BC6C7B" });
  const [selectedFoundation, setSelectedFoundation] = useState({ name: "Warm Beige", hex: "#D8A782" });
  const [selectedBlush, setSelectedBlush] = useState({ name: "Peach", hex: "#E0876A" });
  const [selectedEyeshadow, setSelectedEyeshadow] = useState({ name: "Soft Brown", hex: "#8A5A36" });

  const lipShades = [
    { name: "Rose Nude", hex: "#BC6C7B", finish: "Velvet Cream" },
    { name: "Berry Crush", hex: "#8B263E", finish: "Deep Matte" },
    { name: "Coral Satin", hex: "#D46859", finish: "Satin Sheen" },
    { name: "Spiced Mauve", hex: "#9E5B6E", finish: "Cream Glaze" },
    { name: "Ruby Sunset", hex: "#A8293B", finish: "Luminous Matte" },
    { name: "Soft Blossom", hex: "#E28B96", finish: "Hydrating Tint" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-blush-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-berry-600 uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>Virtual Try-On Simulation Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
            Try Different Cosmetic Shades
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Experiment with shades in real time. Powered by OpenCV color mapping and MediaPipe landmarks.
          </p>
        </div>

        <button
          onClick={() => alert("Simulation saved to current session!")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-berry-500 hover:bg-berry-600 text-white text-xs font-semibold shadow-berry-glow transition-all active:scale-98"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Save Custom Look</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Simulation Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-white border border-blush-200 shadow-soft p-5 space-y-4">
            <BeforeAfterSlider
              beforeImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
              afterImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
              beforeLabel="Original"
              afterLabel={`Shade: ${selectedLipstick.name}`}
              heightClass="h-80 sm:h-96"
            />

            {/* Currently Active Cosmetic Formula */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-charcoal-200" style={{ backgroundColor: selectedLipstick.hex }} />
                <div className="min-w-0">
                  <div className="text-[10px] text-charcoal-400 uppercase font-semibold">Lipstick</div>
                  <div className="text-xs font-bold text-charcoal-900 truncate">{selectedLipstick.name}</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-charcoal-200" style={{ backgroundColor: selectedFoundation.hex }} />
                <div className="min-w-0">
                  <div className="text-[10px] text-charcoal-400 uppercase font-semibold">Foundation</div>
                  <div className="text-xs font-bold text-charcoal-900 truncate">{selectedFoundation.name}</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-charcoal-200" style={{ backgroundColor: selectedEyeshadow.hex }} />
                <div className="min-w-0">
                  <div className="text-[10px] text-charcoal-400 uppercase font-semibold">Eyeshadow</div>
                  <div className="text-xs font-bold text-charcoal-900 truncate">{selectedEyeshadow.name}</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-charcoal-200" style={{ backgroundColor: selectedBlush.hex }} />
                <div className="min-w-0">
                  <div className="text-[10px] text-charcoal-400 uppercase font-semibold">Blush</div>
                  <div className="text-xs font-bold text-charcoal-900 truncate">{selectedBlush.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shade Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-white border border-blush-200 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
              Select Product Category
            </h3>

            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-ivory-200">
              {['Lipstick', 'Foundation', 'Eyeshadow', 'Blush'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === tab ? 'bg-white text-berry-600 shadow-xs' : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Lipstick Swatches */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-charcoal-700">
                Available {activeTab} Swatches:
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {lipShades.map((shade) => {
                  const isSelected = selectedLipstick.name === shade.name;
                  return (
                    <div
                      key={shade.name}
                      onClick={() => setSelectedLipstick(shade)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-berry-50 border-berry-400 ring-1 ring-berry-400/40 shadow-xs'
                          : 'bg-ivory-50 border-ivory-300 hover:border-berry-200'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full border border-charcoal-200 shadow-inner flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: shade.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-charcoal-900 truncate">{shade.name}</div>
                        <div className="text-[10px] text-charcoal-500 truncate">{shade.finish}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
