import React from 'react';
import { Sparkles, Upload, ScanFace, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroCard({ onOpenUploadModal }) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-ivory-50 to-blush-100/60 border border-blush-200/80 shadow-soft-lg p-6 sm:p-8 lg:p-10">
      
      {/* Decorative ambient subtle background glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-berry-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rosegold-200/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Subtle Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-berry-50 border border-berry-200 text-xs font-semibold text-berry-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-berry-600 animate-pulse" />
            <span>AI Facial Feature Recognition & Makeup Simulation</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-charcoal-950 leading-[1.15]">
              Your Personalized <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-berry-600 via-berry-500 to-coral-500">
                Makeup Journey
              </span>
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-xl font-normal">
              Let AI analyze your facial features and discover makeup looks that complement you. From undertone calibration to virtual shade simulation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => navigate('/analysis')}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-berry-600 to-berry-500 hover:from-berry-700 hover:to-berry-600 text-white text-xs sm:text-sm font-semibold shadow-berry-glow hover:shadow-lg transition-all duration-200 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>✨ Start New Analysis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-ivory-100 text-charcoal-800 border border-blush-300 hover:border-berry-300 text-xs sm:text-sm font-semibold shadow-soft transition-all duration-200"
            >
              <Upload className="w-4 h-4 text-berry-600" />
              <span>Upload a Photo</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-4 border-t border-ivory-200 flex flex-wrap items-center gap-6 text-xs text-charcoal-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>468 MediaPipe Landmarks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-berry-500" />
              <span>Skin Tone & Undertone Calibration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-lavender-500" />
              <span>Private & Client-Side Ready</span>
            </div>
          </div>

        </div>

        {/* Right AI Beauty Visual */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm">
            
            {/* Visual Container with glass card styling */}
            <div className="relative rounded-3xl overflow-hidden shadow-soft-lg bg-white border border-blush-200 p-2">
              
              {/* Photo */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-charcoal-900">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80"
                  alt="AI Face Analysis Simulation"
                  className="w-full h-full object-cover object-center filter contrast-105"
                />

                {/* SVG Facial Landmark Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 500">
                  <defs>
                    <linearGradient id="aiGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C84B66" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#E56650" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="scanBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="50%" stopColor="#C84B66" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>

                  {/* Face Mesh Contour Lines */}
                  <ellipse cx="200" cy="240" rx="105" ry="145" fill="none" stroke="url(#aiGlow)" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.75" />
                  <path d="M 130 190 Q 200 230 270 190" fill="none" stroke="#C84B66" strokeWidth="1" opacity="0.6" strokeDasharray="2,2" />
                  <path d="M 140 330 Q 200 370 260 330" fill="none" stroke="#C84B66" strokeWidth="1.2" opacity="0.7" />
                  
                  {/* Eye contour markers */}
                  <path d="M 140 210 Q 165 195 190 210 Q 165 220 140 210 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
                  <path d="M 210 210 Q 235 195 260 210 Q 235 220 210 210 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
                  
                  {/* Lips contour marker */}
                  <path d="M 165 320 Q 200 305 235 320 Q 200 345 165 320 Z" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.85" />

                  {/* Key Glowing Landmark Feature Nodes */}
                  <circle cx="200" cy="120" r="3" fill="#C84B66" />
                  <circle cx="165" cy="205" r="3.5" fill="#FFFFFF" stroke="#C84B66" strokeWidth="1.5" />
                  <circle cx="235" cy="205" r="3.5" fill="#FFFFFF" stroke="#C84B66" strokeWidth="1.5" />
                  <circle cx="200" cy="265" r="3" fill="#FFFFFF" stroke="#E56650" strokeWidth="1.5" />
                  <circle cx="175" cy="320" r="3" fill="#C84B66" />
                  <circle cx="225" cy="320" r="3" fill="#C84B66" />
                  <circle cx="200" cy="385" r="3" fill="#C84B66" />

                  {/* Cheekbone highlight points */}
                  <circle cx="125" cy="260" r="2.5" fill="#E5B299" opacity="0.9" />
                  <circle cx="275" cy="260" r="2.5" fill="#E5B299" opacity="0.9" />
                </svg>

                {/* Live Scanning Horizontal Line animation */}
                <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-berry-500/25 to-transparent pointer-events-none animate-pulse-subtle" />

                {/* Floating AI Badges */}
                <div className="absolute top-3 left-3 bg-charcoal-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white flex items-center gap-1.5 border border-white/10">
                  <ScanFace className="w-3.5 h-3.5 text-berry-400" />
                  <span>Face Geometry: Oval</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-soft border border-blush-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-charcoal-400 block font-medium">Estimated Undertone</span>
                    <span className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E8A574] inline-block border border-charcoal-200" />
                      Warm Golden (94%)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Calibrated
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
