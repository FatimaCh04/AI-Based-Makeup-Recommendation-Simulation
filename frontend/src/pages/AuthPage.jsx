import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [email, setEmail] = useState('aliza.naeem@example.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Aliza Naeem');

  useEffect(() => {
    setIsRegister(location.pathname === '/register');
  }, [location.pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login and navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Auth Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-soft-lg border border-dustyrose-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left Form Area (7 cols on md) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          
          {/* Logo Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-dustyrose-500 to-mauve-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-charcoal-900 leading-none">AI Glam</span>
                <span className="text-[10px] text-dustyrose-600 font-semibold tracking-wider uppercase">Makeup Studio</span>
              </div>
            </Link>

            <Link to="/" className="text-xs font-semibold text-charcoal-500 hover:text-dustyrose-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
                {isRegister ? "Create Your Account ✨" : "Welcome Back! 👋"}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
                {isRegister 
                  ? "Register to access alternative lipstick/eyeshadow shades and personalized skincare guidance" 
                  : "Login to access your saved looks, beauty profile, and studio history"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-charcoal-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-ivory-50 border border-dustyrose-200 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-dustyrose-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-ivory-50 border border-dustyrose-200 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-dustyrose-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-charcoal-700">Password</label>
                  {!isRegister && (
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link will be sent to your registered email (Demo)."); }} className="text-[11px] font-medium text-dustyrose-600 hover:text-dustyrose-700">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-ivory-50 border border-dustyrose-200 text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-dustyrose-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-dustyrose-500 to-mauve-500 hover:from-dustyrose-600 hover:to-mauve-600 text-white text-xs sm:text-sm font-bold shadow-rose-glow hover:shadow-lg transition-all active:scale-98"
              >
                {isRegister ? "Create Account" : "Login"}
              </button>
            </form>

            {/* Social Logins */}
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-dustyrose-100 w-full" />
                <span className="bg-white px-3 text-[11px] text-charcoal-400 uppercase font-semibold absolute">
                  or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-dustyrose-200 hover:bg-dustyrose-50 text-xs font-medium text-charcoal-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-dustyrose-200 hover:bg-dustyrose-50 text-xs font-medium text-charcoal-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>

          {/* Toggle Register / Login */}
          <div className="text-center text-xs text-charcoal-500 pt-2">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-dustyrose-600 hover:underline"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-dustyrose-600 hover:underline"
                >
                  Create Your Account
                </button>
              </>
            )}
          </div>

        </div>

        {/* Right Visual Area (5 cols on md) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-dustyrose-400 via-mauve-500 to-dustyrose-600 p-8 flex-col justify-between text-white relative overflow-hidden">
          {/* Ambient background styling */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Quote */}
          <div className="relative z-10">
            <span className="text-xs uppercase tracking-widest text-dustyrose-100 font-semibold">AI Beauty Tech</span>
            <h3 className="text-2xl font-extrabold mt-2 leading-tight">
              Enhance Your Beauty with the power of AI
            </h3>
          </div>

          {/* Cosmetics photo illustration */}
          <div className="relative z-10 my-auto py-6">
            <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30">
              <img
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80"
                alt="Cosmetics brushes"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-dustyrose-100 flex items-center justify-between">
            <span>Powered by Computer Vision</span>
            <span>Virtual Simulation</span>
          </div>

        </div>

      </div>

    </div>
  );
}
