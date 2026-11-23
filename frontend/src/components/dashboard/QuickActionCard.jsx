import React from 'react';
import { Camera, Calendar, Palette, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActionCard({
  id,
  title,
  description,
  buttonText,
  iconType,
  accentColor,
  onClick
}) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (iconType) {
      case 'camera':
        return <Camera className="w-5 h-5 text-berry-600" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-coral-500" />;
      case 'palette':
        return <Palette className="w-5 h-5 text-lavender-500" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      default:
        return <Camera className="w-5 h-5 text-berry-600" />;
    }
  };

  const getBgHover = () => {
    switch (iconType) {
      case 'camera':
        return 'group-hover:bg-berry-50/50 group-hover:border-berry-200';
      case 'calendar':
        return 'group-hover:bg-coral-50/50 group-hover:border-coral-200';
      case 'palette':
        return 'group-hover:bg-lavender-50/50 group-hover:border-lavender-200';
      case 'heart':
        return 'group-hover:bg-rose-50/50 group-hover:border-rose-200';
      default:
        return 'group-hover:bg-berry-50/50';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-5 rounded-3xl bg-white border border-blush-200/80 shadow-soft hover:shadow-soft-md transition-all duration-200 cursor-pointer ${getBgHover()}`}
    >
      <div>
        {/* Top Icon Badge */}
        <div className="w-11 h-11 rounded-2xl bg-ivory-100 flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 shadow-xs">
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-charcoal-900 mb-1.5 group-hover:text-berry-700 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-charcoal-500 leading-relaxed font-normal mb-5">
          {description}
        </p>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-2 border-t border-ivory-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-charcoal-800 group-hover:text-berry-600 transition-colors">
          {buttonText}
        </span>
        <div className="w-7 h-7 rounded-xl bg-ivory-100 group-hover:bg-berry-500 text-charcoal-500 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
