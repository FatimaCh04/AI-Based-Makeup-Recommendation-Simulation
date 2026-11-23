import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, CheckCircle2, Sparkles, Heart } from 'lucide-react';
import { mockProducts } from '../data/mockBeautyData';

export default function ProductSuggestionsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = activeCategory === 'All'
    ? mockProducts
    : mockProducts.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/result')}
            className="p-2.5 rounded-2xl bg-white border border-pink-200 text-charcoal-700 hover:bg-pink-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Recommended Products</h1>
            <p className="text-xs text-charcoal-500">Commercial cosmetics matched to your AI analysis</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-pink-100 shadow-soft overflow-x-auto">
        {['All', 'Foundation', 'Lipstick', 'Eyeshadow', 'Blush'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-charcoal-600 hover:bg-pink-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards List */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="p-5 rounded-3xl bg-white border border-pink-100 shadow-soft hover:shadow-soft-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-ivory-100 overflow-hidden border border-pink-200 flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                    {product.brand}
                  </span>
                  <span className="text-xs text-charcoal-400 font-medium">{product.category}</span>
                </div>

                <h3 className="text-base font-bold text-charcoal-900 leading-tight">
                  {product.name} — <span className="text-pink-600 font-semibold">{product.shade}</span>
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 text-xs text-charcoal-600">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-charcoal-400">({product.reviewsCount} reviews)</span>
                  <span className="font-bold text-charcoal-900 ml-2">{product.price}</span>
                </div>

                {/* Why Recommended AI Badge */}
                <p className="text-xs text-charcoal-600 pt-1">
                  <span className="font-semibold text-pink-700">Why recommended? </span>
                  {product.whyRecommended}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => alert(`Redirecting to cosmetic partner store for ${product.brand} ${product.name}`)}
                className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-berry-glow transition-all active:scale-95 whitespace-nowrap"
              >
                View Product
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
