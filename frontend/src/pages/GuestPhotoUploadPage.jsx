import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Upload, X, RotateCcw, ChevronRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { invalidateLandmarkCache } from '../utils/virtualMakeupEngine';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function GuestPhotoUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [mode, setMode] = useState(null); // null | 'camera' | 'preview'
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = useCallback(async () => {
    setError('');
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission or upload a photo from your gallery.');
      setMode(null);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraReady(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setPreview(URL.createObjectURL(blob));
        stopCamera();
        setMode('preview');
      }
    }, 'image/jpeg', 0.92);
  }, [stopCamera]);

  const handleFileSelect = useCallback((e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image is too large. Please use a file under 10MB.');
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setMode('preview');
    };
    img.onerror = () => {
      setError('This file could not be read as an image. Please try another photo.');
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    setImageFile(null);
    setMode(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleContinue = useCallback(() => {
    if (!imageFile) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      invalidateLandmarkCache('guest');
      sessionStorage.setItem('glamai_guest_image', reader.result);
      sessionStorage.setItem('glamai_guest_filename', imageFile.name);
      navigate('/guest/analysis');
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, navigate]);

  return (
    <div className="min-h-screen bg-[#FFF1F5] flex flex-col font-sans text-[#30232A]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#F8DCE5] bg-white/70 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B92F60] to-[#C94D78] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#30232A] tracking-tight leading-none">AI GLAM</span>
            <span className="text-[9px] uppercase tracking-wider text-[#B92F60] font-semibold">Studio</span>
          </div>
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-[#30232A]/70 hover:text-[#B92F60] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#30232A] mb-1.5">
              Let's Start With You.
            </h1>
            <p className="text-xs sm:text-sm text-[#30232A]/70 max-w-sm mx-auto leading-relaxed">
              Choose a clear photo so we can explore a makeup look tailored to your features.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera Mode */}
          {mode === 'camera' && (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F8DCE5] shadow-xs overflow-hidden">
              <div className="relative aspect-[4/3] max-h-[380px] bg-black rounded-t-3xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-white/80">Starting camera...</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-6 border border-white/30 rounded-3xl pointer-events-none" />
              </div>
              <div className="p-4 flex items-center justify-center gap-3 bg-[#FFF1F5]/40 border-t border-[#F8DCE5]/60">
                <button
                  onClick={() => { stopCamera(); setMode(null); }}
                  className="px-4 py-2 text-xs font-semibold text-[#30232A]/70 hover:text-[#30232A] border border-[#F8DCE5] bg-white rounded-xl transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#B92F60] hover:bg-[#C94D78] rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {mode === 'preview' && preview && (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F8DCE5] shadow-xs overflow-hidden">
              <div className="relative bg-[#FFF1F5] flex items-center justify-center p-3 overflow-hidden min-h-[260px] max-h-[380px]">
                <img
                  src={preview}
                  alt="Your photo"
                  className="max-h-[350px] w-auto max-w-full rounded-2xl object-contain shadow-xs"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-5 right-5 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4 text-[#30232A]" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center gap-3 bg-[#FFF1F5]/40 border-t border-[#F8DCE5]/60">
                <button
                  onClick={handleRemoveImage}
                  className="px-4 py-2.5 text-xs font-semibold text-[#30232A]/70 hover:text-[#30232A] border border-[#F8DCE5] bg-white rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Change Photo
                </button>
                <button
                  onClick={handleContinue}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#B92F60] hover:bg-[#C94D78] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  Continue
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Initial Selection Mode */}
          {mode === null && (
            <div className="space-y-3">
              {/* Option 1: Use Camera */}
              <button
                onClick={startCamera}
                className="group w-full flex items-center gap-4 bg-white hover:bg-white/90 border border-[#F8DCE5] hover:border-[#B92F60]/50 rounded-2xl px-5 py-4 transition-all shadow-2xs"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F8DCE5]/60 group-hover:bg-[#B92F60]/10 flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5 text-[#B92F60]" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-[#30232A]">Use Camera</p>
                  <p className="text-xs text-[#30232A]/60">Take a photo using your device camera</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#30232A]/40 group-hover:text-[#B92F60] transition-colors" />
              </button>

              {/* Option 2: Upload From Gallery */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group w-full flex items-center gap-4 bg-white hover:bg-white/90 border border-[#F8DCE5] hover:border-[#B92F60]/50 rounded-2xl px-5 py-4 transition-all shadow-2xs"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F8DCE5]/60 group-hover:bg-[#B92F60]/10 flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5 text-[#B92F60]" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-[#30232A]">Upload From Gallery</p>
                  <p className="text-xs text-[#30232A]/60">Choose a photo from your files</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#30232A]/40 group-hover:text-[#B92F60] transition-colors" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              <p className="text-center text-[11px] text-[#30232A]/50 pt-1">
                Accepted formats: JPG, PNG, WEBP · Max 10MB
              </p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </main>
    </div>
  );
}
