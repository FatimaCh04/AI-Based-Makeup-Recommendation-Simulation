import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Sparkles } from 'lucide-react';
import { mockHistoryList } from '../data/mockBeautyData';

export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Header (Screen 12 Top) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-2xl bg-white border border-pink-200 text-charcoal-700 hover:bg-pink-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">History</h1>
          <p className="text-xs text-charcoal-500">Past AI makeup simulation logs</p>
        </div>
      </div>

      {/* History List (Screen 12 List) */}
      <div className="space-y-3.5">
        {mockHistoryList.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-pink-100 shadow-soft hover:shadow-soft-md transition-all flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-charcoal-900 border border-pink-200 flex-shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>

              <div>
                <h3 className="text-base font-bold text-charcoal-900">{item.title}</h3>
                <p className="text-xs text-charcoal-400 mt-0.5">{item.date}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/result')}
              className="px-5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-xs font-bold transition-colors shadow-2xs"
            >
              View
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
