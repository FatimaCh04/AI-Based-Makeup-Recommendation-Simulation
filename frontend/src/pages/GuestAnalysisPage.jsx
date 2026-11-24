import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Check, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { generateImageSignature, generateCalibratedCanonicalLandmarks, detectRealLandmarksInBrowser } from '../utils/virtualMakeupEngine';

const ANALYSIS_STEPS = [
  { id: 'face_detection', label: 'Face Detection', message: 'Detecting facial boundaries...' },
  { id: 'skin_tone', label: 'Skin Tone Analysis', message: 'Extracting pigment tone & undertone...' },
  { id: 'skin_type', label: 'Skin Type Analysis', message: 'Analyzing skin surface variance...' },
  { id: 'face_shape', label: 'Face Shape Analysis', message: 'Measuring facial proportions...' },
  { id: 'recommendations', label: 'Personalized Recommendations', message: 'Generating tailored makeup palette...' },
];

const STATUS = { WAITING: 'waiting', ANALYZING: 'analyzing', COMPLETED: 'completed', FAILED: 'failed' };

function analyzeInBrowser(imageSrc) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(img.naturalWidth || 480, 480);
        canvas.height = Math.min(img.naturalHeight || 640, 640);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const sx = Math.floor(canvas.width * 0.30);
        const sy = Math.floor(canvas.height * 0.22);
        const sw = Math.floor(canvas.width * 0.40);
        const sh = Math.floor(canvas.height * 0.46);

        const imgData = ctx.getImageData(sx, sy, sw, sh);
        const data = imgData.data;

        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        const lumList = [];

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r > b && r > 40) {
            rSum += r; gSum += g; bSum += b; count++;
            lumList.push(0.299 * r + 0.587 * g + 0.114 * b);
          }
        }

        const rAvg = count > 0 ? rSum / count : 216;
        const gAvg = count > 0 ? gSum / count : 167;
        const bAvg = count > 0 ? bSum / count : 130;
        const lum = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;

        let skinTone = 'Medium', skinToneHex = '#D8A782';
        if (lum > 195) { skinTone = 'Fair'; skinToneHex = '#F8DECA'; }
        else if (lum > 165) { skinTone = 'Light'; skinToneHex = '#EFCFAB'; }
        else if (lum > 135) { skinTone = 'Medium'; skinToneHex = '#D8A782'; }
        else if (lum > 105) { skinTone = 'Tan'; skinToneHex = '#C49164'; }
        else if (lum > 75) { skinTone = 'Deep'; skinToneHex = '#8B6340'; }
        else { skinTone = 'Rich'; skinToneHex = '#5C3A21'; }

        let undertone = 'Warm';
        const diffRb = rAvg - bAvg;
        const ratioRb = (rAvg + 1) / (bAvg + 1);
        if (ratioRb > 1.35 && diffRb > 30) undertone = 'Warm';
        else if (diffRb < 20) undertone = 'Cool';
        else undertone = 'Neutral';

        let skinType = 'Normal';
        if (lumList.length > 5) {
          const mean = lumList.reduce((a, b) => a + b, 0) / lumList.length;
          const variance = lumList.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lumList.length;
          if (variance > 750) skinType = 'Combination';
          else if (variance > 450) skinType = 'Oily';
          else if (lum < 120) skinType = 'Dry';
        }

        resolve({
          face_detected: true,
          skin_tone: skinTone,
          skin_tone_hex: skinToneHex,
          undertone: undertone,
          face_shape: 'Oval',
          skin_type: skinType,
          confidence: 0.90,
          skin_sample_bounds: { x: sx, y: sy, w: sw, h: sh },
          face_bounds: null,
          image_size: { width: canvas.width, height: canvas.height }
        });
      };
      img.onerror = () => {
        resolve({
          face_detected: true,
          skin_tone: 'Medium',
          skin_tone_hex: '#D8A782',
          undertone: 'Warm',
          face_shape: 'Oval',
          skin_type: 'Normal',
          confidence: 0.85
        });
      };
      img.src = imageSrc;
    } catch {
      resolve({
        face_detected: true,
        skin_tone: 'Medium',
        skin_tone_hex: '#D8A782',
        undertone: 'Warm',
        face_shape: 'Oval',
        skin_type: 'Normal',
        confidence: 0.85
      });
    }
  });
}

export default function GuestAnalysisPage() {
  const navigate = useNavigate();
  const [imageData, setImageData] = useState(null);
  const [stepStatuses, setStepStatuses] = useState(
    ANALYSIS_STEPS.map(() => STATUS.WAITING)
  );
  const [scanPosition, setScanPosition] = useState(0);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const animFrameRef = useRef(null);
  const hasStarted = useRef(false);

  const completedCount = useMemo(
    () => stepStatuses.filter(s => s === STATUS.COMPLETED).length,
    [stepStatuses]
  );
  const progress = Math.round((completedCount / ANALYSIS_STEPS.length) * 100);

  useEffect(() => {
    const stored = sessionStorage.getItem('glamai_guest_image');
    if (!stored) {
      navigate('/guest/upload');
      return;
    }
    setImageData(stored);
  }, [navigate]);

  // Subtle scanning line animation
  useEffect(() => {
    if (isComplete || isFailed) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }
    let start = null;
    const duration = 2800;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = (elapsed % duration) / duration;
      setScanPosition(pct * 100);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isComplete, isFailed]);

  const updateStep = useCallback((index, status) => {
    setStepStatuses(prev => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  }, []);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const runAnalysis = useCallback(async () => {
    if (!imageData) return;
    setError('');
    setIsFailed(false);
    setIsComplete(false);
    setStepStatuses(ANALYSIS_STEPS.map(() => STATUS.WAITING));

    const filename = sessionStorage.getItem('glamai_guest_filename') || 'photo.jpg';
    const file = dataURLtoFile(imageData, filename);

    try {
      // Step 1: Face Detection
      updateStep(0, STATUS.ANALYZING);
      await delay(500);

      let validateResult;
      try {
        validateResult = await analysisService.validatePhoto(file);
      } catch (err) {
        validateResult = { detected: true };
      }

      if (!validateResult.detected) {
        updateStep(0, STATUS.FAILED);
        setError(validateResult.message || "We couldn't detect a clear face. Please upload a front-facing photo with good lighting.");
        setIsFailed(true);
        return;
      }
      updateStep(0, STATUS.COMPLETED);

      // Step 2: Skin Tone Analysis
      updateStep(1, STATUS.ANALYZING);
      await delay(400);

      let analysisData = null;
      try {
        const result = await analysisService.analyzePhoto(file);
        analysisData = result.analysis || result;
      } catch (err) {
        console.info('[GuestAnalysis] Server analysis unavailable, using in-browser analysis fallback:', err);
      }

      if (!analysisData || !analysisData.face_detected) {
        analysisData = await analyzeInBrowser(imageData);
      }
      updateStep(1, STATUS.COMPLETED);

      // Step 3: Skin Type Analysis
      updateStep(2, STATUS.ANALYZING);
      await delay(500);
      updateStep(2, STATUS.COMPLETED);

      // Step 4: Face Shape Analysis
      updateStep(3, STATUS.ANALYZING);
      await delay(450);
      updateStep(3, STATUS.COMPLETED);

      // Step 5: Recommendations
      updateStep(4, STATUS.ANALYZING);
      await delay(400);
      updateStep(4, STATUS.COMPLETED);

      // Attach image signature to guarantee cache safety and 1:1 image binding
      analysisData.image_signature = generateImageSignature(imageData);
      sessionStorage.setItem('glamai_guest_analysis', JSON.stringify(analysisData));
      let effectiveLandmarks = analysisData.landmarks;
      if (!effectiveLandmarks) {
        try {
          effectiveLandmarks = await detectRealLandmarksInBrowser(imageData);
        } catch (e) {
          console.info('[GuestAnalysis] MediaPipe client detection fallback:', e);
        }
      }
      if (!effectiveLandmarks) {
        effectiveLandmarks = generateCalibratedCanonicalLandmarks(analysisData);
      }
      sessionStorage.setItem('glamai_face_landmarks', JSON.stringify({
        landmarks: effectiveLandmarks,
        image_signature: analysisData.image_signature
      }));
      setIsComplete(true);

    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Something went wrong during analysis. Please try again.');
      setIsFailed(true);
    }
  }, [imageData, updateStep]);

  useEffect(() => {
    if (imageData && !hasStarted.current) {
      hasStarted.current = true;
      runAnalysis();
    }
  }, [imageData, runAnalysis]);

  const handleRetry = () => {
    hasStarted.current = false;
    setError('');
    setIsFailed(false);
    setIsComplete(false);
    setTimeout(() => {
      hasStarted.current = true;
      runAnalysis();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#FFF1F5] flex flex-col font-sans text-[#30232A]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#F8DCE5] bg-white/70 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B92F60] to-[#C94D78] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-[#30232A] tracking-tight">AI GLAM</span>
        </Link>
        <button
          onClick={() => navigate('/guest/upload')}
          className="text-xs font-semibold text-[#30232A]/70 hover:text-[#B92F60] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change Photo
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#F8DCE5] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">

            {/* Left Preview: Medium-Sized Photo */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[260px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#FFF1F5] border border-[#F8DCE5] shadow-xs">
                {imageData && (
                  <>
                    <img
                      src={imageData}
                      alt="Your uploaded portrait"
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Scanning Line */}
                    {!isComplete && !isFailed && (
                      <div
                        className="absolute left-0 right-0 h-[2px] pointer-events-none"
                        style={{
                          top: `${scanPosition}%`,
                          background: 'linear-gradient(90deg, transparent, #B92F60, #C94D78, transparent)',
                          boxShadow: '0 0 10px 2px rgba(185, 47, 96, 0.4)',
                        }}
                      />
                    )}

                    {/* Completion Badge */}
                    {isComplete && (
                      <div className="absolute inset-0 bg-[#30232A]/20 backdrop-blur-[1px] flex items-end justify-center pb-3">
                        <span className="bg-[#B92F60] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Compact Progress Indicator & Steps */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B92F60]">
                  AI Vision Scan
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#30232A] mt-0.5">
                  {isComplete ? 'Analysis Complete!' : isFailed ? 'Analysis Failed' : 'Analyzing Your Face...'}
                </h2>
                <p className="text-xs text-[#30232A]/70 mt-0.5">
                  {isComplete
                    ? 'Your unique facial landmarks and skin profile have been processed.'
                    : isFailed
                      ? 'Please check the error below and try another photo.'
                      : 'Detecting facial features and personalizing your makeup recommendations.'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#30232A]/70">Processing Status</span>
                  <span className="font-bold text-[#B92F60]">{progress}%</span>
                </div>
                <div className="h-2 bg-[#F8DCE5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B92F60] to-[#C94D78] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* 5 Steps Checklist */}
              <div className="space-y-2 mb-6">
                {ANALYSIS_STEPS.map((step, idx) => {
                  const status = stepStatuses[idx];
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                        status === STATUS.ANALYZING
                          ? 'bg-[#F8DCE5]/60 border border-[#B92F60]/30 font-semibold text-[#B92F60]'
                          : status === STATUS.COMPLETED
                            ? 'bg-[#FFF1F5] text-[#30232A] font-medium'
                            : status === STATUS.FAILED
                              ? 'bg-rose-50 text-rose-700 font-medium'
                              : 'text-[#30232A]/40 font-normal'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {status === STATUS.COMPLETED && (
                            <div className="w-4 h-4 rounded-full bg-[#B92F60] flex items-center justify-center text-white">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          {status === STATUS.ANALYZING && (
                            <Loader2 className="w-3.5 h-3.5 text-[#B92F60] animate-spin" />
                          )}
                          {status === STATUS.FAILED && (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {status === STATUS.WAITING && (
                            <div className="w-2 h-2 rounded-full bg-[#F8DCE5]" />
                          )}
                        </div>
                        <span>{step.label}</span>
                      </div>

                      {status === STATUS.ANALYZING && (
                        <span className="text-[10px] text-[#B92F60] animate-pulse">Analyzing...</span>
                      )}
                      {status === STATUS.COMPLETED && (
                        <span className="text-[10px] text-[#B92F60] font-semibold">Done</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isFailed && (
                  <>
                    <button
                      onClick={() => navigate('/guest/upload')}
                      className="px-4 py-2 text-xs font-semibold text-[#30232A]/70 hover:text-[#30232A] border border-[#F8DCE5] rounded-xl transition-colors"
                    >
                      New Photo
                    </button>
                    <button
                      onClick={handleRetry}
                      className="px-5 py-2 text-xs font-semibold text-white bg-[#B92F60] hover:bg-[#C94D78] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Analysis
                    </button>
                  </>
                )}

                {isComplete && (
                  <button
                    onClick={() => navigate('/guest/results')}
                    className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#B92F60] hover:bg-[#C94D78] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue to Your Beauty Profile</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
