import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    default: 'bg-ivory-200 text-charcoal-700 border-ivory-300',
    primary: 'bg-berry-50 text-berry-700 border-berry-200',
    berry: 'bg-berry-100 text-berry-800 border-berry-200',
    coral: 'bg-coral-50 text-coral-700 border-coral-200',
    lavender: 'bg-lavender-100 text-lavender-700 border-lavender-200',
    rosegold: 'bg-rosegold-100 text-rosegold-600 border-rosegold-200',
    blush: 'bg-blush-100 text-charcoal-800 border-blush-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
