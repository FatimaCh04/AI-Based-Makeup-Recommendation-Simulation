import React, { useState, useEffect } from 'react';
import { Settings, Server, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Database, Code, Sparkles } from 'lucide-react';
import { apiClient, API_BASE_URL } from '../services/apiClient';

export default function SettingsPage() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected', 'offline', 'checking'
  const [apiResponse, setApiResponse] = useState(null);

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    try {
      const res = await apiClient.get('/health');
      setApiResponse(res.data);
      setBackendStatus('connected');
    } catch (err) {
      setBackendStatus('offline');
      setApiResponse(null);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="p-6 rounded-3xl bg-white border border-blush-200 shadow-soft">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-berry-600 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>System Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
          GlamAI Studio Settings & API Status
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500">
          Monitor Flask API connectivity, MediaPipe facial landmark services, and frontend preferences.
        </p>
      </div>

      {/* Backend Integration Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-soft space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-berry-50 flex items-center justify-center text-berry-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900">Python Flask API Service</h3>
              <p className="text-xs text-charcoal-500">Target: <code className="font-mono bg-ivory-200 px-1 py-0.5 rounded">{API_BASE_URL}</code></p>
            </div>
          </div>

          <button
            onClick={checkBackendHealth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 text-xs font-semibold border border-ivory-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
            <span>Test Ping</span>
          </button>
        </div>

        {/* Status Pill Indicator */}
        <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              backendStatus === 'connected' ? 'bg-emerald-500 shadow-sm animate-pulse' : backendStatus === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-berry-500'
            }`} />
            <span className="text-xs font-bold text-charcoal-900">
              {backendStatus === 'connected' ? 'Flask Server Connected' : backendStatus === 'checking' ? 'Testing Connection...' : 'Standalone Simulation Mode (Backend Offline)'}
            </span>
          </div>

          <span className="text-xs text-charcoal-500 font-medium">
            {backendStatus === 'connected' ? 'Ready for ML Inference' : 'Using Structured Mock Fallback'}
          </span>
        </div>

        {/* Technology Stack Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-ivory-100/70 border border-ivory-300/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <Cpu className="w-4 h-4 text-berry-600" />
              <span>Computer Vision</span>
            </div>
            <p className="text-[11px] text-charcoal-500">MediaPipe FaceMesh (468 points) + OpenCV Color Mapping</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-100/70 border border-ivory-300/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Layer</span>
            </div>
            <p className="text-[11px] text-charcoal-500">MongoDB for profiles, historical simulations, and saved looks</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-100/70 border border-ivory-300/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <Code className="w-4 h-4 text-lavender-600" />
              <span>Frontend Stack</span>
            </div>
            <p className="text-[11px] text-charcoal-500">React.js + Tailwind CSS v3 + React Router + Axios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
