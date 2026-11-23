import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Upload, Sparkles, ScanFace, ArrowRight, CheckCircle2, RefreshCw, Palette } from 'lucide-react';
import { mockOccasions } from '../data/mockOccasions';
import BeforeAfterSlider from '../components/common/BeforeAfterSlider';
import Badge from '../components/common/Badge';

export default function NewAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialOccasionId = queryParams.get('occasion') || 'party';

  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasionId);
  const [stage, setStage] = useState('input'); // 'input', 'analyzing', 'result'
  const [photoUrl, setPhotoUrl] = useState(location.state?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80");

  const currentOccasion = mockOccasions.find(o => o.id === selectedOccasion) || mockOccasions[0];

  const handleRunAnalysis = () => {
    setStage('analyzing');
    setTimeout(() => {
      setStage('result');
    }, 1600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-blush-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-berry-600 uppercase tracking-wider mb-1">
            <ScanFace className="w-4 h-4" />
            <span>AI Landmark Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
            New Facial Makeup Analysis
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Select your event, calibrate facial landmarks, and receive custom cosmetic simulations.
          </p>
        </div>

        {stage === 'result' && (
          <button
            onClick={() => setStage('input')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 text-xs font-semibold border border-ivory-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        )}
      </div>

      {stage === 'input' && (
        <div className="space-y-8">
          
          {/* Step 1: Select Event */}
          <div className="p-6 rounded-3xl bg-white border border-blush-200 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-berry-500 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="text-base font-bold text-charcoal-900">Select Target Occasion</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mockOccasions.map((occ) => (
                <div
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedOccasion === occ.id
                      ? 'bg-berry-50 border-berry-400 ring-2 ring-berry-400/40 shadow-xs'
                      : 'bg-ivory-50 border-ivory-300 hover:border-berry-200'
                  }`}
                >
                  <div className="font-bold text-sm text-charcoal-900">{occ.name}</div>
                  <div className="text-[11px] text-charcoal-500 truncate">{occ.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Upload / Capture Photo */}
          <div className="p-6 rounded-3xl bg-white border border-blush-200 shadow-soft space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-berry-500 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="text-base font-bold text-charcoal-900">Provide Frontal Portrait</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-charcoal-900 shadow-md">
                  <img src={photoUrl} alt="Selected Face" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-charcoal-950/70 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    Ready for MediaPipe
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-300 space-y-2">
                  <h4 className="text-sm font-semibold text-charcoal-900">Analysis Guidelines:</h4>
                  <ul className="text-xs text-charcoal-600 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Natural frontal lighting without heavy shadows</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Neutral facial expression looking directly at lens</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Hair pulled slightly back to expose jawline contour</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleRunAnalysis}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-berry-600 to-berry-500 hover:from-berry-700 hover:to-berry-600 text-white text-sm font-semibold shadow-berry-glow transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Facial Landmark & Color Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {stage === 'analyzing' && (
        <div className="p-16 rounded-3xl bg-white border border-blush-200 shadow-soft text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-berry-200 border-t-berry-600 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-berry-50 flex items-center justify-center text-berry-600">
              <ScanFace className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-charcoal-900">Extracting 468 Facial Landmarks...</h3>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
              Calculating face shape ratio, skin undertone histogram, eye curvature angle, and matching with {currentOccasion.name} cosmetic palette.
            </p>
          </div>
        </div>
      )}

      {stage === 'result' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Result Card with Before/After Slider */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
              <div>
                <Badge variant="berry" size="sm">
                  <Sparkles className="w-3 h-3 text-berry-600" />
                  <span>96% AI Recommendation Match</span>
                </Badge>
                <h2 className="text-2xl font-bold text-charcoal-950 mt-1">
                  {currentOccasion.name} Luminous Look
                </h2>
                <p className="text-xs text-charcoal-500">
                  Customized for Oval face structure and Warm golden undertone.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/try-makeup')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-berry-500 hover:bg-berry-600 text-white text-xs font-semibold shadow-berry-glow"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Adjust Shades</span>
                </button>
              </div>
            </div>

            <BeforeAfterSlider
              beforeImage={photoUrl}
              afterImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
              beforeLabel="Original Image"
              afterLabel={`AI ${currentOccasion.name} Makeup Applied`}
              heightClass="h-80 sm:h-96"
            />

            {/* Recommended Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Foundation</span>
                <div className="text-xs font-bold text-charcoal-900">Warm Beige (F-302)</div>
                <div className="text-[10px] text-charcoal-500">Radiant Satin</div>
              </div>
              <div className="p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Lipstick</span>
                <div className="text-xs font-bold text-charcoal-900">Rose Nude (L-114)</div>
                <div className="text-[10px] text-charcoal-500">Velvet Cream</div>
              </div>
              <div className="p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Eyeshadow</span>
                <div className="text-xs font-bold text-charcoal-900">Soft Brown (E-401)</div>
                <div className="text-[10px] text-charcoal-500">Velvet Matte</div>
              </div>
              <div className="p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Blush</span>
                <div className="text-xs font-bold text-charcoal-900">Peach (B-205)</div>
                <div className="text-[10px] text-charcoal-500">Soft Luminous</div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
