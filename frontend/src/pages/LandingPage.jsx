import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import heroModel from '../assets/hero-model.png';
import {
  Camera,
  Calendar,
  ScanFace,
  Sparkles,
  Eye,
  Shield,
  Heart,
  Palette,
  ArrowRight,
  Menu,
  X,
  Star,
  Gem,
  Sun,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 6 "How It Works" steps with Step 2 (Select Event), Step 3 (AI Analysis), and Step 6 (Try Different Makeup Shades)
  const howItWorksSteps = [
    {
      num: 1,
      title: "Upload Your Photo",
      desc: "Take a photo or choose from your gallery.",
      icon: Camera,
    },
    {
      num: 2,
      title: "Select Event",
      desc: "Choose the occasion (e.g., wedding, party, casual).",
      icon: Calendar,
    },
    {
      num: 3,
      title: "AI Analysis",
      desc: "We detect your face features, skin tone and more.",
      icon: ScanFace,
    },
    {
      num: 4,
      title: "Get Recommendations",
      desc: "Receive personalized makeup suggestions.",
      icon: Sparkles,
    },
    {
      num: 5,
      title: "Try It On",
      desc: "See your new look with virtual makeup preview.",
      icon: Eye,
    },
    {
      num: 6,
      title: "Try Different Shades",
      desc: "Experiment with custom lip, blush & eye shades.",
      icon: Palette,
    },
  ];

  // 5 "Why Choose GlowAI" feature cards matching reference image
  const whyChooseFeatures = [
    {
      icon: ScanFace,
      title: "Smart Face Analysis",
      desc: "Detect your face shape, skin tone, undertone and key features.",
    },
    {
      icon: Sparkles,
      title: "Personalized Recommendations",
      desc: "Get the perfect makeup suggestions for your face and event.",
    },
    {
      icon: Eye,
      title: "Virtual Makeup Try-On",
      desc: "See how different shades and styles look on you in real time.",
    },
    {
      icon: Shield,
      title: "Safe & Trusted",
      desc: "Your data is secure and used only for a better experience.",
    },
    {
      icon: Heart,
      title: "Save & Explore",
      desc: "Save your favourite looks and try new styles anytime.",
    },
  ];

  // 4 Stylish Event cards (WITHOUT girl photos, WITHOUT Day/Night)
  const stylishEvents = [
    {
      id: "wedding",
      name: "Wedding",
      tagline: "Glamorous & elegant makeup.",
      icon: Gem,
      gradient: "from-[#FFF1F5] via-[#FFE4EC] to-[#FFF1F5]",
      accent: "text-[#B92F60]",
      border: "border-pink-200",
      pills: ["Luminous Satin", "Rose Gold & Champagne"],
      badge: "Ceremonial Glam"
    },
    {
      id: "party",
      name: "Party",
      tagline: "Trendy & stylish makeup.",
      icon: Sparkles,
      gradient: "from-[#FDF2F8] via-[#FCE7F3] to-[#FFF0F5]",
      accent: "text-[#9E2A5B]",
      border: "border-fuchsia-200",
      pills: ["High-Impact Shimmer", "Berry Tint Lips"],
      badge: "Evening Glam"
    },
    {
      id: "casual",
      name: "Casual / Daily Wear",
      tagline: "Natural & fresh makeup with neutral shades.",
      icon: Sun,
      gradient: "from-[#FFF7ED] via-[#FFEDD5]/60 to-[#FFF1F5]",
      accent: "text-[#D96B43]",
      border: "border-amber-200",
      pills: ["Fresh Dewy Glow", "Neutral Sheer"],
      badge: "Daily Natural"
    },
    {
      id: "office",
      name: "Office",
      tagline: "Subtle & professional makeup.",
      icon: Briefcase,
      gradient: "from-[#F8FAFC] via-[#F1F5F9] to-[#FFF1F5]",
      accent: "text-[#475569]",
      border: "border-slate-200",
      pills: ["Soft Velvet Matte", "Clean Contour"],
      badge: "Workplace Elegant"
    },
  ];

  // 3 Testimonials matching reference image
  const testimonials = [
    {
      name: "Ayesha Khan",
      role: "Student",
      quote: "GlowAI is amazing! It recommended the perfect shades for my wedding look. I got so many compliments!",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Sara Ali",
      role: "Freelancer",
      quote: "The face analysis is super accurate and the virtual try-on feature is so realistic. I love this app!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Hira Shah",
      role: "Content Creator",
      quote: "Finally, a makeup recommendation tool that actually understands my face and preferences!",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF1F5] text-[#30232A] font-sans selection:bg-[#B92F60]/20 selection:text-[#B92F60] overflow-x-hidden">
      
      {/* ── TOP NAVBAR ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FFF1F5]/95 backdrop-blur-md border-b border-[#F8DCE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Logo + Tagline */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B92F60] to-[#E86A92] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              {/* Stylized Lotus/Flower Icon matching reference image */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2C13.5 4.5 13.5 6.5 12 8C10.5 6.5 10.5 4.5 12 2Z" />
                <path d="M12 22C10.5 19.5 10.5 17.5 12 16C13.5 17.5 13.5 19.5 12 22Z" />
                <path d="M2 12C4.5 10.5 6.5 10.5 8 12C6.5 13.5 4.5 13.5 2 12Z" />
                <path d="M22 12C19.5 13.5 17.5 13.5 16 12C17.5 10.5 19.5 10.5 22 12Z" />
                <path d="M4.93 4.93C7.4 6.34 8.82 7.76 7.4 9.17C6 7.76 4.59 6.34 4.93 4.93Z" />
                <path d="M19.07 19.07C16.6 17.66 15.18 16.24 16.6 14.83C18 16.24 19.41 17.66 19.07 19.07Z" />
                <path d="M4.93 19.07C6.34 16.6 7.76 15.18 9.17 16.6C7.76 18 6.34 19.41 4.93 19.07Z" />
                <path d="M19.07 4.93C17.66 7.4 16.24 8.82 14.83 7.4C16.24 6 17.66 4.59 19.07 4.93Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-[#8A254C] leading-none">
                GlowAI
              </span>
              <span className="text-[10px] text-[#7A6D74] font-medium tracking-tight mt-0.5">
                Your Beauty, Powered by AI
              </span>
            </div>
          </Link>

          {/* Nav Links in matching page order */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#5D5257]">
            <a href="#hero" className="text-[#B92F60] font-semibold hover:text-[#B92F60] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#B92F60] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#B92F60] transition-colors">How It Works</a>
            <a href="#events" className="hover:text-[#B92F60] transition-colors">Events</a>
            <a href="#contact" className="hover:text-[#B92F60] transition-colors">Contact</a>
          </nav>

          {/* Right Action Buttons: Login & Get Started */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full bg-white hover:bg-[#FFF1F5] text-[#30232A] border border-[#F8DCE5] font-semibold text-sm transition-all shadow-xs"
            >
              Login
            </Link>
            <button
              onClick={() => navigate('/guest/upload')}
              className="px-6 py-2.5 rounded-full bg-[#B92F60] hover:bg-[#C94D78] text-white font-semibold text-sm shadow-sm hover:shadow transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button — touch-friendly */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#30232A] touch-target flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-pink-200 px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#5D5257]">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B92F60]">Home</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B92F60]">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B92F60]">How It Works</a>
              <a href="#events" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B92F60]">Events</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#B92F60]">Contact</a>
            </nav>
            <div className="pt-3 border-t border-pink-100 flex gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full border border-pink-300 text-sm font-semibold text-[#30232A]"
              >
                Login
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/guest/upload');
                }}
                className="flex-1 py-2.5 rounded-full bg-[#B92F60] text-white text-sm font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section id="hero" className="relative overflow-hidden pt-6 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        {/* Background blobs — hidden on very small screens to prevent overflow */}
        <div className="hidden sm:block absolute top-20 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 left-10 w-64 sm:w-80 h-64 sm:h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Botanical leaves — hidden on mobile to prevent overflow */}
        <div className="hidden md:block absolute -top-4 -left-6 w-64 lg:w-80 h-72 lg:h-96 pointer-events-none select-none opacity-40 text-[#E8A5B9] -z-10">
          <svg viewBox="0 0 300 360" fill="currentColor" className="w-full h-full transform -rotate-6">
            <path d="M10 0 C40 80, 80 180, 180 320" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M25 40 C 10 25, 0 8, 15 2 C 32 -4, 45 18, 25 40 Z" /><path d="M38 75 C 65 60, 85 40, 78 28 C 70 16, 50 45, 38 75 Z" /><path d="M52 110 C 28 98, 18 78, 30 70 C 45 60, 62 85, 52 110 Z" /><path d="M72 145 C 102 130, 125 110, 118 98 C 108 85, 85 112, 72 145 Z" /><path d="M92 185 C 65 172, 52 150, 65 142 C 80 132, 102 158, 92 185 Z" /><path d="M115 225 C 148 210, 172 188, 165 175 C 155 162, 130 190, 115 225 Z" /><path d="M140 265 C 112 252, 98 230, 112 222 C 128 212, 150 238, 140 265 Z" /><path d="M165 295 C 195 282, 218 260, 210 248 C 200 235, 178 262, 165 295 Z" /><path d="M180 320 C 195 340, 215 350, 218 340 C 220 330, 200 310, 180 320 Z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left: Hero content */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/80 border border-[#F8DCE5] text-xs font-semibold text-[#B92F60] shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span>AI-Powered Makeup Recommendation</span>
            </div>

            <h1 className="heading-xl font-extrabold text-[#30232A] leading-tight tracking-tight">
              Your Perfect Look,<br />
              <span className="text-[#B92F60]">Powered by AI</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#5D5257] font-normal leading-relaxed max-w-lg">
              Get personalized makeup recommendations based on your face features, skin tone and event. Try it, love it!
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <button
                onClick={() => navigate('/guest/upload')}
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#B92F60] hover:bg-[#C94D78] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 touch-target"
              >
                <span>Try Makeup as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white hover:bg-[#FFF1F5] text-[#30232A] border border-[#F8DCE5] font-semibold text-sm shadow-sm transition-all active:scale-95 touch-target"
              >
                Login / Register
              </button>
            </div>
          </div>

          {/* ── Right: Hero image ──────────────────────────────────── */}
          <div className="lg:col-span-5 relative flex justify-center items-center">

            {/*
              The hero-model.png is a 676×548 composition whose own background
              is already #FFF1F5 / very light pink — identical to the page bg.
              The only problem is the hard rectangular PNG frame.

              Fix: CSS mask with a precise elliptical radial gradient.
              • Centre 88 % of the image is fully opaque (keeps face + oval + text).
              • Edges fade smoothly to transparent over the outer 12 % ring.
              • The mask is slightly taller (top-heavy) so the hair is never cut.
              No extra decorations needed — they are already part of the image.
            */}
            <div
              className="w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[520px] xl:max-w-[560px] transition-transform duration-500 hover:scale-[1.015]"
              style={{
                WebkitMaskImage: [
                  /* Main ellipse — keeps 86 % of width, 90 % of height opaque */
                  'radial-gradient(',
                  '  ellipse 86% 90% at 50% 48%,',
                  '  black 0%,',
                  '  black 60%,',
                  '  rgba(0,0,0,0.92) 70%,',
                  '  rgba(0,0,0,0.55) 80%,',
                  '  rgba(0,0,0,0.12) 90%,',
                  '  transparent 100%',
                  ')',
                ].join(''),
                maskImage: [
                  'radial-gradient(',
                  '  ellipse 86% 90% at 50% 48%,',
                  '  black 0%,',
                  '  black 60%,',
                  '  rgba(0,0,0,0.92) 70%,',
                  '  rgba(0,0,0,0.55) 80%,',
                  '  rgba(0,0,0,0.12) 90%,',
                  '  transparent 100%',
                  ')',
                ].join(''),
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
              }}
            >
              <img
                src={heroModel}
                alt="GlowAI — AI-powered beauty recommendations"
                className="w-full h-auto object-contain block"
                draggable={false}
              />
            </div>

          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-sm border border-[#F8DCE5] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
            {[
              { icon: ScanFace,  title: 'Face Analysis',               sub: 'Detect your features' },
              { icon: Sparkles,  title: 'Personalized Recommendations', sub: 'For your unique look' },
              { icon: Eye,       title: 'Virtual Try-On',               sub: 'See the magic' },
              { icon: Shield,    title: 'Safe & Easy',                  sub: 'Your beauty, our priority' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#30232A] leading-tight">{title}</h4>
                  <p className="hidden sm:block text-[11px] text-[#7A6D74]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE GLOWAI ────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 py-8 sm:py-12 bg-white/60 border-y border-[#F8DCE5] px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#30232A]">
              Why Choose GlowAI?
            </h2>
            <p className="text-xs sm:text-sm text-[#5D5257]">
              We combine advanced technology with beauty expertise to give you makeup recommendations that truly suit you.
            </p>
          </div>

          {/* 5 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {whyChooseFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white border border-[#F8DCE5] shadow-soft hover:shadow-md hover:border-[#B92F60] transition-all space-y-4 flex flex-col justify-between text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] text-[#B92F60] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-[#30232A]">
                      {f.title}
                    </h3>
                    <p className="text-xs text-[#7A6D74] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-8 sm:py-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="space-y-6 sm:space-y-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#30232A]">
              How It Works?
            </h2>
            <p className="text-xs sm:text-sm text-[#5D5257]">
              Get your personalized makeup look in just a few simple steps.
            </p>
          </div>

          {/* 6 Connected Step Circles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-7 items-start relative">
            {howItWorksSteps.map((s, index) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="flex flex-col items-center text-center space-y-3 group relative">
                  
                  {/* Circle with Step Badge */}
                  <div className="relative">
                    {/* Pink Number Pill */}
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#B92F60] text-white text-xs font-bold flex items-center justify-center shadow-xs z-10">
                      {s.num}
                    </span>

                    {/* Main Icon Circle */}
                    <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full bg-white border-2 border-dashed border-[#F8DCE5] group-hover:border-[#B92F60] flex items-center justify-center text-[#B92F60] shadow-soft transition-all duration-300 group-hover:scale-105">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFF1F5] flex items-center justify-center">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-1 max-w-[170px]">
                    <h3 className="text-sm sm:text-base font-bold text-[#30232A]">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#7A6D74] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {/* Desktop Connecting Arrow between steps */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-9 -right-3.5 xl:-right-4 text-[#E8A5B9] pointer-events-none">
                      <ArrowRight className="w-4 h-4 opacity-60" />
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── MAKEUP FOR EVERY MOMENT ──────────────────────────────── */}
      <section id="events" className="scroll-mt-20 py-8 sm:py-12 bg-white/60 border-t border-[#F8DCE5] px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B92F60] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Choose Your Event</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#30232A]">
              Makeup for Every Moment
            </h2>
            <p className="text-xs sm:text-sm text-[#5D5257]">
              Different events, different vibes. Choose your occasion and get a look that matches your style.
            </p>
          </div>

          {/* 4 Compact & Stylish Event Cards (NO girl photos, NO Day/Night, NO Select Look) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stylishEvents.map((evt) => {
              const EventIcon = evt.icon;
              return (
                <div
                  key={evt.id}
                  onClick={() => navigate(`/select-event?occasion=${evt.id}`)}
                  className={`group relative p-5 rounded-2xl bg-gradient-to-b ${evt.gradient} border ${evt.border} shadow-soft hover:shadow-md hover:border-[#B92F60]/50 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1`}
                >
                  <div className="space-y-3.5">
                    
                    {/* Top Row: Compact Icon Circle + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-white/80 flex items-center justify-center text-[#B92F60] group-hover:scale-105 transition-transform">
                        <EventIcon className={`w-5 h-5 ${evt.accent}`} />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 text-[#30232A] border border-white/70 shadow-xs">
                        {evt.badge}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[#30232A] group-hover:text-[#B92F60] transition-colors">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-[#5D5257] leading-relaxed">
                        {evt.tagline}
                      </p>
                    </div>

                    {/* Stylish Aesthetic Micro-Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {evt.pills.map((pill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/75 text-[#5D5257] border border-black/5"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-white/60 border-b border-[#F8DCE5] px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#30232A]">
              What Our Users Say
            </h2>
            <p className="text-xs sm:text-sm text-[#5D5257]">
              Real people. Real transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-[#F8DCE5] shadow-soft space-y-4 flex flex-col justify-between"
              >
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#E0876A]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-[#B92F60]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-[#5D5257] leading-relaxed italic">
                  "{t.quote}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-2 border-t border-pink-50">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-pink-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#30232A]">{t.name}</h4>
                    <span className="text-[11px] text-[#7A6D74]">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. READY TO FIND YOUR PERFECT LOOK? (Final CTA with Makeup Brushes)
         ========================================================================= */}
      <section className="relative overflow-hidden py-8 sm:py-10 px-6 sm:px-12 max-w-7xl mx-auto">
        
        {/* Soft Background Card */}
        <div className="relative rounded-[32px] bg-gradient-to-r from-[#FFF1F5] via-[#FFE4EC] to-[#FFF1F5] border border-[#F8DCE5] p-8 sm:p-10 text-center shadow-soft space-y-5">
          
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B92F60]">
              Ready to find your perfect look?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#30232A] leading-tight">
              Join thousands of happy users and discover<br className="hidden sm:inline" />
              makeup looks that truly suit you.
            </h2>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate('/guest/upload')}
              className="px-8 py-3.5 rounded-full bg-[#B92F60] hover:bg-[#C94D78] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer id="contact" className="scroll-mt-20 border-t border-[#F8DCE5] py-8 sm:py-10 px-4 sm:px-8 lg:px-12 text-[#5D5257]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5 text-center lg:text-left">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B92F60] to-[#E86A92] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2C13.5 4.5 13.5 6.5 12 8C10.5 6.5 10.5 4.5 12 2Z" />
                <path d="M12 22C10.5 19.5 10.5 17.5 12 16C13.5 17.5 13.5 19.5 12 22Z" />
                <path d="M2 12C4.5 10.5 6.5 10.5 8 12C6.5 13.5 4.5 13.5 2 12Z" />
                <path d="M22 12C19.5 13.5 17.5 13.5 16 12C17.5 10.5 19.5 10.5 22 12Z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold text-[#8A254C] leading-none">
                GlowAI
              </span>
              <span className="text-[10px] text-[#7A6D74] mt-0.5">
                Your Beauty, Powered by AI
              </span>
            </div>
          </Link>

          {/* Links in matching page order */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-[#5D5257]">
            <a href="#hero" className="hover:text-[#B92F60] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#B92F60] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#B92F60] transition-colors">How It Works</a>
            <a href="#events" className="hover:text-[#B92F60] transition-colors">Events</a>
            <a href="#contact" className="hover:text-[#B92F60] transition-colors">Contact</a>
          </div>

          {/* Social Icons + Copyright in single clean group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
            <div className="flex items-center gap-3 text-[#7A6D74]">
              <a href="#instagram" className="w-8 h-8 rounded-full bg-white/80 border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] hover:bg-[#B92F60] hover:text-white transition-all shadow-2xs" aria-label="Instagram">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#facebook" className="w-8 h-8 rounded-full bg-white/80 border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] hover:bg-[#B92F60] hover:text-white transition-all shadow-2xs" aria-label="Facebook">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="#youtube" className="w-8 h-8 rounded-full bg-white/80 border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] hover:bg-[#B92F60] hover:text-white transition-all shadow-2xs" aria-label="YouTube">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
            <span className="text-[11px] text-[#7A6D74] sm:border-l sm:border-[#F8DCE5] sm:pl-4">
              © 2026 GlowAI. All rights reserved.
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}

