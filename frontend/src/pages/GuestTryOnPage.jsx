import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, Download, RotateCcw, RefreshCw,
  Palette, Droplets, Lock, UserPlus, LogIn, Bookmark, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import BeforeAfterSlider from '../components/common/BeforeAfterSlider';
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

export default function GuestTryOnPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If user is registered / authenticated, redirect them immediately to the member Recommendation result page
  useEffect(() => {
    const token = localStorage.getItem('glamai_token');
    if (isAuthenticated || token) {
      navigate('/result', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [analysis, setAnalysis] = useState(null);
  const [occasion, setOccasion] = useState('Party');
  const [timeOfDay, setTimeOfDay] = useState('Day');
  const [imageData, setImageData] = useState(null);
  const [simulatedImage, setSimulatedImage] = useState(null);
  const [recommendedItems, setRecommendedItems] = useState([]);

  // Generate simulated makeup image honestly via offscreen canvas
  const createSimulatedMakeup = useCallback((srcUrl, foundationItem, blushItem, highlighterItem, eyeItem, linerItem, mascaraItem, lipItem, currentAnalysis) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 750;
      const ctx = canvas.getContext('2d');

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const landmarks = getCachedLandmarks(currentAnalysis, srcUrl, 'auto', canvas.width, canvas.height);

        if (landmarks) {
          const faceShape = currentAnalysis?.face_shape || 'Oval';
          const isGlamOccasion = ['wedding', 'party', 'eid'].includes((occasion || '').toLowerCase());

          // 1. Realistic Face-Aware Foundation Pass
          const foundHex = foundationItem?.hex || currentAnalysis?.skin_tone_hex || '#D8A782';
          const foundFinish = foundationItem?.finish || 'Satin Dewy';
          applyFoundationToCanvas(ctx, canvas.width, canvas.height, landmarks, {
            hex: foundHex,
            coverage: isGlamOccasion ? 'full' : 'medium',
            finish: foundFinish,
            opacity: isGlamOccasion ? 0.70 : 0.48,
            occasion
          });

          // 2. Realistic Face-Aware Blush Pass (face-shape customized)
          const blushHex = blushItem?.hex || '#D37D64';
          const blushFinish = blushItem?.finish || 'Luminous Glow';
          applyBlushToCanvas(ctx, canvas.width, canvas.height, landmarks, {
            hex: blushHex,
            finish: blushFinish,
            opacity: isGlamOccasion ? 0.65 : 0.55,
            faceShape,
            occasion
          });

          // 3. Realistic Face-Aware Highlighter Pass (face-shape customized)
          const highHex = highlighterItem?.hex || '#EAD5A6';
          const highFinish = highlighterItem?.finish || 'Radiant Luminous';
          applyHighlighterToCanvas(ctx, canvas.width, canvas.height, landmarks, {
            hex: highHex,
            finish: highFinish,
            opacity: isGlamOccasion ? 0.58 : 0.50,
            faceShape,
            occasion
          });

          // 4. Realistic Face-Aware Eyeshadow Pass
          const eyeHex = eyeItem?.hex || '#8F5E43';
          const eyeFinish = eyeItem?.finish || 'Shimmer';
          applyEyeshadowToCanvas(ctx, canvas.width, canvas.height, landmarks, {
            hex: eyeHex,
            finish: eyeFinish,
            opacity: isGlamOccasion ? 0.70 : 0.65,
            occasion
          });

          // 5. Realistic Face-Aware Eyeliner Pass
          const linerHex = linerItem?.hex || '#1A1A1A';
          const linerStyle = (linerItem?.name || '').toLowerCase().includes('wing') ? 'Winged' : 'Classic';
          applyEyelinerToCanvas(ctx, canvas.width, canvas.height, landmarks, {
            hex: linerHex,
            style: linerStyle,
            opacity: isGlamOccasion ? 0.95 : 0.90,
            thickness: isGlamOccasion ? 2.2 : 1.8,
            occasion
          });

          // 6. Realistic Face-Aware Mascara Pass
          const mascaraHex = mascaraItem?.hex || (isGlamOccasion ? '#080808' : '#101010');
          const mascaraVolume = mascaraItem?.finish || (isGlamOccasion ? 'Dramatic' : 'volumizing');
          applyMascaraToCanvas(ctx, canvas.width, canvas.height, landmarks, {
            hex: mascaraHex,
            intensity: isGlamOccasion ? 'Dramatic' : 'Defined',
            volume: mascaraVolume,
            opacity: 0.95,
            occasion
          });

          // 7. Realistic Face-Aware Lipstick Pass
          const lipHex = lipItem?.hex || '#B92F60';
          const lipFinish = lipItem?.finish || 'Velvet Cream';
          applyLipstickToCanvas(ctx, canvas.width, canvas.height, landmarks, {
            hex: lipHex,
            finish: lipFinish,
            opacity: isGlamOccasion ? 0.82 : 0.62,
            occasion
          });
        } else {
          console.warn('[GlamAI] Facial landmarks unavailable for guest try-on simulation.');
        }
      } catch (err) {
        console.error('[GlamAI] GuestTryOn render error:', err);
      }

      setSimulatedImage(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = srcUrl;
  }, []);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem('glamai_guest_analysis');
    const storedOccasion = sessionStorage.getItem('glamai_guest_occasion') || 'Party';
    const storedTime = sessionStorage.getItem('glamai_guest_time') || 'Day';
    const storedImage = sessionStorage.getItem('glamai_guest_image');
    const storedPalette = sessionStorage.getItem('glamai_guest_palette');

    if (!storedAnalysis || !storedImage) {
      navigate('/guest/upload');
      return;
    }

    const parsedAnalysis = JSON.parse(storedAnalysis);
    setAnalysis(parsedAnalysis);
    setOccasion(storedOccasion);
    setTimeOfDay(storedTime);
    setImageData(storedImage);

    let items = [];

    if (storedPalette) {
      try {
        const parsedPalette = JSON.parse(storedPalette);
        if (parsedPalette.shades && Array.isArray(parsedPalette.shades)) {
          items = parsedPalette.shades;
        }
      } catch (e) {}
    }

    // Default 7 supported items if not populated
    if (!items || items.length === 0) {
      const isNight = storedTime === 'Night';
      items = [
        { category: 'Foundation', name: 'Satin Radiance', finish: isNight ? 'Velvet Luminous' : 'Satin Dewy', hex: parsedAnalysis.skin_tone_hex || '#D8A782' },
        { category: 'Lipstick', name: isNight ? 'Crimson Velvet' : 'Rose Nude', finish: 'Velvet Cream', hex: isNight ? '#8B1B30' : '#BC6C7B' },
        { category: 'Eyeshadow', name: isNight ? 'Smoky Bronze Shimmer' : 'Soft Taupe Matte', finish: isNight ? 'Metallic' : 'Matte', hex: isNight ? '#8F5E43' : '#967A6B' },
        { category: 'Blush', name: 'Sunlit Terracotta', finish: 'Luminous Glow', hex: '#D37D64' },
        { category: 'Eyeliner', name: isNight ? 'Kohl Onyx Wing' : 'Soft Espresso Brown', finish: 'Smudge-proof', hex: isNight ? '#1A1A1A' : '#3E2B24' },
        { category: 'Mascara', name: isNight ? 'Lash Drama Volumizing' : 'Featherlight Defined', finish: 'Lengthening', hex: '#101010' },
        { category: 'Highlighter', name: 'Champagne Starlight', finish: 'Radiant Luminous', hex: '#EAD5A6' },
      ];
    }

    setRecommendedItems(items);

    const foundationItem = items.find(i => (i.category || '').toLowerCase() === 'foundation');
    const blushItem = items.find(i => (i.category || '').toLowerCase() === 'blush');
    const highlighterItem = items.find(i => (i.category || '').toLowerCase() === 'highlighter');
    const eyeItem = items.find(i => (i.category || '').toLowerCase() === 'eyeshadow');
    const linerItem = items.find(i => (i.category || '').toLowerCase() === 'eyeliner');
    const mascaraItem = items.find(i => (i.category || '').toLowerCase() === 'mascara');
    const lipItem = items.find(i => (i.category || '').toLowerCase() === 'lipstick');

    createSimulatedMakeup(storedImage, foundationItem, blushItem, highlighterItem, eyeItem, linerItem, mascaraItem, lipItem, parsedAnalysis);
  }, [navigate, createSimulatedMakeup]);

  // Download functionality
  const handleDownload = useCallback(() => {
    const targetImg = simulatedImage || imageData;
    if (!targetImg) return;
    const link = document.createElement('a');
    link.href = targetImg;
    link.download = `ai-glam-${occasion.toLowerCase().replace(/[^a-z]/g, '-')}-look.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [simulatedImage, imageData, occasion]);

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-[#FFF1F5] flex flex-col font-sans text-[#30232A]">
      {/* Header */}
      <header className="px-6 py-3.5 flex items-center justify-between border-b border-[#F8DCE5] bg-white/70 backdrop-blur-sm sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B92F60] to-[#C94D78] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-[#30232A] tracking-tight">AI GLAM</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/guest/results')}
            className="text-xs font-semibold text-[#30232A]/70 hover:text-[#B92F60] flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Change Event
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Page Header */}
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B92F60]">
            Personalized Beauty Preview
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#30232A] mt-0.5">
            Your Look, Your Way.
          </h1>
          <p className="text-xs sm:text-sm text-[#30232A]/70 max-w-md mx-auto mt-0.5">
            Customized for your {analysis.skin_tone} complexion ({analysis.undertone} undertone) for {occasion} ({timeOfDay} wear).
          </p>
        </div>

        {/* 2-Column Balanced Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start mb-8">

          {/* Left Column (5 cols): Before-and-After Slider Preview & Action Bar */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            {/* Interactive Before-and-After Slider */}
            <div className="bg-white rounded-3xl border border-[#F8DCE5] p-3 shadow-xs">
              <BeforeAfterSlider
                beforeImage={imageData}
                afterImage={simulatedImage || imageData}
                beforeLabel="Original"
                afterLabel="Makeup Result"
              />
              <p className="text-[11px] text-center text-[#30232A]/60 pt-2 pb-1">
                Drag the center circle left/right to compare
              </p>
            </div>

            {/* Quick Actions (Download & Change Photo) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-[#B92F60] hover:bg-[#C94D78] text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Look</span>
              </button>

              <button
                onClick={() => navigate('/guest/upload')}
                title="Start with new photo"
                className="py-2.5 px-3 rounded-2xl bg-white border border-[#F8DCE5] hover:border-[#B92F60] text-[#30232A]/70 hover:text-[#B92F60] transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Again</span>
              </button>
            </div>
          </div>

          {/* Right Column (7 cols): Recommended Makeup Palette + Guest Registration Banner */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Palette Heading: Dynamic "Your {Event} Palette" */}
            <div className="bg-white rounded-3xl border border-[#F8DCE5] p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#F8DCE5] mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#30232A]">
                    Your {occasion} Palette
                  </h2>
                  <p className="text-[11px] text-[#30232A]/60">
                    Curated for {analysis.face_shape} face structure &amp; {timeOfDay.toLowerCase()} lighting
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FFF1F5] border border-[#F8DCE5] text-[10px] font-bold text-[#B92F60]">
                  {timeOfDay} Look
                </span>
              </div>

              {/* 7 Recommended Makeup Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recommendedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] transition-all hover:bg-[#FFF1F5]"
                  >
                    <div
                      className="w-8 h-8 rounded-xl border border-black/10 shadow-2xs flex-shrink-0"
                      style={{ backgroundColor: item.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#B92F60]">
                        {item.category}
                      </p>
                      <p className="text-xs font-bold text-[#30232A] truncate">
                        {item.name || item.shade || item.category}
                      </p>
                      {item.finish && (
                        <p className="text-[10px] text-[#30232A]/60 truncate">{item.finish}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Banner: Register Prompt Exclusively for Guests */}
            <div className="bg-white rounded-3xl border border-[#F8DCE5] p-6 shadow-xs text-center space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] mx-auto shadow-2xs">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#30232A]">
                  If you want to get your personalized skin guide &amp; try different shades, Register Now!
                </h3>
                <p className="text-xs sm:text-sm text-[#30232A]/70 max-w-md mx-auto leading-relaxed">
                  Create a free beauty profile to unlock custom lipstick &amp; eyeshadow shades, access tailored skincare guidance for your {analysis.skin_type || 'skin'} type, and save your favorite looks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-2.5 rounded-2xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Now</span>
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-2.5 rounded-2xl bg-white hover:bg-[#FFF1F5] text-[#30232A] border border-[#F8DCE5] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
