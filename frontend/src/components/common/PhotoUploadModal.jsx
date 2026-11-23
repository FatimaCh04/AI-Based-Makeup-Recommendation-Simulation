import React, { useState } from 'react';
import { X, UploadCloud, Camera, Sparkles, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PhotoUploadModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const samplePhotos = [
    {
      name: "Natural Light Portrait",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      tone: "Medium / Warm"
    },
    {
      name: "Frontal Portrait",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
      tone: "Fair / Cool"
    },
    {
      name: "Studio Clean Face",
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      tone: "Warm / Olive"
    }
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedFile({ name: sample.name });
    setPreviewUrl(sample.url);
  };

  const handleStartAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      navigate('/analysis', { state: { photoUrl: previewUrl || samplePhotos[0].url } });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blush-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ivory-200 bg-ivory-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-berry-100 flex items-center justify-center text-berry-600">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-charcoal-900">Upload Photo for AI Analysis</h3>
              <p className="text-xs text-charcoal-500">Fast 468-point facial landmark estimation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Dropzone Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-berry-500 bg-berry-50/40' 
                : previewUrl 
                  ? 'border-emerald-300 bg-emerald-50/20' 
                  : 'border-blush-300 hover:border-berry-400 bg-ivory-50/50'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-white ring-2 ring-berry-200">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 to-transparent flex items-end justify-center p-1.5">
                    <span className="text-[10px] font-medium text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ready
                    </span>
                  </div>
                </div>
                <div className="text-xs text-charcoal-600 font-medium">
                  {selectedFile?.name || "Selected Photo"}
                </div>
                <label className="inline-block text-xs font-semibold text-berry-600 hover:text-berry-700 cursor-pointer underline underline-offset-2">
                  Choose a different photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blush-100 flex items-center justify-center text-berry-600 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-berry-600 hover:text-berry-700 cursor-pointer underline underline-offset-2">
                    Click to browse
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <span className="text-sm text-charcoal-600"> or drag and drop</span>
                </div>
                <p className="text-xs text-charcoal-400">JPG, PNG or WEBP (Max 10MB). Frontal, well-lit photo.</p>
              </div>
            )}
          </div>

          {/* Sample Preset Photos for Quick Demo */}
          <div>
            <div className="text-xs font-semibold text-charcoal-600 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-berry-500" />
              <span>Or try with a pre-analyzed demo photo:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {samplePhotos.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-150 ${
                    previewUrl === sample.url ? 'border-berry-500 ring-2 ring-berry-400/40 shadow-sm' : 'border-ivory-300 hover:border-berry-300'
                  }`}
                >
                  <img src={sample.url} alt={sample.name} className="w-full h-20 object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-x-0 bottom-0 bg-charcoal-950/70 p-1 text-[10px] text-white text-center truncate">
                    {sample.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Note Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-100 border border-ivory-300 text-charcoal-600 text-xs">
            <AlertCircle className="w-4 h-4 text-berry-500 flex-shrink-0 mt-0.5" />
            <p>
              GlamAI estimates facial symmetry, skin undertone, and facial landmarks to generate personalized cosmetic recommendations.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ivory-200 bg-ivory-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:text-charcoal-800 rounded-xl hover:bg-ivory-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartAnalysis}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-berry-500 hover:bg-berry-600 text-white text-xs font-semibold shadow-berry-glow transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? "Processing Landmarks..." : "Run AI Analysis"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
