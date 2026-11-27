import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, X, RotateCcw, ChevronRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { invalidateLandmarkCache } from '../utils/virtualMakeupEngine';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CameraCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Pick up the event chosen on EventSelectionPage (or fall back to Party)
  const selectedEvent = location.state?.selectedEvent || { name: 'Party', id: 'party' };
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [mode, setMode] = useState(null); // null | 'camera' | 'preview'
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
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
      console.warn('Camera access denied:', err);
      setError('Camera access denied or unavailable. Please upload a photo from your gallery.');
      setMode(null);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraReady(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const targetRatio = 3 / 4; // Standard beauty portrait ratio (3 wide, 4 tall)
    const videoRatio = vw / vh;

    let sx = 0, sy = 0, sWidth = vw, sHeight = vh;

    if (videoRatio > targetRatio) {
      // Stream is wider than 3:4 (e.g. 16:9 webcam or 4:3), crop sides to center
      sWidth = vh * targetRatio;
      sHeight = vh;
      sx = (vw - sWidth) / 2;
      sy = 0;
    } else {
      // Stream is taller than 3:4 (e.g. 9:16 mobile selfie), crop top/bottom with bias towards face/hair
      sWidth = vw;
      sHeight = vw / targetRatio;
      sx = 0;
      sy = Math.max(0, (vh - sHeight) * 0.35);
    }

    canvas.width = Math.round(sWidth);
    canvas.height = Math.round(sHeight);
    const ctx = canvas.getContext('2d');

    // Mirror horizontally so the captured photo matches the live mirror camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setPreview(URL.createObjectURL(blob));
        stopCamera();
        setMode('preview');
      }
    }, 'image/jpeg', 0.95);
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
    if (!preview) return;

    invalidateLandmarkCache('all');

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sessionStorage.setItem('glamai_guest_image', reader.result);
        navigate('/processing', {
          state: { capturedImage: reader.result, selectedEvent }
        });
      };
      reader.readAsDataURL(imageFile);
    } else {
      sessionStorage.setItem('glamai_guest_image', preview);
      navigate('/processing', {
        state: { capturedImage: preview, selectedEvent }
      });
    }
  }, [preview, imageFile, navigate, selectedEvent]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans text-[#30232A]">
      {/* Header Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-2xl bg-white border border-[#F8DCE5] text-[#30232A] hover:bg-[#FFF1F5] hover:text-[#B92F60] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#30232A]">
            Let's Start With You.
          </h1>
          <p className="text-xs text-[#30232A]/60">
            Upload or take a clear front-facing photo — our AI will analyse your features.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Camera Live Stream Mode */}
      {mode === 'camera' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F8DCE5] shadow-xs overflow-hidden">
          <div className="relative aspect-[3/4] max-h-[480px] sm:max-h-[520px] bg-black rounded-t-3xl overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover object-center"
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
            <div className="absolute inset-8 sm:inset-10 border-2 border-white/35 rounded-[2.5rem] pointer-events-none flex items-center justify-center shadow-inner" />
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

      {/* Selected Image Preview Mode */}
      {mode === 'preview' && preview && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F8DCE5] shadow-xs overflow-hidden">
          <div className="relative bg-[#1A1417] flex items-center justify-center aspect-[3/4] max-h-[480px] sm:max-h-[520px] overflow-hidden rounded-t-3xl">
            <img
              src={preview}
              alt="Your photo"
              className="w-full h-full object-cover object-center"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-4 right-4 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-colors"
              title="Remove Photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3.5 flex items-center justify-center gap-3 bg-[#FFF1F5]/40 border-t border-[#F8DCE5]/60">
            <button
              onClick={handleRemoveImage}
              className="px-3.5 py-2 text-xs font-semibold text-[#30232A]/70 hover:text-[#30232A] border border-[#F8DCE5] bg-white rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change Photo
            </button>
            <button
              onClick={handleContinue}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#B92F60] hover:bg-[#C94D78] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              Continue to Analysis
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Initial Selection Mode: 2 Main Options */}
      {mode === null && (
        <div className="space-y-4">
          {/* Option 1: Use Camera */}
          <button
            onClick={startCamera}
            className="group w-full flex items-center gap-4 bg-white hover:bg-[#FFF1F5]/30 border border-[#F8DCE5] hover:border-[#B92F60] rounded-3xl p-5 transition-all shadow-2xs text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F5] group-hover:bg-[#F8DCE5] flex items-center justify-center transition-colors">
              <Camera className="w-6 h-6 text-[#B92F60]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#30232A]">Use Camera</p>
              <p className="text-xs text-[#30232A]/60 mt-0.5">
                Open device camera to capture a live photo
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#30232A]/40 group-hover:text-[#B92F60] transition-colors" />
          </button>

          {/* Option 2: Upload From Gallery */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group w-full flex items-center gap-4 bg-white hover:bg-[#FFF1F5]/30 border border-[#F8DCE5] hover:border-[#B92F60] rounded-3xl p-5 transition-all shadow-2xs text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F5] group-hover:bg-[#F8DCE5] flex items-center justify-center transition-colors">
              <Upload className="w-6 h-6 text-[#B92F60]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#30232A]">Upload From Gallery</p>
              <p className="text-xs text-[#30232A]/60 mt-0.5">
                Choose a portrait photo from your computer or files
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#30232A]/40 group-hover:text-[#B92F60] transition-colors" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          <p className="text-center text-[11px] text-[#30232A]/50 pt-1">
            Accepted formats: JPG, JPEG, PNG, WEBP · Max 10MB
          </p>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
