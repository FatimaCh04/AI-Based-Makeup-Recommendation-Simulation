import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, Heart, Briefcase, Coffee, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OCCASIONS = [
  { id: 'wedding', label: 'Wedding', icon: Heart, desc: 'Elegant and glamorous looks for the big day' },
  { id: 'party', label: 'Party', icon: PartyPopper, desc: 'Bold and vibrant styles to stand out' },
  { id: 'casual', label: 'Casual / Daily Wear', icon: Coffee, desc: 'Natural, effortless everyday beauty' },
  { id: 'office', label: 'Office', icon: Briefcase, desc: 'Polished and professional makeup' },
];

export default function GuestOccasionPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const analysis = sessionStorage.getItem('glamai_guest_analysis');
    if (!analysis) {
      navigate('/guest/upload');
    }
  }, [navigate]);

  const handleContinue = () => {
    if (!selected) return;
    sessionStorage.setItem('glamai_guest_occasion', selected);
    const token = localStorage.getItem('glamai_token');
    if (isAuthenticated || token) {
      navigate('/result');
    } else {
      navigate('/guest/tryon');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B77A83] to-[#C4929A] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-[#28211F] tracking-tight">AI Glam</span>
        </Link>
        <button
          onClick={() => navigate('/guest/results')}
          className="text-xs font-medium text-[#28211F]/60 hover:text-[#B77A83] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#28211F] mb-3">
              Choose Your Occasion
            </h1>
            <p className="text-sm text-[#28211F]/60">
              We'll tailor your makeup recommendations to match the moment.
            </p>
          </div>

          {/* Occasion Options */}
          <div className="space-y-3 mb-8">
            {OCCASIONS.map((occasion) => {
              const Icon = occasion.icon;
              const isSelected = selected === occasion.id;
              return (
                <button
                  key={occasion.id}
                  onClick={() => setSelected(occasion.id)}
                  className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'bg-[#B77A83]/8 border-[#B77A83]/30 shadow-sm'
                      : 'bg-white border-[#EAD0D0] hover:border-[#B77A83]/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-[#B77A83] text-white' : 'bg-[#EAD0D0]/50 text-[#B77A83]'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-[#B77A83]' : 'text-[#28211F]'}`}>
                      {occasion.label}
                    </p>
                    <p className="text-xs text-[#28211F]/50 mt-0.5">{occasion.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#B77A83] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Continue */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="px-8 py-3 text-sm font-semibold text-white bg-[#B77A83] hover:bg-[#A36B75] rounded-2xl shadow-sm transition-all inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate My Look
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
