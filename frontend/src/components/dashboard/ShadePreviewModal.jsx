import React, { useState } from 'react';
import { X, Sparkles, Sliders, Check, Palette, Eye, Heart, RefreshCcw } from 'lucide-react';
import BeforeAfterSlider from '../common/BeforeAfterSlider';

export default function ShadePreviewModal({ isOpen, onClose, initialLook }) {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState('Lipstick');
  const [selectedShades, setSelectedShades] = useState({
    Foundation: { name: "Warm Beige", hex: "#D8A782", code: "F-302", finish: "Radiant Satin" },
    Lipstick: { name: "Rose Nude", hex: "#BC6C7B", code: "L-114", finish: "Velvet Cream" },
    Eyeshadow: { name: "Soft Brown", hex: "#8A5A36", code: "E-401", finish: "Velvet Matte" },
    Blush: { name: "Peach", hex: "#E0876A", code: "B-205", finish: "Soft Luminous" },
  });

  const shadeCatalog = {
    Lipstick: [
      { name: "Rose Nude", hex: "#BC6C7B", code: "L-114", finish: "Velvet Cream" },
      { name: "Berry Crush", hex: "#8B263E", code: "L-202", finish: "Deep Matte" },
      { name: "Coral Satin", hex: "#D46859", code: "L-089", finish: "Satin Sheen" },
      { name: "Spiced Mauve", hex: "#9E5B6E", code: "L-310", finish: "Cream Glaze" },
      { name: "Ruby Sunset", hex: "#A8293B", code: "L-412", finish: "Luminous Matte" },
      { name: "Soft Blossom", hex: "#E28B96", code: "L-105", finish: "Hydrating Tint" }
    ],
    Foundation: [
      { name: "Warm Beige", hex: "#D8A782", code: "F-302", finish: "Radiant Satin" },
      { name: "Golden Honey", hex: "#CE9B72", code: "F-304", finish: "Natural Dewy" },
      { name: "Warm Almond", hex: "#E2B795", code: "F-208", finish: "Soft Matte" },
      { name: "Caramel Glow", hex: "#BA8255", code: "F-401", finish: "Luminous Shield" }
    ],
    Eyeshadow: [
      { name: "Soft Brown", hex: "#8A5A36", code: "E-401", finish: "Velvet Matte" },
      { name: "Copper Sunset", hex: "#A75D33", code: "E-405", finish: "Metallic Shimmer" },
      { name: "Champagne Pearl", hex: "#CDB399", code: "E-102", finish: "High Sparkle" },
      { name: "Smokey Plum", hex: "#5C3D46", code: "E-509", finish: "Intense Matte" }
    ],
    Blush: [
      { name: "Peach", hex: "#E0876A", code: "B-205", finish: "Soft Luminous" },
      { name: "Warm Terracotta", hex: "#C76953", code: "B-210", finish: "Velvet Matte" },
      { name: "Petal Flush", hex: "#DC828E", code: "B-108", finish: "Dewy Gel" },
      { name: "Sunlit Rose", hex: "#CE6E77", code: "B-303", finish: "Golden Shimmer" }
    ]
  };

  const handleSelectShade = (category, shade) => {
    setSelectedShades(prev => ({
      ...prev,
      [category]: shade
    }));
  };

  const handleResetToDefault = () => {
    setSelectedShades({
      Foundation: { name: "Warm Beige", hex: "#D8A782", code: "F-302", finish: "Radiant Satin" },
      Lipstick: { name: "Rose Nude", hex: "#BC6C7B", code: "L-114", finish: "Velvet Cream" },
      Eyeshadow: { name: "Soft Brown", hex: "#8A5A36", code: "E-401", finish: "Velvet Matte" },
      Blush: { name: "Peach", hex: "#E0876A", code: "B-205", finish: "Soft Luminous" },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-blush-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200 bg-ivory-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-berry-100 flex items-center justify-center text-berry-600 shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900">Virtual Makeup Shade Studio</h3>
              <p className="text-xs text-charcoal-500">Live preview & custom cosmetic shade simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-ivory-200 transition-colors"
              title="Reset to AI Recommended Palette"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset Look</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* Left: Interactive Before/After Visual */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative">
              <BeforeAfterSlider
                beforeImage={initialLook?.beforeImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                afterImage={initialLook?.image || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"}
                beforeLabel="Original"
                afterLabel="Simulation Preview"
                heightClass="h-72 sm:h-80"
              />
            </div>

            {/* Currently Applied Palette Summary */}
            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-300 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(selectedShades).map(([cat, shade]) => (
                <div key={cat} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-ivory-200 shadow-xs">
                  <div
                    className="w-5 h-5 rounded-full border border-charcoal-200 flex-shrink-0 shadow-inner"
                    style={{ backgroundColor: shade.hex }}
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] text-charcoal-400 uppercase font-semibold">{cat}</div>
                    <div className="text-xs font-bold text-charcoal-900 truncate">{shade.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Shade Selection Tabs & Swatches */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-3">
              <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                Select Product Category:
              </div>

              {/* Category Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-ivory-200">
                {['Lipstick', 'Foundation', 'Eyeshadow', 'Blush'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
                      activeCategory === cat
                        ? 'bg-white text-berry-600 shadow-xs'
                        : 'text-charcoal-600 hover:text-charcoal-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Swatches for selected Category */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-charcoal-800">
                    Available {activeCategory} Shades:
                  </span>
                  <span className="text-[11px] text-berry-600 font-medium">
                    Current: {selectedShades[activeCategory].name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {shadeCatalog[activeCategory].map((shade) => {
                    const isCurrent = selectedShades[activeCategory].name === shade.name;
                    return (
                      <div
                        key={shade.name}
                        onClick={() => handleSelectShade(activeCategory, shade)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-berry-50 border-berry-400 ring-1 ring-berry-400/40 shadow-xs'
                            : 'bg-white border-ivory-300 hover:border-berry-200'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-charcoal-200 shadow-inner flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: shade.hex }}
                        >
                          {isCurrent && <Check className="w-3 h-3 text-white drop-shadow-md" />}
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

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-ivory-200 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-xs font-semibold text-charcoal-700 transition-colors"
              >
                Close Studio
              </button>
              <button
                onClick={() => {
                  alert("Custom simulated palette saved to your active session!");
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-berry-500 hover:bg-berry-600 text-white text-xs font-semibold shadow-berry-glow transition-all active:scale-95"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Save Look Preset</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
