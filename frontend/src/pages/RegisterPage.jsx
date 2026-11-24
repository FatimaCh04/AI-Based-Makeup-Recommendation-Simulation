import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2, Check, KeyRound, RefreshCw, Palette, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

function LotusIcon({ className = "w-6 h-6 text-white" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 5C16.2 10.5 14.5 17 18 25C21.5 17 19.8 10.5 18 5Z" />
      <path d="M16.5 14C11.5 13 7.5 16.5 8.8 21C12 24.2 16 24.5 18 25" />
      <path d="M19.5 14C24.5 13 28.5 16.5 27.2 21C24 24.2 20 24.5 18 25" />
      <path d="M13.5 20.5C8 19.5 4.5 22.8 6.5 26.5C11 28.5 15.5 26.2 18 25" />
      <path d="M22.5 20.5C28 19.5 31.5 22.8 29.5 26.5C25 28.5 20.5 26.2 18 25" />
    </svg>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();

  // Step state: 1 = Register Form, 2 = OTP Verification
  const [step, setStep] = useState(1);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Password constraint checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&#^()_\-+=\[\]{}|;:,.<>\/~`]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;

  // Phone constraint check (10 to 15 digits)
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
  const isPhoneValid = /^\+?[0-9]{10,15}$/.test(cleanedPhone);

  // Email constraint check
  const isEmailValid = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim());

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setResendSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || !isPhoneValid) {
      setError('Phone number must be 10 to 15 digits (e.g. 03001234567).');
      return;
    }
    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!hasLetter) {
      setError('Password must contain at least one letter.');
      return;
    }
    if (!hasNumber) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!hasSpecial) {
      setError('Password must contain at least one special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(name.trim(), email.trim().toLowerCase(), cleanedPhone, password);
      if (res?.dev_code) {
        setDevCode(res.dev_code);
      }
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to send verification code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      // After registration → capture photo first, then analysis, then event selection
      navigate('/capture', { replace: true });
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid or expired verification code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setResendSuccess('');
    setResending(true);
    try {
      const res = await apiClient.post('/auth/resend-otp', { email: email.trim().toLowerCase() });
      if (res.data?.dev_code) {
        setDevCode(res.data.dev_code);
      }
      setResendSuccess(res.data.message || 'New verification code sent to your email!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF1F5] flex items-center justify-center p-3 sm:p-6 font-sans text-[#30232A] relative overflow-hidden">
      {/* Background blobs — hidden on small screens */}
      <div className="hidden sm:block absolute -top-28 -left-28 w-96 h-96 rounded-full bg-gradient-to-br from-[#B92F60]/20 to-[#F8DCE5]/60 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="hidden sm:block absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-gradient-to-tr from-[#C94D78]/25 to-[#FFF1F5] blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '3.5s' }} />

      {/* Main Card Container */}
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl border border-[#F8DCE5] shadow-[0_20px_50px_rgba(185,47,96,0.12)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">

        {/* Left Form Area */}
        <div className="md:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
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

            {step === 2 ? (
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="text-xs font-semibold text-[#30232A]/60 hover:text-[#B92F60] flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-full hover:bg-[#FFF1F5]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            ) : (
              <Link
                to="/"
                className="text-xs font-semibold text-[#30232A]/60 hover:text-[#B92F60] flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-full hover:bg-[#FFF1F5]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#30232A] tracking-tight">
                    Create Your Account
                  </h2>
                  <p className="text-xs sm:text-sm text-[#30232A]/70 mt-1">
                    Your next favorite look starts here.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-3">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#30232A]/80">Full Name</label>
                    <div className="relative group">
                      <User className="w-4 h-4 text-[#30232A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#B92F60]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs sm:text-sm text-[#30232A] focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#30232A]/80">Email Address</label>
                      <div className="relative group">
                        <Mail className="w-4 h-4 text-[#30232A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#B92F60]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs sm:text-sm text-[#30232A] focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#30232A]/80">Phone Number</label>
                      <div className="relative group">
                        <Phone className="w-4 h-4 text-[#30232A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#B92F60]" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="03001234567"
                          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs sm:text-sm text-[#30232A] focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#30232A]/80">Password</label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-[#30232A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#B92F60]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 chars"
                        className="w-full pl-10 pr-11 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs sm:text-sm text-[#30232A] focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#30232A]/40 hover:text-[#B92F60] transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Criteria checklist */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${hasMinLength ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' : 'bg-[#FFF1F5] border-[#F8DCE5] text-[#30232A]/60'}`}>
                        <Check className="w-3 h-3" /> 8+ Chars
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${hasLetter ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' : 'bg-[#FFF1F5] border-[#F8DCE5] text-[#30232A]/60'}`}>
                        <Check className="w-3 h-3" /> Letters
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${hasNumber ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' : 'bg-[#FFF1F5] border-[#F8DCE5] text-[#30232A]/60'}`}>
                        <Check className="w-3 h-3" /> Numbers
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${hasSpecial ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' : 'bg-[#FFF1F5] border-[#F8DCE5] text-[#30232A]/60'}`}>
                        <Check className="w-3 h-3" /> Symbol
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#30232A]/80">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="w-4 h-4 text-[#30232A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#B92F60]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-10 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs sm:text-sm text-[#30232A] focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#B92F60]/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Step 2: OTP Verification */
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F5] border border-[#F8DCE5] text-[#B92F60] text-xs font-bold mb-2">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Email Verification</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#30232A]">
                    Enter 6-Digit Code
                  </h2>
                  <p className="text-xs sm:text-sm text-[#30232A]/70 mt-1">
                    Code sent to <span className="font-semibold text-[#B92F60]">{email}</span>.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {resendSuccess && (
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-700">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                    <span>{resendSuccess}</span>
                  </div>
                )}

                {devCode && (
                  <div className="flex items-center justify-between bg-pink-50/80 border border-[#B92F60]/20 rounded-2xl p-2.5 px-3.5 text-xs text-[#30232A]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#B92F60] font-semibold">Verification Code:</span>
                      <span className="font-mono font-bold tracking-widest text-[#B92F60] text-sm bg-white px-2 py-0.5 rounded-lg border border-[#F8DCE5]">{devCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(devCode)}
                      className="text-xs font-bold text-[#B92F60] hover:text-[#C94D78] underline cursor-pointer"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#30232A]/80">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[12px] font-mono text-xl py-3 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-[#30232A] font-bold focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-[#B92F60]/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Complete Registration</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); }}
                      className="text-xs text-[#30232A]/70 hover:text-[#B92F60] transition-colors"
                    >
                      Wrong email? Edit details
                    </button>

                    <button
                      type="button"
                      disabled={resending}
                      onClick={handleResendOtp}
                      className="text-xs font-semibold text-[#B92F60] hover:text-[#962852] flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                      <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-[#30232A]/70 pt-2 border-t border-[#F8DCE5]/70">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#B92F60] hover:text-[#962852] hover:underline">
              Log In
            </Link>
          </div>
        </div>

        {/* Right Panel (col-span-5) - NO PHOTO, matching the reference typography & bullets */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#962852] via-[#B92F60] to-[#C94D78] p-8 sm:p-10 flex-col justify-between text-white relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/15 rounded-full blur-xl pointer-events-none" />

          {/* Top Logo emblem */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <LotusIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-serif font-bold tracking-widest text-white leading-none">AI GLAM</span>
              <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-0.5">Studio</span>
            </div>
          </div>

          {/* Center Editorial Headline & Bullets */}
          <div className="relative z-10 my-auto py-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-normal text-white leading-tight">
                Your beauty.<br />
                Your <span className="italic font-serif text-rose-200">signature.</span>
              </h3>
              <p className="text-xs text-white/85 leading-relaxed">
                Create your personal beauty profile and explore makeup recommendations made around you.
              </p>
            </div>

            <div className="w-10 h-[1.5px] bg-white/30" />

            {/* 3 Circular Icon Bullets */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 border border-white/25">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-white/95 font-medium leading-tight">
                  Discover personalized makeup looks.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 border border-white/25">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-white/95 font-medium leading-tight">
                  Explore alternative lipstick and eyeshadow shades.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 border border-white/25">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-white/95 font-medium leading-tight">
                  Save your favorite looks and access your skin guide.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Editorial Tagline */}
          <div className="relative z-10 pt-3 border-t border-white/20 text-center">
            <span className="font-serif italic text-sm text-rose-200 block">
              More than makeup
            </span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="w-5 h-[1px] bg-white/30" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-white/80 font-medium">
                IT'S YOU
              </span>
              <span className="w-5 h-[1px] bg-white/30" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
