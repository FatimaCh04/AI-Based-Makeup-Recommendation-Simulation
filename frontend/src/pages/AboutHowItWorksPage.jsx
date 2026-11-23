import React from 'react';
import { Sparkles, Camera, ScanFace, Palette, Heart, ShieldCheck, Zap, Code2, Database, Layers, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutHowItWorksPage() {
  const navigate = useNavigate();

  const steps = [
    {
      num: "1",
      title: "Capture",
      desc: "Take a photo or upload from gallery with good lighting.",
      icon: Camera
    },
    {
      num: "2",
      title: "AI Analysis",
      desc: "Will analyze your facial features & 468 landmarks.",
      icon: ScanFace
    },
    {
      num: "3",
      title: "Get Recommendations",
      desc: "Personalized makeup tailored for your event.",
      icon: Sparkles
    },
    {
      num: "4",
      title: "Try & Save",
      desc: "Try different shades and save your favorite look.",
      icon: Palette
    }
  ];

  const technologies = [
    { name: "Python", role: "Core Logic & ML", color: "bg-blue-50 text-blue-600 border-blue-200" },
    { name: "OpenCV", role: "Image Processing & Color Map", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { name: "MediaPipe", role: "468 Facial Landmarks", color: "bg-teal-50 text-teal-600 border-teal-200" },
    { name: "Flask", role: "REST API Backend", color: "bg-slate-50 text-slate-700 border-slate-200" },
    { name: "MongoDB", role: "NoSQL Data Store", color: "bg-green-50 text-green-700 border-green-200" },
    { name: "React", role: "Frontend UI & Simulation", color: "bg-cyan-50 text-cyan-600 border-cyan-200" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-2xl bg-white border border-pink-200 text-charcoal-700 hover:bg-pink-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            How It Works & About Project
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500">
            AI Beauty Architecture and Facial Simulation Pipeline
          </p>
        </div>
      </div>

      {/* Top Banner: How It Works (Screen 15 Top) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-pink-400 via-rose-500 to-pink-500 text-white shadow-soft-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
        
        {/* Ambient circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="md:col-span-8 space-y-6 relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-pink-100">Step-by-Step Flow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex items-start gap-3 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                  <div className="w-8 h-8 rounded-xl bg-white text-pink-600 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{step.title}</h3>
                    <p className="text-xs text-pink-100 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Phone Wireframe Silhouette */}
        <div className="md:col-span-4 flex justify-center relative z-10">
          <div className="w-40 h-64 rounded-3xl border-4 border-white/40 bg-white/10 backdrop-blur-md p-2 shadow-2xl flex flex-col justify-between items-center text-center">
            <div className="w-12 h-1 bg-white/40 rounded-full mt-1" />
            <div className="space-y-1">
              <ScanFace className="w-8 h-8 text-white mx-auto animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase block">Beauty AI</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/40 mb-1" />
          </div>
        </div>

      </div>

      {/* Main Section: About This Project (Screen 15 Bottom) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-soft space-y-8">
        
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">About This Project</h2>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-3xl">
            This platform uses advanced computer vision and machine learning techniques to analyze facial features and provide personalized makeup recommendations along with virtual simulation in real time.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-ivory-50 border border-pink-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">AI Powered</h3>
              <p className="text-xs text-charcoal-500">Smart Analysis</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-ivory-50 border border-pink-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Secure</h3>
              <p className="text-xs text-charcoal-500">Your Data is Safe</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-ivory-50 border border-pink-100 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">Real-time</h3>
              <p className="text-xs text-charcoal-500">Instant Results</p>
            </div>
          </div>
        </div>

        {/* Technologies Used Badges */}
        <div className="space-y-3 pt-4 border-t border-pink-50">
          <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
            Technologies Used
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className={`p-3.5 rounded-2xl border ${tech.color} flex flex-col items-center justify-center text-center space-y-1 shadow-2xs hover:scale-105 transition-transform`}
              >
                <span className="text-sm font-extrabold">{tech.name}</span>
                <span className="text-[10px] opacity-80">{tech.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
