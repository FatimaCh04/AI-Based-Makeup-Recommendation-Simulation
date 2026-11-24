import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Check, Sparkles, Heart, ChevronLeft, ChevronRight,
  Palette, Droplets, Eye, CheckCircle2, Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import {
  applyFoundationToCanvas,
  applyLipstickToCanvas,
  applyBlushToCanvas,
  applyEyeshadowToCanvas,
  applyEyelinerToCanvas,
  applyMascaraToCanvas,
  applyHighlighterToCanvas,
  getCachedLandmarks
} from '../utils/virtualMakeupEngine';

export default function TryShadesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState('Lipstick');
  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const [foundationCoverage, setFoundationCoverage] = useState('medium');
  const [appliedMessage, setAppliedMessage] = useState('');
  const [saved, setSaved] = useState(false);

  // User image or default model
  const userImage = location.state?.capturedImage ||
    sessionStorage.getItem('glamai_guest_image') ||
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80";

  const [simulatedCanvasUrl, setSimulatedCanvasUrl] = useState(userImage);

  // 12 Shades per category matching Mockup 8
  const shadesData = {
    Lipstick: [
      { name: "Rose Pink Delight", hex: "#E6396E", description: "Perfect for Party Look", note: "Velvet Satin" },
      { name: "Coral Sunset", hex: "#F47262", description: "Vibrant and warm golden undertones", note: "Radiant Gloss" },
      { name: "Berry Plum", hex: "#8E2848", description: "Deep dramatic evening elegance", note: "Ultra Matte" },
      { name: "Nude Velvet", hex: "#C77D88", description: "Subtle everyday soft definition", note: "Soft Matte" },
      { name: "Ruby Glam", hex: "#C81E3B", description: "Classic showstopper luxury red", note: "High Impact" },
      { name: "Sweet Peony", hex: "#EB859D", description: "Fresh dewy floral pink", note: "Hydrating" },
      { name: "Crimson Silk", hex: "#A81E32", description: "Rich intense pigment drape", note: "Long Wear" },
      { name: "Warm Terracotta", hex: "#B85D43", description: "Earth-toned chic warm clay", note: "Velvet" },
      { name: "Deep Bordeaux", hex: "#5E182A", description: "Sultry nighttime statement", note: "Creamy" },
      { name: "Peach Petal", hex: "#ECA392", description: "Soft luminous spring peach", note: "Satin" },
      { name: "Mauve Whisper", hex: "#A66D7D", description: "Chic balanced cool mauve", note: "Velvet" },
      { name: "Spiced Cinnamon", hex: "#9E4733", description: "Warm cozy autumn berry", note: "Matte" }
    ],
    Foundation: [
      { name: "Porcelain Silk 105", hex: "#F5DEB3", description: "Fair skin with neutral undertones", note: "Dewy Silk" },
      { name: "Vanilla Cream 112", hex: "#EFCFAB", description: "Light with cool pink tone", note: "Satin Shield" },
      { name: "Warm Beige 128", hex: "#D8A782", description: "Matches warm wheatish skin", note: "Matte + Poreless" },
      { name: "Golden Honey 140", hex: "#CE9B72", description: "Adds golden summer radiance", note: "Radiant Shield" },
      { name: "Natural Sand 150", hex: "#DEB593", description: "Lightweight sheer coverage", note: "Dewy Tint" },
      { name: "Caramel Warmth 220", hex: "#BA8255", description: "Deep sunkissed golden glow", note: "Satin Finish" },
      { name: "Sun Bronze 240", hex: "#A87247", description: "Medium-deep golden olive", note: "Luminous" },
      { name: "Warm Toffee 310", hex: "#98623A", description: "Tan with warm undertones", note: "Velvet Matte" },
      { name: "Espresso 330", hex: "#834E28", description: "Deep with neutral base", note: "Matte" },
      { name: "Rich Cocoa 350", hex: "#6E3E1E", description: "Deep with warm golden tone", note: "Hydrating" },
      { name: "Chestnut 360", hex: "#5C3317", description: "Deep rich balance", note: "Satin" },
      { name: "Mahogany 380", hex: "#4A2710", description: "Ultra rich radiant complexion", note: "Radiant" }
    ],
    Eyeshadow: [
      { name: "Smokey Bronze", hex: "#8A5A36", description: "Deepens eyelid contour & crease", note: "Velvet Shimmer" },
      { name: "Copper Sunset", hex: "#A75D33", description: "Rich metallic warmth for evening", note: "High Pearl" },
      { name: "Champagne Glow", hex: "#CDB399", description: "Brightens inner eye corners", note: "Luminous" },
      { name: "Rose Gold Shimmer", hex: "#B87A84", description: "Party glam radiant accent", note: "Glitter" },
      { name: "Gilded Amber", hex: "#B8833C", description: "Warm sunlit crease depth", note: "Metallic" },
      { name: "Onyx Charcoal", hex: "#2B2B30", description: "Dramatic smoky night liner & base", note: "Matte" },
      { name: "Plum Satin", hex: "#633B54", description: "Sultry jewel-toned crease", note: "Satin" },
      { name: "Soft Taupe", hex: "#948074", description: "Everyday effortless shading", note: "Matte" },
      { name: "Emerald Glaze", hex: "#2E5E4E", description: "Rich holiday accent tone", note: "Velvet" },
      { name: "Frosted Vanilla", hex: "#E8DEC8", description: "Browbone highlighter pop", note: "Shimmer" },
      { name: "Warm Cocoa", hex: "#69422F", description: "Defined socket structure", note: "Matte" },
      { name: "Midnight Silver", hex: "#7E838F", description: "Reflective metallic party dazzle", note: "Glitter" }
    ],
    Blush: [
      { name: "Peachy Coral", hex: "#E0876A", description: "Sculpts warm cheekbones softly", note: "Soft Satin" },
      { name: "Petal Flush", hex: "#DC828E", description: "Natural healthy blossom flush", note: "Dewy Gel" },
      { name: "Warm Terracotta", hex: "#C76953", description: "Sculpted bronze holiday tone", note: "Matte" },
      { name: "Sunlit Berry", hex: "#B84A62", description: "Evening glow statement pop", note: "Radiant" },
      { name: "Rose Quartz", hex: "#E498A4", description: "Delicate daytime porcelain glow", note: "Silk" },
      { name: "Apricot Luster", hex: "#E59676", description: "Golden apricot radiance", note: "Luminous" },
      { name: "Dusty Plum", hex: "#9C5668", description: "Contoured cool cheek accent", note: "Velvet" },
      { name: "Golden Coral", hex: "#DF7B62", description: "Shimmering summer flush", note: "Shimmer" },
      { name: "Ruby Sunset", hex: "#A63D4E", description: "Vibrant high-pigment drape", note: "Satin" },
      { name: "Soft Nude", hex: "#CCA094", description: "Subtle neutral sculpting", note: "Matte" },
      { name: "Sweet Raspberry", hex: "#C15272", description: "Youthful uplifted cheek pop", note: "Dewy" },
      { name: "Toasted Cinnamon", hex: "#AC5E48", description: "Warm terracotta earth tone", note: "Matte" }
    ],
    Eyeliner: [
      { name: "Jet Black Wing", hex: "#18181B", description: "Crisp cat-eye graphic definition", note: "Waterproof" },
      { name: "Deep Espresso", hex: "#3B271E", description: "Soft natural lashline definition", note: "Gel Pencil" },
      { name: "Metallic Bronze", hex: "#6E472D", description: "Shimmering warm eye accent", note: "Metallic" },
      { name: "Smoky Charcoal", hex: "#424248", description: "Diffused sultry smudged line", note: "Kohl" },
      { name: "Midnight Plum", hex: "#381E2B", description: "Unique jewel-toned liner", note: "Satin" },
      { name: "Forest Emerald", hex: "#1D3B2E", description: "Subtle deep green contour", note: "Velvet" },
      { name: "Navy Velvet", hex: "#1B2838", description: "Opens up eye whites cleanly", note: "Gel" },
      { name: "Gilded Copper", hex: "#8C4E2B", description: "Luminous lower-lashline pop", note: "Metallic" },
      { name: "Coffee Bean", hex: "#4A3326", description: "Soft matte daily wear", note: "Precision" },
      { name: "Slate Grey", hex: "#52545E", description: "Cool diffused definition", note: "Matte" },
      { name: "Rich Burgundy", hex: "#4C1C28", description: "Warm evening statement", note: "Kohl" },
      { name: "Glitter Noir", hex: "#1F1F24", description: "Micro-shimmer festival liner", note: "Glitter" }
    ],
    Mascara: [
      { name: "Carbon Black", hex: "#101010", description: "Ultra-dark volumizing intensity", note: "Dramatic Volume" },
      { name: "Espresso Brown", hex: "#2B1A12", description: "Soft natural daytime lash definition", note: "Defining" },
      { name: "Midnight Navy", hex: "#151B29", description: "Brightens eye whites with blue tint", note: "Lengthening" },
      { name: "Deep Plum", hex: "#2C1724", description: "Subtle jewel accent for brown & hazel eyes", note: "Volumizing" },
      { name: "Rich Cocoa", hex: "#3D271D", description: "Warm chocolate lash tint", note: "Natural" },
      { name: "Pitch Onyx", hex: "#080808", description: "High-impact falsies effect", note: "Dramatic" },
      { name: "Smoky Black", hex: "#1C1C1E", description: "Feathered fluttery definition", note: "Lengthening" },
      { name: "Chestnut", hex: "#42281E", description: "Effortless everyday no-makeup look", note: "Defining" },
      { name: "Burgundy Noir", hex: "#32161E", description: "Warm sultry evening accent", note: "Volumizing" },
      { name: "Forest Tint", hex: "#122018", description: "Unique earthy lash tone", note: "Natural" },
      { name: "Dark Walnut", hex: "#30221B", description: "Subtle definition for light lashes", note: "Defining" },
      { name: "Glossy Jet", hex: "#0F1115", description: "Wet-look high-shine mascara", note: "Dramatic" }
    ],
    Highlighter: [
      { name: "Champagne Starlight", hex: "#EAD5A6", description: "Universal warm champagne shimmer", note: "Luminous" },
      { name: "Rose Quartz Sheen", hex: "#F3D2CF", description: "Delicate pearlescent pink luster", note: "Dewy" },
      { name: "Gilded Gold", hex: "#F0D18A", description: "Sun-drenched molten gold glow", note: "Radiant" },
      { name: "Frosted Pearl", hex: "#F5F0EA", description: "Icy crystalline high-beam pop", note: "Shimmer" },
      { name: "Sunlit Bronze", hex: "#D49F6A", description: "Deep golden hour cheekbone glow", note: "Radiant" },
      { name: "Peach Nectar", hex: "#F2C2A2", description: "Warm luminous peach radiance", note: "Dewy" },
      { name: "Opal Glaze", hex: "#EFE8E2", description: "Translucent glass-skin dew", note: "Glaze" },
      { name: "Copper Beam", hex: "#C88558", description: "Rich metallic holiday sheen", note: "Metallic" },
      { name: "Honey Luster", hex: "#E8C17B", description: "Soft amber lit-from-within glow", note: "Luminous" },
      { name: "Pink Chiffon", hex: "#F8D4DC", description: "Soft baby pink silk glow", note: "Silk" },
      { name: "Moonlit Silver", hex: "#ECEFF1", description: "Cool-toned futuristic sheen", note: "Shimmer" },
      { name: "Golden Amber", hex: "#DDA658", description: "Warm dusk festival radiance", note: "Radiant" }
    ]
  };

  const currentCategoryShades = shadesData[activeTab] || shadesData.Lipstick;
  const currentShade = currentCategoryShades[selectedShadeIndex] || currentCategoryShades[0];

  // Dynamic canvas tint when shade changes
  const applyShadeToCanvas = useCallback((shade) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 750;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const landmarks = getCachedLandmarks(location.state?.analysis, userImage, 'auto', canvas.width, canvas.height);

        if (landmarks) {
          const faceShape = location.state?.analysis?.face_shape || 'Oval';

          if (activeTab === 'Lipstick') {
            applyLipstickToCanvas(ctx, canvas.width, canvas.height, landmarks, {
              hex: shade.hex,
              finish: shade.note || 'Satin',
              opacity: 0.80
            });
          } else if (activeTab === 'Blush') {
            applyBlushToCanvas(ctx, canvas.width, canvas.height, landmarks, {
              hex: shade.hex,
              finish: shade.note || 'Luminous',
              opacity: 0.60,
              faceShape
            });
          } else if (activeTab === 'Highlighter') {
            applyHighlighterToCanvas(ctx, canvas.width, canvas.height, landmarks, {
              hex: shade.hex,
              finish: shade.note || 'Luminous',
              opacity: 0.55,
              faceShape
            });
          } else if (activeTab === 'Eyeshadow') {
            applyEyeshadowToCanvas(ctx, canvas.width, canvas.height, landmarks, {
              hex: shade.hex,
              finish: shade.note || 'Shimmer',
              opacity: 0.68
            });
          } else if (activeTab === 'Eyeliner') {
            const style = (shade.note || '').toLowerCase().includes('wing') ? 'Winged' :
                          (shade.note || '').toLowerCase().includes('cat') ? 'CatEye' : 'Classic';
            applyEyelinerToCanvas(ctx, canvas.width, canvas.height, landmarks, {
              hex: shade.hex,
              style,
              opacity: 0.92,
              thickness: 2.0
            });
          } else if (activeTab === 'Mascara') {
            const intensity = (shade.note || '').toLowerCase().includes('dramatic') ? 'Dramatic' :
                              (shade.note || '').toLowerCase().includes('natural') ? 'Natural' : 'Defined';
            applyMascaraToCanvas(ctx, canvas.width, canvas.height, landmarks, {
              hex: shade.hex || '#080808',
              intensity,
              volume: shade.note || 'volumizing',
              opacity: 0.95
            });
          } else if (activeTab === 'Foundation') {
            applyFoundationToCanvas(ctx, canvas.width, canvas.height, landmarks, {
              hex: shade.hex,
              coverage: foundationCoverage,
              finish: shade.note || 'Satin',
              opacity: foundationCoverage === 'full' ? 0.70 : 0.52
            });
          }
        }
      } catch (err) {
        console.error('[GlamAI] TryShades render error:', err);
      }

      setSimulatedCanvasUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = userImage;
  }, [activeTab, userImage, location.state, foundationCoverage]);

  useEffect(() => {
    applyShadeToCanvas(currentShade);
  }, [currentShade, applyShadeToCanvas]);

  const handleApplyShade = () => {
    applyShadeToCanvas(currentShade);
    setAppliedMessage(`Applied ${currentShade.name} (${activeTab})!`);
    setTimeout(() => setAppliedMessage(''), 2500);
  };

  const handleSaveCustomLook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await apiClient.post('/user/saved-looks', {
        title: `${currentShade.name} Custom Look`,
        event: 'Custom Try-On',
        thumbnail: simulatedCanvasUrl || userImage,
        shades: [{ category: activeTab, name: currentShade.name, hex: currentShade.hex }]
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Could not save look.');
    }
  };

  const lookThumbnails = [
    { id: 1, name: "Party Glam", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80" },
    { id: 2, name: "Wedding Luminous", img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=200&q=80" },
    { id: 3, name: "Casual Dewy", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { id: 4, name: "Office Soft", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
    { id: 5, name: "Date Night", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 font-sans text-[#30232A]">
      {/* Top Header matching mockup 8 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-white border border-[#F8DCE5] text-[#30232A] hover:text-[#B92F60] hover:bg-[#FFF1F5] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#30232A]">
              Try Different Shades
            </h1>
            <p className="text-xs text-[#30232A]/60">
              Experiment with alternative cosmetic shades in real-time
            </p>
          </div>
        </div>

        {/* Save Custom Look */}
        <button
          onClick={handleSaveCustomLook}
          className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-2xs ${
            saved
              ? 'bg-[#B92F60] text-white border-[#B92F60]'
              : 'bg-white hover:bg-[#FFF1F5] text-[#B92F60] border-[#F8DCE5]'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 fill-[#B92F60]/20 text-[#B92F60]" />
              <span>Save Look</span>
            </>
          )}
        </button>
      </div>

      {/* Category Tabs — scrollable on mobile */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-[#F8DCE5] shadow-sm overflow-x-auto scrollbar-hide">
        {[
          { name: 'Lipstick',    icon: '💄' },
          { name: 'Foundation',  icon: '🧴' },
          { name: 'Eyeshadow',   icon: '👁️' },
          { name: 'Blush',       icon: '🌸' },
          { name: 'Eyeliner',    icon: '✏️' },
          { name: 'Mascara',     icon: '✨' },
          { name: 'Highlighter', icon: '💫' },
        ].map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => { setActiveTab(tab.name); setSelectedShadeIndex(0); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[36px] ${
                isActive
                  ? 'bg-[#B92F60] text-white shadow-xs'
                  : 'text-[#30232A]/70 hover:bg-[#FFF1F5] hover:text-[#B92F60]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Area matching Mockup 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Model Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-[#F8DCE5] shadow-xs space-y-3">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-h-[460px] bg-[#30232A] mx-auto">
            <img
              src={simulatedCanvasUrl}
              alt="Live Simulation"
              className="w-full h-full object-cover object-center"
            />

            {/* Live applied shade badge */}
            <div className="absolute bottom-3 left-3 bg-[#30232A]/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs flex items-center gap-2 border border-white/20">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white"
                style={{ backgroundColor: currentShade.hex }}
              />
              <span>
                {activeTab}: <span className="font-bold text-[#F8DCE5]">{currentShade.name}</span>
              </span>
            </div>

            {appliedMessage && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#B92F60] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-in fade-in">
                {appliedMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right: 12 Color Circles & Shade Details (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#F8DCE5] shadow-xs space-y-5">
          <div>
            <h3 className="text-xs font-bold text-[#B92F60] uppercase tracking-wider">
              Select {activeTab} Shade
            </h3>
            <p className="text-[11px] text-[#30232A]/60 mt-0.5">
              Click any circle to test on your portrait
            </p>
          </div>

          {/* 12 Color Circles Grid matching Mockup 8 */}
          <div className="grid grid-cols-6 gap-2.5">
            {currentCategoryShades.map((shade, idx) => {
              const isSelected = selectedShadeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedShadeIndex(idx)}
                  className={`relative w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all shadow-2xs ${
                    isSelected
                      ? 'ring-3 ring-[#B92F60] scale-110 shadow-sm'
                      : 'hover:scale-105 border border-white/80'
                  }`}
                  style={{ backgroundColor: shade.hex }}
                  title={`${shade.name} (${shade.note})`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Shade Details Box */}
          <div className="p-4 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#B92F60]">
              Shade Details
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#30232A]">{currentShade.name}</p>
                <p className="text-xs text-[#B92F60] font-medium">{currentShade.description}</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl border border-black/10 shadow-2xs flex-shrink-0"
                style={{ backgroundColor: currentShade.hex }}
              />
            </div>
            <span className="inline-block text-[10px] font-semibold text-[#30232A]/70 bg-white px-2 py-0.5 rounded-full border border-[#F8DCE5]">
              Finish: {currentShade.note}
            </span>

            {activeTab === 'Foundation' && (
              <div className="pt-2 border-t border-[#F8DCE5]/70 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#B92F60]">
                  Coverage Level
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'light', label: 'Light / Sheer' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'full', label: 'Full Coverage' }
                  ].map(cov => (
                    <button
                      key={cov.id}
                      type="button"
                      onClick={() => setFoundationCoverage(cov.id)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all border ${
                        foundationCoverage === cov.id
                          ? 'bg-[#B92F60] text-white border-[#B92F60] shadow-2xs'
                          : 'bg-white text-[#30232A]/70 border-[#F8DCE5] hover:bg-[#FFF1F5]'
                      }`}
                    >
                      {cov.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Apply Shade Button matching Mockup 8 */}
          <button
            onClick={handleApplyShade}
            className="w-full py-3 rounded-2xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Shade</span>
          </button>
        </div>
      </div>

      {/* Bottom Carousel of Look Presets matching Mockup 8 */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#F8DCE5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#30232A] uppercase tracking-wider">
            Quick Style Presets:
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg hover:bg-[#FFF1F5] text-[#30232A]/60 hover:text-[#B92F60]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-lg hover:bg-[#FFF1F5] text-[#30232A]/60 hover:text-[#B92F60]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {lookThumbnails.map((look) => (
            <div
              key={look.id}
              onClick={() => {
                setSimulatedCanvasUrl(look.img);
                setAppliedMessage(`Switched to ${look.name} preset!`);
                setTimeout(() => setAppliedMessage(''), 2000);
              }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-[#F8DCE5] hover:border-[#B92F60] transition-all shadow-2xs"
            >
              <img
                src={look.img}
                alt={look.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#30232A]/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-bold text-white truncate">{look.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
