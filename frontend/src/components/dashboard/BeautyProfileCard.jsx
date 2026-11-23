import React from 'react';
import { UserCheck, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockUserData } from '../../data/mockUserData';
import Badge from '../common/Badge';

export default function BeautyProfileCard({ onOpenUploadModal }) {
  const navigate = useNavigate();
  const profile = mockUserData.beautyProfile;

  return (
    <div className="relative rounded-3xl bg-white border border-blush-200/80 shadow-soft p-6 space-y-5 flex flex-col justify-between">
      
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-berry-50 flex items-center justify-center text-berry-600 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-charcoal-950 tracking-tight">
                Your Beauty Profile
              </h3>
              <span className="text-[11px] text-charcoal-500">
                AI Landmark Calibration: {profile.lastAnalyzed}
              </span>
            </div>
          </div>

          <Badge variant="primary" size="sm">
            <Sparkles className="w-3 h-3 text-berry-500" />
            <span>AI Verified</span>
          </Badge>
        </div>

        <p className="text-xs text-charcoal-500 leading-relaxed">
          Your beauty profile helps GlamAI personalize makeup recommendations based on your unique facial architecture.
        </p>
      </div>

      {/* Feature Attributes Grid (4 Key Attributes) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Face Shape */}
        <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-300/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-charcoal-500">
            <span>Face Shape</span>
            <span className="text-[10px] font-bold text-berry-600 bg-berry-50 px-1.5 py-0.2 rounded-md">
              {profile.faceShape.confidence}
            </span>
          </div>
          <div className="text-sm font-bold text-charcoal-900">
            {profile.faceShape.value}
          </div>
          <p className="text-[10px] text-charcoal-400 truncate">
            {profile.faceShape.badge}
          </p>
        </div>

        {/* Skin Tone */}
        <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-300/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-charcoal-500">
            <span>Skin Tone</span>
            <span
              className="w-3 h-3 rounded-full border border-charcoal-200 shadow-xs inline-block"
              style={{ backgroundColor: profile.skinTone.hex }}
              title={profile.skinTone.hex}
            />
          </div>
          <div className="text-sm font-bold text-charcoal-900">
            {profile.skinTone.value}
          </div>
          <p className="text-[10px] text-charcoal-400 truncate">
            {profile.skinTone.badge}
          </p>
        </div>

        {/* Undertone */}
        <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-300/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-charcoal-500">
            <span>Undertone</span>
            <span
              className="w-3 h-3 rounded-full border border-charcoal-200 shadow-xs inline-block"
              style={{ backgroundColor: profile.undertone.hex }}
              title={profile.undertone.hex}
            />
          </div>
          <div className="text-sm font-bold text-charcoal-900">
            {profile.undertone.value}
          </div>
          <p className="text-[10px] text-charcoal-400 truncate">
            {profile.undertone.badge}
          </p>
        </div>

        {/* Eye Shape */}
        <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-300/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-charcoal-500">
            <span>Eye Shape</span>
            <span className="text-[10px] font-bold text-lavender-500 bg-lavender-50 px-1.5 py-0.2 rounded-md">
              {profile.eyeShape.confidence}
            </span>
          </div>
          <div className="text-sm font-bold text-charcoal-900">
            {profile.eyeShape.value}
          </div>
          <p className="text-[10px] text-charcoal-400 truncate">
            {profile.eyeShape.badge}
          </p>
        </div>

      </div>

      {/* Nose & Lip Attributes Summary */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-blush-50/70 border border-blush-200/80 space-y-1 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-charcoal-600 font-medium">Nose Structure:</span>
          <span className="text-charcoal-900 font-semibold">{profile.noseCharacteristics.value}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-charcoal-600 font-medium">Lip Morphology:</span>
          <span className="text-charcoal-900 font-semibold">{profile.lipShape.value}</span>
        </div>
      </div>

      {/* Explanatory Architecture Disclaimer Note */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-ivory-100 border border-ivory-300/80 text-[11px] text-charcoal-500 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-berry-500 flex-shrink-0 mt-0.5" />
        <span>
          These values are AI-based visual estimates generated via computer vision. Not intended for clinical dermatology.
        </span>
      </div>

      {/* Bottom Update Button */}
      <button
        onClick={() => navigate('/analysis')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-ivory-100 hover:bg-berry-50 text-charcoal-800 hover:text-berry-700 border border-ivory-300 hover:border-berry-300 text-xs font-semibold shadow-xs transition-all duration-200"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Update Analysis</span>
      </button>

    </div>
  );
}
