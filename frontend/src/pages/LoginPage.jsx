import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import modelMerged from '../assets/login-model-merged.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F4] flex items-center justify-center p-4 sm:p-6 font-sans text-[#30232A] relative overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#B92F60]/20 to-[#F8DCE5]/60 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tr from-[#C94D78]/25 to-[#FFF1F5] blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F8DCE5]/30 blur-[100px] pointer-events-none" />

      {/* Main Luxury Card Container */}
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl border border-[#F8DCE5] shadow-[0_20px_50px_rgba(185,47,96,0.10)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px] relative z-10">

        {/* Left Form Area (col-span-7) */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#B92F60] via-[#C94D78] to-[#E86A92] flex items-center justify-center text-white shadow-md shadow-[#B92F60]/20 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#30232A] leading-none">AI GLAM</span>
                <span className="text-[10px] text-[#B92F60] font-bold tracking-widest uppercase mt-0.5">Studio</span>
              </div>
            </Link>
            <Link
              to="/"
              className="text-xs font-semibold text-[#30232A]/60 hover:text-[#B92F60] flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-full hover:bg-[#FFF0F4]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Content */}
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#30232A] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-[#30232A]/70 mt-1">
                Sign in to discover your personal beauty profile.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#30232A]/80">Email Address</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-[#30232A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#B92F60]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF0F4]/70 border border-[#F8DCE5] text-xs sm:text-sm text-[#30232A] focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#30232A]/80">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#B92F60] hover:text-[#962852] transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-[#30232A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#B92F60]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-[#FFF0F4]/70 border border-[#F8DCE5] text-xs sm:text-sm text-[#30232A] focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#30232A]/40 hover:text-[#B92F60] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#30232A]/70">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#F8DCE5] text-[#B92F60] focus:ring-[#B92F60]/30 accent-[#B92F60]"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#B92F60]/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Switch */}
          <div className="text-center text-xs text-[#30232A]/70 pt-2 border-t border-[#F8DCE5]/70">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-[#B92F60] hover:text-[#962852] hover:underline"
            >
              Create an Account
            </Link>
          </div>
        </div>

        {/* Right Panel (col-span-5) - Seamlessly Merged Picture with zero rectangular borders */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#FFF0F4] via-[#FCE4EC]/40 to-[#FFF0F4] p-6 sm:p-8 flex-col justify-between items-center relative overflow-hidden select-none border-l border-[#F8DCE5]/70">
          {/* Ambient glowing blush behind illustration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#E86A92]/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

          {/* Top subtle badge */}
          <div className="relative z-10 w-full flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#B92F60] font-bold bg-white/90 px-3 py-1 rounded-full shadow-2xs border border-[#F8DCE5]">
              AI Beauty Studio
            </span>
            <span className="text-xs text-[#B92F60] font-serif font-bold tracking-wider">AI GLAM</span>
          </div>

          {/* Seamlessly Merged Illustration - NO square box, completely dissolved edges */}
          <div className="relative z-10 my-auto w-full flex items-center justify-center p-2">
            <img
              src={modelMerged}
              alt="Better Makeup Better You"
              className="w-full max-w-[340px] h-auto object-contain drop-shadow-[0_12px_28px_rgba(185,47,96,0.12)] transition-transform duration-500 hover:scale-103"
            />
          </div>

          {/* Bottom Tagline */}
          <div className="relative z-10 w-full pt-3 border-t border-[#F8DCE5]/70 flex items-center justify-between text-[11px] text-[#756D7B]">
            <span className="flex items-center gap-1.5 font-medium text-[#30232A]">
              <Sparkles className="w-3.5 h-3.5 text-[#B92F60]" />
              Virtual Simulation
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#B92F60] font-bold">
              Personalized
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
