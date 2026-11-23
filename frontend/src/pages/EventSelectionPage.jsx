import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Gem, Briefcase, Sun, PartyPopper,
  Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

const EVENTS = [
  {
    id: 'Wedding',
    label: 'Wedding',
    subtitle: 'Glamorous & Elegant',
    icon: Gem,
    color: '#C12F65',
    bg: '#FCE8EF',
    border: '#F3C9D8',
    tags: ['Defined Eyes', 'Elegant Shades', 'All-Day Wear'],
  },
  {
    id: 'Party',
    label: 'Party',
    subtitle: 'Trendy & Stylish',
    icon: PartyPopper,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    tags: ['Bold Lips', 'Smoky Eyes', 'Party Glow'],
  },
  {
    id: 'Casual',
    label: 'Casual / Daily',
    subtitle: 'Natural & Fresh',
    icon: Sun,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    tags: ['Soft Neutrals', 'Light Coverage', 'Everyday'],
  },
  {
    id: 'Office',
    label: 'Office',
    subtitle: 'Subtle & Professional',
    icon: Briefcase,
    color: '#0369A1',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    tags: ['Matte Finish', 'Neutral Shades', 'Polished'],
  },
];

export default function EventSelectionPage() {
  const navigate   = useNavigate();
  const location   = useLocation();

  const capturedImage = location.state?.capturedImage || sessionStorage.getItem('glamai_guest_image');
  const analysis = location.state?.analysis || (() => {
    const s = sessionStorage.getItem('glamai_guest_analysis');
    if (s) try { return JSON.parse(s); } catch {}
    return null;
  })();

  const [selected,   setSelected]   = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState('');

  async function handleGenerate() {
    if (!selected || !analysis) {
      setError(!selected ? 'Please select an event.' : 'Beauty profile missing. Please go back and retake your photo.');
      return;
    }
    setError(''); setGenerating(true);
    try {
      const res = await apiClient.post('/recommendations/generate', { analysis, occasion: selected });
      const recommendation = res.data?.recommendation;
      if (recommendation) {
        sessionStorage.setItem('glamai_recommendation', JSON.stringify(recommendation));
        sessionStorage.setItem('glamai_guest_occasion', selected);
      }
      navigate('/result', {
        state: {
          capturedImage,
          selectedEvent: { name: selected === 'Casual' ? 'Casual / Daily Wear' : selected, id: selected.toLowerCase() },
          analysis,
          recommendation,
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not generate. Please try again.');
    } finally { setGenerating(false); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-10 font-sans text-[#30232A]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/processing', { state: { capturedImage } })}
          className="p-2 rounded-2xl bg-white border border-[#F3C9D8] hover:bg-[#FCE8EF] transition-colors shadow-sm flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-[#30232A]" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-serif font-bold text-[#30232A] leading-tight">
            Which Event Are You Getting Ready For?
          </h1>
          <p className="text-[11px] text-[#30232A]/50 mt-0.5">
            Select one — we'll personalise your makeup recommendation.
          </p>
        </div>
      </div>

      {/* ── Beauty profile pill strip ────────────────────────── */}
      {analysis && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-[#F3C9D8] shadow-sm text-[11px]">
          <span className="text-[#30232A]/45 font-medium">Your Profile:</span>
          {[
            { label: `${analysis.skin_tone} Skin`, swatch: analysis.skin_tone_hex },
            { label: `${analysis.undertone} Undertone` },
            { label: `${analysis.face_shape} Face` },
          ].map(({ label, swatch }) => (
            <span key={label}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
              style={{ background:'#FCE8EF', color:'#C12F65', border:'1px solid #F3C9D8' }}>
              {swatch && <span className="w-2 h-2 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: swatch }} />}
              {label}
            </span>
          ))}
        </div>
      )}

      {/* ── Event cards — compact 2×2 grid ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {EVENTS.map((evt) => {
          const Icon       = evt.icon;
          const isSelected = selected === evt.id;
          return (
            <button
              key={evt.id}
              type="button"
              onClick={() => setSelected(evt.id)}
              className="group relative text-left rounded-2xl border-2 transition-all duration-150 focus:outline-none overflow-hidden"
              style={{
                borderColor: isSelected ? evt.color : evt.border,
                background:  isSelected ? evt.bg   : '#FFFFFF',
                boxShadow:   isSelected ? `0 2px 12px ${evt.color}20` : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Thin top accent line when selected */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: evt.color }} />
              )}

              <div className="flex items-center gap-3 p-3.5">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                     style={{ background: isSelected ? evt.color : evt.bg, border:`1px solid ${evt.border}` }}>
                  <Icon className="w-5 h-5" style={{ color: isSelected ? '#fff' : evt.color }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-tight"
                     style={{ color: isSelected ? evt.color : '#30232A' }}>
                    {evt.label}
                  </p>
                  <p className="text-[11px] font-medium text-[#30232A]/50 mt-0.5">{evt.subtitle}</p>
                  {/* Compact tag chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {evt.tags.map(tag => (
                      <span key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                        style={{
                          background: isSelected ? evt.color + '18' : evt.bg,
                          color:      isSelected ? evt.color : '#30232A' + '80',
                          border:     `1px solid ${evt.border}`,
                        }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selection ring */}
                <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                     style={{
                       borderColor: isSelected ? evt.color : '#E8D0D8',
                       background:  isSelected ? evt.color : 'white',
                     }}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Generate button row ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-[11px] text-[#30232A]/45 hidden sm:block">
          {selected
            ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ready to generate your {selected === 'Casual' ? 'Casual / Daily Wear' : selected} look</span>
            : 'Select an event above to continue'}
        </p>
        <button
          type="button"
          disabled={!selected || generating}
          onClick={handleGenerate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-white text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#C12F65,#D94F83)' }}
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></>
          ) : (
            <><Sparkles className="w-4 h-4" /><span>Generate My Makeup Look</span></>
          )}
        </button>
      </div>
    </div>
  );
}
