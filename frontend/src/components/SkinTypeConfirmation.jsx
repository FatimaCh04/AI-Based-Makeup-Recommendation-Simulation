import React from 'react';
import { CheckCircle2, Droplets } from 'lucide-react';

const SKIN_TYPES = ['Dry', 'Normal', 'Oily', 'Combination'];

export default function SkinTypeConfirmation({
  predictedSkinType,
  selectedSkinType,
  onChange
}) {
  const isValid = SKIN_TYPES.includes(selectedSkinType);

  return (
    <section className="bg-white rounded-3xl border border-[#F8DCE5] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2.5 mb-3">
        <Droplets className="w-5 h-5 text-[#B92F60]" />
        <h3 className="text-base sm:text-lg font-serif font-bold text-[#30232A]">
          Confirm Your Skin Type
        </h3>
      </div>

      <p className="text-xs text-[#30232A]/70 mb-2">
        AI-estimated skin type:{' '}
        <strong>{predictedSkinType || 'Not available'}</strong>
      </p>

      <p className="text-xs text-[#30232A]/60 mb-4">
        Photo-based skin type predictions may be inaccurate.
        Please select the skin type that best matches your experience.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SKIN_TYPES.map((type) => {
          const selected = selectedSkinType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              aria-pressed={selected}
              className={`rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
                selected
                  ? 'border-[#B92F60] bg-[#F8DCE5] text-[#B92F60]'
                  : 'border-[#F8DCE5] bg-white text-[#30232A] hover:border-[#B92F60]'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {isValid && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#B92F60]">
          <CheckCircle2 className="w-4 h-4" />
          Selected skin type: {selectedSkinType}
        </p>
      )}
    </section>
  );
}
