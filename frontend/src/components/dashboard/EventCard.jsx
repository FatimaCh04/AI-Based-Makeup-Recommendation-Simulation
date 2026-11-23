import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EventCard({ occasion }) {
  const navigate = useNavigate();

  const handleSelectEvent = () => {
    navigate(`/analysis?occasion=${occasion.id}`, { state: { selectedOccasion: occasion } });
  };

  return (
    <div
      onClick={handleSelectEvent}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-blush-200/80 shadow-soft hover:shadow-soft-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image Container with Top Tag */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-charcoal-900">
        <img
          src={occasion.image}
          alt={occasion.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/20 to-transparent" />

        {/* Tag Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-white/90 backdrop-blur-md text-charcoal-900 shadow-sm border border-white/20">
            {occasion.tag}
          </span>
        </div>

        {/* Event Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 drop-shadow-sm">
            {occasion.name}
            <Sparkles className="w-3.5 h-3.5 text-berry-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-white/80 font-normal truncate">
            {occasion.subtitle}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Description */}
        <p className="text-xs text-charcoal-600 leading-relaxed font-normal">
          {occasion.description}
        </p>

        {/* Key cosmetic highlights */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-400">
            AI Signature Palette:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {occasion.keyHighlights.map((highlight, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-ivory-100 text-charcoal-700 font-medium border border-ivory-300/80"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div className="pt-3 border-t border-ivory-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-charcoal-900 group-hover:text-berry-600 transition-colors">
            Get {occasion.name} Look
          </span>
          <div className="w-8 h-8 rounded-full bg-ivory-100 group-hover:bg-berry-500 text-charcoal-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
}
