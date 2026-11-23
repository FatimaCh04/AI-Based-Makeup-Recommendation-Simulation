import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2, Check, RefreshCw, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';

function LotusLogo({ className = "w-8 h-8 text-[#B92F60]" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 5C16.2 10.5 14.5 17 18 25C21.5 17 19.8 10.5 18 5Z" />
      <path d="M16.5 14C11.5 13 7.5 16.5 8.8 21C12 24.2 16 24.5 18 25" />
      <path d="M19.5 14C24.5 13 28.5 16.5 27.2 21C24 24.2 20 24.5 18 25" />
      <path d="M13.5 20.5C8 19.5 4.5 22.8 6.5 26.5C11 28.5 15.5 26.2 18 25" />
      <path d="M22.5 20.5C28 19.5 31.5 22.8 29.5 26.5C25 28.5 20.5 26.2 18 25" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step 1: Request Code, Step 2: Enter Code & New Password, Step 3: Success
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Password constraints validation
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^()_\-+=\[\]{}|;:,.<>\/~`]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;

  // Step 1: Request Reset Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSuccessMsg(res.data.message || 'Verification code sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must satisfy all security requirements (8+ characters, letters, numbers, symbols).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: newPassword
      });
      setSuccessMsg(res.data.message || 'Password reset successfully!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setError('');
    setResending(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSuccessMsg(res.data.message || 'A new reset code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F4] font-sans text-[#30232A] relative overflow-hidden flex flex-col justify-between selection:bg-[#F8DCE5] selection:text-[#B92F60]">

      {/* Decorative Organic Waves */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <svg className="absolute -top-16 -left-16 w-[480px] h-[480px] text-[#F8D7E3]/60 opacity-80" viewBox="0 0 500 500" fill="none">
          <path d="M0 0 C150 80 280 20 380 180 C440 280 340 400 280 480 C160 420 50 320 0 200 Z" fill="currentColor" />
        </svg>

        <svg className="absolute -bottom-20 -left-20 w-[520px] h-[520px] text-[#F4C5D5]/40 opacity-70" viewBox="0 0 500 500" fill="none">
          <path d="M0 500 C180 480 320 420 400 280 C360 160 220 180 140 260 C60 340 20 420 0 500 Z" fill="currentColor" />
        </svg>

        <svg className="absolute -bottom-24 -right-24 w-[600px] h-[500px] text-[#F8D7E3]/50 opacity-75" viewBox="0 0 600 500" fill="none">
          <path d="M600 500 C450 480 320 420 250 320 C180 220 280 120 400 80 C500 50 560 10 600 0 Z" fill="currentColor" />
        </svg>

        <span className="absolute top-28 left-[22%] text-[#B92F60]/30 text-lg select-none">✧</span>
        <span className="absolute top-44 left-[14%] text-[#B92F60]/20 text-sm select-none">✦</span>
        <span className="absolute bottom-32 left-[8%] text-[#B92F60]/35 text-xl select-none">✦</span>
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-12 pt-8 sm:pt-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <LotusLogo className="w-8 h-8 text-[#B92F60] transition-transform duration-300 group-hover:scale-105" />
          <span className="text-base sm:text-lg font-serif font-bold tracking-widest text-[#30232A]">
            AI GLAM
          </span>
        </Link>

        <Link
          to="/login"
          className="text-xs sm:text-sm font-semibold text-[#B92F60] hover:text-[#962852] underline underline-offset-4 decoration-[#B92F60]/40 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-12 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Column: Editorial Headline & Bullet Points */}
          <div className="lg:col-span-6 space-y-7">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-normal text-[#30232A] leading-[1.12] tracking-tight">
                Account<br />
                Security &amp;<br />
                <span className="font-serif italic font-normal text-[#B92F60]">
                  recovery.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[#5D5663] pt-1 max-w-md">
                Reset your password securely with a direct verification code sent to your registered email.
              </p>
            </div>

            <div className="w-12 h-[1.5px] bg-[#B92F60]/30" />

            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#FCE4EC] text-[#B92F60] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#42373B]">
                  Instant 6-digit email OTP protection
                </span>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#FCE4EC] text-[#B92F60] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#42373B]">
                  All saved looks &amp; shades remain safe
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean White Form Area */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(185,47,96,0.08)] border border-[#F8D7E3]/60 space-y-5">

              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#30232A]">
                      Reset Password
                    </h2>
                    <p className="text-xs sm:text-sm text-[#756D7B]">
                      Enter your registered email address.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#42373B]">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#756D7B]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#F8D7E3] text-xs sm:text-sm text-[#30232A] placeholder:text-[#918898] focus:outline-none focus:ring-2 focus:ring-[#B92F60]/20 focus:border-[#B92F60] transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#B92F60]/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#30232A]">
                      Set New Password
                    </h2>
                    <p className="text-xs sm:text-sm text-[#756D7B]">
                      Code sent to <span className="font-semibold text-[#B92F60]">{email}</span>.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-700">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#42373B]">6-Digit Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="• • • • • •"
                        className="w-full text-center tracking-[10px] font-mono text-lg py-2 rounded-2xl bg-white border border-[#F8D7E3] text-[#30232A] font-bold focus:outline-none focus:ring-2 focus:ring-[#B92F60]/20 focus:border-[#B92F60] transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#42373B]">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#756D7B]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 chars"
                          className="w-full pl-10 pr-11 py-2 rounded-2xl bg-white border border-[#F8D7E3] text-xs sm:text-sm text-[#30232A] placeholder:text-[#918898] focus:outline-none focus:ring-2 focus:ring-[#B92F60]/20 focus:border-[#B92F60] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756D7B]/60 hover:text-[#B92F60] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#42373B]">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#756D7B]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-11 py-2 rounded-2xl bg-white border border-[#F8D7E3] text-xs sm:text-sm text-[#30232A] placeholder:text-[#918898] focus:outline-none focus:ring-2 focus:ring-[#B92F60]/20 focus:border-[#B92F60] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756D7B]/60 hover:text-[#B92F60] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#756D7B]">
                      <div className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 ${hasMinLength ? 'text-[#B92F60]' : 'text-[#756D7B]/40'}`} />
                        <span>8+ chars with letters, numbers, and symbols</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6 || !isPasswordValid || newPassword !== confirmPassword}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#B92F60]/20 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <span>Reset Password</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(''); }}
                        className="text-xs text-[#756D7B] hover:text-[#B92F60] transition-colors"
                      >
                        Change email
                      </button>

                      <button
                        type="button"
                        disabled={resending}
                        onClick={handleResendCode}
                        className="text-xs font-semibold text-[#B92F60] hover:text-[#962852] flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                        <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#FCE4EC] text-[#B92F60] flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-normal text-[#30232A]">Password Reset Successful!</h3>
                    <p className="text-xs text-[#756D7B] mt-1">
                      Your password has been updated. You can now log in with your new credentials.
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#B92F60]/20"
                  >
                    <span>Proceed to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <div className="pt-2 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#F8D7E3] w-full" />
                  <span className="bg-white px-3 text-[11px] text-[#756D7B] whitespace-nowrap">
                    Remembered password?{' '}
                    <Link to="/login" className="font-semibold text-[#B92F60] hover:text-[#962852] underline underline-offset-2">
                      Log In
                    </Link>
                  </span>
                  <div className="border-t border-[#F8D7E3] w-full" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Bottom Editorial Tagline */}
      <footer className="relative z-10 w-full py-6 text-center">
        <div className="inline-flex flex-col items-center gap-1">
          <span className="font-serif italic text-sm sm:text-base text-[#B92F60]">
            More than makeup
          </span>
          <div className="flex items-center gap-2">
            <span className="w-6 h-[1px] bg-[#B92F60]/30" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#756D7B] font-medium">
              IT'S YOU
            </span>
            <span className="w-6 h-[1px] bg-[#B92F60]/30" />
          </div>
        </div>
      </footer>

    </div>
  );
}
