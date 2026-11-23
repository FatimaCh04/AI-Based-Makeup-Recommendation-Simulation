import React from 'react';

export default function ShadeSwatch({
  name,
  hex,
  category,
  finish,
  code,
  isSelected = false,
  onClick,
  size = 'md',
  showLabel = true,
  className = ''
}) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div 
      className={`group relative flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'bg-blush-100/70 border border-berry-300 ring-1 ring-berry-400/40 shadow-sm' 
          : 'hover:bg-ivory-200/60 border border-transparent'
      } ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`${category ? `${category}: ` : ''}${name} (${hex})`}
    >
      {/* Color Circle Swatch */}
      <div className="relative flex-shrink-0">
        <div
          className={`${sizeMap[size]} rounded-full shadow-inner border border-white/60 transition-transform duration-200 group-hover:scale-105`}
          style={{ backgroundColor: hex }}
        />
        {/* Subtle glossy highlight dot */}
        <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white/40 pointer-events-none" />
      </div>

      {showLabel && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-charcoal-900 truncate">{name}</span>
            {code && (
              <span className="text-[10px] font-mono text-charcoal-500 bg-ivory-200 px-1 py-0.2 rounded">
                {code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-charcoal-500">
            {category && <span className="font-medium text-charcoal-600">{category}</span>}
            {category && finish && <span>•</span>}
            {finish && <span className="truncate">{finish}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
