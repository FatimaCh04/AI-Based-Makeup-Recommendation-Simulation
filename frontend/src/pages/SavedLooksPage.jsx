import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Heart, Sparkles, Trash2, RefreshCw, AlertCircle, PlusCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import SavedLookThumbnail from '../components/SavedLookThumbnail';

export default function SavedLooksPage() {
  const navigate = useNavigate();
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedLooks = () => {
    setLoading(true);
    setError('');
    apiClient.get('/user/saved-looks')
      .then(res => {
        if (res.data?.looks && Array.isArray(res.data.looks)) {
          setLooks(res.data.looks);
        } else {
          setLooks([]);
        }
      })
      .catch((err) => {
        console.warn('Could not load saved looks:', err);
        setLooks([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSavedLooks();
  }, []);

  const handleDeleteLook = async (e, lookId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved look?')) return;
    try {
      await apiClient.delete(`/user/saved-looks/${lookId}`);
      setLooks(prev => prev.filter(look => look.id !== lookId));
    } catch (err) {
      alert('Could not remove look. Please try again.');
    }
  };

  const handleOpenLook = (look) => {
    const baseImg = look.original_image || look.thumbnail;
    if (baseImg) {
      sessionStorage.setItem('glamai_guest_image', baseImg);
    }
    if (look.event) {
      sessionStorage.setItem('glamai_guest_occasion', look.event);
    }
    if (look.time_of_day) {
      sessionStorage.setItem('glamai_guest_time', look.time_of_day);
    }
    if (look.analysis) {
      sessionStorage.setItem('glamai_guest_analysis', JSON.stringify(look.analysis));
    }
    if (look.shades) {
      sessionStorage.setItem('glamai_guest_palette', JSON.stringify({ shades: look.shades }));
    }
    navigate('/result');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans text-[#30232A]">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-white border border-[#F8DCE5] text-[#30232A] hover:bg-[#FFF1F5] hover:text-[#B92F60] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#30232A]">Saved Looks</h1>
            <p className="text-xs text-[#30232A]/60">Your personalized beauty looks collection</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/capture')}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Look</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center text-xs text-[#30232A]/60 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#B92F60]" />
          <span>Loading your saved looks...</span>
        </div>
      )}

      {/* Empty State when no looks saved */}
      {!loading && looks.length === 0 && (
        <div className="py-16 px-4 rounded-3xl bg-white border border-[#F8DCE5] shadow-xs text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF1F5] border border-[#F8DCE5] flex items-center justify-center mx-auto text-[#B92F60] shadow-2xs">
            <Heart className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-[#30232A]">No saved looks yet</h3>
            <p className="text-xs text-[#30232A]/60 max-w-xs mx-auto">
              You haven't saved any makeup looks yet. Create a new look and click "Save Look" to see it here.
            </p>
          </div>
          <button
            onClick={() => navigate('/capture')}
            className="px-6 py-2.5 rounded-2xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Look</span>
          </button>
        </div>
      )}

      {/* Grid of Real Saved Looks */}
      {!loading && looks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {looks.map((look) => (
            <div
              key={look.id}
              onClick={() => handleOpenLook(look)}
              className="group relative rounded-3xl bg-white border border-[#F8DCE5] shadow-xs hover:shadow-sm hover:border-[#B92F60] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] bg-[#30232A] overflow-hidden">
                <SavedLookThumbnail look={look} />

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteLook(e, look.id)}
                  title="Delete look"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#30232A]/60 hover:text-rose-600 hover:bg-white shadow-2xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Event Badge */}
                <span className="absolute bottom-3 left-3 bg-[#30232A]/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                  {look.event || 'Custom'}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-[#30232A] group-hover:text-[#B92F60] transition-colors truncate">
                  {look.title || 'AI Recommended Look'}
                </h3>
                <p className="text-[11px] text-[#30232A]/50">
                  {look.created_at ? new Date(look.created_at).toLocaleDateString() : 'Saved look'}
                </p>
              </div>
            </div>
          ))}

          {/* Add New Look Dotted Card */}
          <div
            onClick={() => navigate('/capture')}
            className="rounded-3xl border-2 border-dashed border-[#F8DCE5] hover:border-[#B92F60] bg-[#FFF1F5]/40 hover:bg-[#FFF1F5] transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center space-y-2 min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] shadow-2xs">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#30232A]">Add New Look</span>
            <span className="text-xs text-[#30232A]/60">Generate with AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
