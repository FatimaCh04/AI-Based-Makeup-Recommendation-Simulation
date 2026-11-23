import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import EventCard from './EventCard';
import { mockOccasions } from '../../data/mockOccasions';

export default function EventSection() {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-berry-600 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Occasion Presets</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-950 tracking-tight">
            Choose Your Occasion
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-normal">
            Get a makeup recommendation tailored to your event.
          </p>
        </div>
      </div>

      {/* Grid of 4 Occasions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {mockOccasions.map((occasion) => (
          <EventCard key={occasion.id} occasion={occasion} />
        ))}
      </div>
    </section>
  );
}
