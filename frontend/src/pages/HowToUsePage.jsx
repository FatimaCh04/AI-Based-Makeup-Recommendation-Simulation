import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, ScanFace, Sparkles, Gem, Briefcase, Sun, PartyPopper,
  Palette, Droplets, ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
  Eye, Heart, Layers, Circle, User, PlusCircle,
} from 'lucide-react';

/* ── Step data ─────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    icon: Camera,
    color: '#B92F60',
    bg: '#FFF1F5',
    border: '#F8DCE5',
    title: 'Start With Your Photo',
    subtitle: 'Upload or Capture Your Photo',
    description:
      'Begin your beauty journey by providing a clear, well-lit front-facing photo. You have two options:',
    details: null,
    extra: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Camera option */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#F8DCE5] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F5] border border-[#F8DCE5] flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-[#B92F60]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#30232A]">Capture with Camera</p>
            <p className="text-[11px] text-[#30232A]/60 mt-0.5 leading-relaxed">
              Open your device camera and take a live front-facing photo directly in the app.
            </p>
          </div>
        </div>
        {/* Upload option */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#F8DCE5] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1F5] border border-[#F8DCE5] flex items-center justify-center flex-shrink-0">
            <Upload className="w-5 h-5 text-[#B92F60]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#30232A]">Upload from Gallery</p>
            <p className="text-[11px] text-[#30232A]/60 mt-0.5 leading-relaxed">
              Choose an existing JPG, PNG, or WEBP portrait photo from your device — max 10 MB.
            </p>
          </div>
        </div>
      </div>
    ),
    tip: 'Use a clear, well-lit front-facing photo for the most accurate analysis results.',
  },
  {
    num: '02',
    icon: ScanFace,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#EDE9FE',
    title: 'Discover Your Beauty Profile',
    subtitle: 'AI Face Analysis',
    description:
      'Once your photo is submitted, AI GLAM analyzes your facial features using computer vision and builds your personal Beauty Profile.',
    details: [
      { icon: ScanFace,  label: 'Face Detection',      desc: 'Locates and aligns your face in the photo.' },
      { icon: Palette,   label: 'Skin Tone Analysis',   desc: 'Determines your skin tone from Fair to Rich.' },
      { icon: Droplets,  label: 'Undertone Analysis',   desc: 'Identifies Warm, Cool, or Neutral undertones.' },
      { icon: Circle,    label: 'Skin Type Analysis',   desc: 'Estimates Normal, Oily, Dry, or Combination.' },
      { icon: User,      label: 'Face Shape Analysis',  desc: 'Detects Oval, Round, Square, Heart, or Oblong.' },
    ],
    extra: null,
    tip: 'When analysis is complete you can review every detected feature in your Beauty Profile before continuing.',
  },
  {
    num: '03',
    icon: Sparkles,
    color: '#B92F60',
    bg: '#FFF1F5',
    border: '#F8DCE5',
    title: 'Choose Your Occasion',
    subtitle: 'Select Your Event',
    description:
      'Select the event you are getting ready for. Your makeup recommendations will be personalized to match the occasion and your Beauty Profile.',
    details: null,
    extra: (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
        {[
          { id: 'Wedding',  icon: Gem,          color: '#B92F60', bg: '#FFF1F5', border: '#F8DCE5', sub: 'Glamorous & Elegant' },
          { id: 'Party',    icon: PartyPopper,   color: '#7C3AED', bg: '#F5F3FF', border: '#EDE9FE', sub: 'Trendy & Stylish' },
          { id: 'Casual',   icon: Sun,           color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', sub: 'Natural & Fresh' },
          { id: 'Office',   icon: Briefcase,     color: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD', sub: 'Soft & Professional' },
        ].map(({ id, icon: Icon, color, bg, border, sub }) => (
          <div
            key={id}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl border text-center"
            style={{ backgroundColor: bg, borderColor: border }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color + '20', border: `1px solid ${border}` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-[11px] font-bold text-[#30232A]">{id}</p>
            <p className="text-[10px] text-[#30232A]/55 leading-tight">{sub}</p>
          </div>
        ))}
      </div>
    ),
    tip: 'You must select an event before clicking "Generate My Makeup Look".',
  },
  {
    num: '04',
    icon: Sparkles,
    color: '#C94D78',
    bg: '#FFF1F5',
    border: '#F8DCE5',
    title: 'Discover Your Recommended Look',
    subtitle: 'Get Personalized Makeup Recommendations',
    description:
      'Click "Generate My Makeup Look" and AI GLAM instantly creates a full personalized palette using your Beauty Profile and selected event.',
    details: null,
    extra: (
      <div className="mt-4 space-y-2.5">
        <p className="text-xs font-semibold text-[#30232A]/70">You will receive recommendations for:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Foundation',  emoji: '🧴', note: 'Skin-matched shade' },
            { label: 'Lipstick',    emoji: '💄', note: 'Event-specific colour' },
            { label: 'Eyeshadow',   emoji: '👁️', note: 'Undertone matched' },
            { label: 'Blush',       emoji: '🌸', note: 'Cheek-flattering tint' },
            { label: 'Eyeliner',    emoji: '✏️', note: 'Precision shade' },
            { label: 'Mascara',     emoji: '✨', note: 'Volume formula' },
            { label: 'Highlighter', emoji: '💫', note: 'Glow accent' },
          ].map(({ label, emoji, note }) => (
            <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#F8DCE5]">
              <span className="text-base">{emoji}</span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#30232A] truncate">{label}</p>
                <p className="text-[10px] text-[#30232A]/50 truncate">{note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#30232A]/60 leading-relaxed pt-1">
          Each product card shows the shade name, hex colour swatch, finish, and a personalized explanation of why it was recommended for you.
        </p>
      </div>
    ),
    tip: 'Tap "Why recommended?" on any shade card to read the personalized explanation.',
  },
  {
    num: '05',
    icon: Palette,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: 'Find Your Perfect Shades',
    subtitle: 'Explore and Try Different Shades',
    description:
      'Not in love with the recommended shades? Use the Try Different Shades feature to experiment freely with alternative colours.',
    details: [
      { icon: Palette,  label: 'Browse Lipstick Shades',   desc: '12 curated lip colours across finishes.' },
      { icon: Layers,   label: 'Try Foundation Shades',     desc: '12 tones from fair porcelain to deep mahogany.' },
      { icon: Eye,      label: 'Experiment with Eyeshadow', desc: '12 shades from matte neutrals to bold metallics.' },
      { icon: Heart,    label: 'Explore Blush Colours',     desc: '12 cheek shades from peachy coral to dusty plum.' },
      { icon: ScanFace, label: 'Apply & Preview',           desc: 'See each shade applied to your photo in real time.' },
    ],
    extra: null,
    tip: 'This feature is available to registered users. Save your favourite custom look directly from this page.',
  },
  {
    num: '06',
    icon: Droplets,
    color: '#0369A1',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    title: 'Take Care of Your Skin',
    subtitle: 'Follow Your Personalized Skin Guide',
    description:
      'Explore your personalized Skin Guide based on your analyzed skin type. Learn skincare practices tailored specifically to your skin.',
    details: [
      { icon: Circle,   label: 'Skin Type Information',  desc: 'Understand your Normal, Oily, Dry, or Combination skin.' },
      { icon: Droplets, label: 'Basic Skincare Tips',    desc: 'Practical advice suited to your detected skin type.' },
      { icon: Sparkles, label: 'Skincare Routines',      desc: 'Suggested prep, application, and setting steps.' },
      { icon: Heart,    label: 'Pre-Makeup Guidance',    desc: 'How to prep your skin before applying makeup.' },
    ],
    extra: null,
    tip: 'Access the Skin Guide from the Makeup Results page or via Quick Actions on your Dashboard.',
  },
];

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function HowToUsePage() {
  const navigate = useNavigate();
  const [openStep, setOpenStep] = useState(null);

  return (
    <div className="max-w-4xl mx-auto pb-16 font-sans text-[#30232A] space-y-8">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="text-center space-y-3 pt-2">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF1F5] border border-[#F8DCE5] text-xs font-bold text-[#B92F60]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step-by-Step Guide</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#30232A] leading-tight">
          How to Use AI GLAM
        </h1>

        <p className="text-sm sm:text-base text-[#30232A]/60 max-w-2xl mx-auto leading-relaxed">
          Your beauty journey, made simple. Follow these easy steps to discover personalized
          makeup recommendations and explore your perfect look.
        </p>
      </div>

      {/* ── Steps timeline ────────────────────────────────────────────── */}
      <div className="relative">
        {/* Vertical connector line — desktop only */}
        <div className="hidden lg:block absolute left-[39px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#F8DCE5] via-[#B92F60]/20 to-[#F8DCE5] pointer-events-none" />

        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const Icon    = step.icon;
            const isOpen  = openStep === idx;
            const isLast  = idx === STEPS.length - 1;

            return (
              <div key={idx} className="relative">
                {/* ── Step card ── */}
                <div className={`
                  bg-white rounded-3xl border shadow-sm transition-all duration-300
                  ${isOpen ? 'border-[#B92F60]/40 shadow-md shadow-[#B92F60]/8' : 'border-[#F8DCE5] hover:border-[#B92F60]/30'}
                `}>
                  {/* Header row — always visible, clickable to expand */}
                  <button
                    type="button"
                    onClick={() => setOpenStep(isOpen ? null : idx)}
                    className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    {/* Step number circle */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-[52px] h-[52px] rounded-2xl flex flex-col items-center justify-center shadow-sm border"
                        style={{ backgroundColor: step.bg, borderColor: step.border }}
                      >
                        <Icon className="w-5 h-5 mb-0.5" style={{ color: step.color }} />
                        <span className="text-[9px] font-black leading-none" style={{ color: step.color }}>
                          {step.num}
                        </span>
                      </div>
                      {/* Connector dot */}
                      {!isLast && (
                        <div className="hidden lg:block absolute -bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#F8DCE5] border-2 border-white" />
                      )}
                    </div>

                    {/* Title block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ color: step.color, backgroundColor: step.bg, border: `1px solid ${step.border}` }}
                        >
                          Step {step.num}
                        </span>
                        <span className="text-[10px] text-[#30232A]/40 font-medium hidden sm:inline">
                          {step.subtitle}
                        </span>
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-[#30232A] mt-1 leading-snug">
                        {step.title}
                      </h2>
                      <p className="text-xs text-[#30232A]/60 mt-0.5 leading-relaxed line-clamp-2">
                        {step.description}
                      </p>
                    </div>

                    {/* Expand toggle */}
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ backgroundColor: isOpen ? step.bg : '#F8F8F8' }}
                    >
                      {isOpen
                        ? <ChevronUp  className="w-4 h-4" style={{ color: step.color }} />
                        : <ChevronDown className="w-4 h-4 text-[#30232A]/40" />
                      }
                    </div>
                  </button>

                  {/* ── Expanded content ── */}
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-[#F8DCE5]/60 pt-4 animate-slide-in-up">

                      {/* Detail list */}
                      {step.details && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {step.details.map(({ icon: DIcon, label, desc }) => (
                            <div
                              key={label}
                              className="flex items-start gap-3 p-3 rounded-2xl"
                              style={{ backgroundColor: step.bg, border: `1px solid ${step.border}` }}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: step.color + '18' }}
                              >
                                <DIcon className="w-3.5 h-3.5" style={{ color: step.color }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#30232A]">{label}</p>
                                <p className="text-[11px] text-[#30232A]/55 leading-relaxed mt-0.5">{desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Extra JSX content (event cards, product grid, etc.) */}
                      {step.extra}

                      {/* Pro tip */}
                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#FFF1F5] to-white border border-[#F8DCE5]">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: step.color }} />
                        <p className="text-[11px] text-[#30232A]/70 leading-relaxed">
                          <span className="font-bold text-[#30232A]">Tip: </span>
                          {step.tip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick reference summary ───────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-[#F8DCE5] shadow-sm p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#30232A] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B92F60]" />
          Quick Reference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setOpenStep(idx);
                  // Smooth scroll to steps section
                  document.getElementById(`step-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all hover:shadow-sm hover:-translate-y-0.5"
                style={{ backgroundColor: step.bg, borderColor: step.border }}
              >
                <Icon className="w-5 h-5" style={{ color: step.color }} />
                <span
                  className="text-[9px] font-black uppercase tracking-wider"
                  style={{ color: step.color }}
                >
                  {step.num}
                </span>
                <span className="text-[10px] font-semibold text-[#30232A] leading-tight text-center">
                  {step.title.split(' ').slice(0, 3).join(' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CTA section ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#F8DCE5] shadow-sm">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF1F5] via-white to-[#FFF1F5] pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F8DCE5]/60 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#B92F60] to-[#C94D78] flex items-center justify-center shadow-lg shadow-[#B92F60]/20 flex-shrink-0">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Text */}
          <div className="text-center sm:text-left space-y-1 flex-1">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#30232A]">
              Ready to Discover Your Perfect Look?
            </h2>
            <p className="text-xs sm:text-sm text-[#30232A]/60 leading-relaxed">
              Now that you know how AI GLAM works, start your beauty journey!
            </p>
          </div>

          {/* CTA button */}
          <button
            onClick={() => navigate('/capture')}
            className="flex-shrink-0 flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] hover:opacity-95 text-white text-sm font-bold shadow-md shadow-[#B92F60]/25 transition-all active:scale-[0.98] whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Look</span>
          </button>
        </div>
      </div>

    </div>
  );
}
