import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareHeart, Star, Loader2, CheckCircle2,
  AlertCircle, ArrowLeft, Send, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const FEEDBACK_TYPES = ['Review', 'Complaint', 'Suggestion', 'Bug Report', 'Other'];

const TYPE_META = {
  Review:     { emoji: '⭐', desc: 'Share your experience with AI GLAM' },
  Complaint:  { emoji: '🚨', desc: 'Report an issue or bad experience' },
  Suggestion: { emoji: '💡', desc: 'Suggest a new feature or improvement' },
  'Bug Report': { emoji: '🐛', desc: 'Report a technical problem or error' },
  Other:      { emoji: '✉️',  desc: 'Anything else you want to share' },
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pre-fill for registered users
  const [name,         setName]         = useState(user?.name  || '');
  const [email,        setEmail]        = useState(user?.email || '');
  const [feedbackType, setFeedbackType] = useState('');
  const [subject,      setSubject]      = useState('');
  const [message,      setMessage]      = useState('');
  const [rating,       setRating]       = useState(0);
  const [hoveredStar,  setHoveredStar]  = useState(0);

  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [errMsg,  setErrMsg]  = useState('');

  const isRegistered = !!user;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrMsg('');

    // Client-side guard
    if (!name.trim())         return setErrMsg('Please enter your name.');
    if (!email.trim())        return setErrMsg('Please enter your email address.');
    if (!feedbackType)        return setErrMsg('Please select a feedback type.');
    if (!subject.trim())      return setErrMsg('Please enter a subject.');
    if (message.trim().length < 10)
      return setErrMsg('Message must be at least 10 characters.');

    setStatus('loading');
    try {
      await apiClient.post('/feedback/submit', {
        name:          name.trim(),
        email:         email.trim().toLowerCase(),
        feedback_type: feedbackType,
        subject:       subject.trim(),
        message:       message.trim(),
        rating,
      });
      setStatus('success');
    } catch (err) {
      setErrMsg(
        err.response?.data?.error ||
        'Could not send your feedback. Please try again.'
      );
      setStatus('error');
    }
  }

  function handleReset() {
    setFeedbackType('');
    setSubject('');
    setMessage('');
    setRating(0);
    setErrMsg('');
    setStatus('idle');
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto pb-12 font-sans text-[#30232A]">
        <div className="mt-8 bg-white rounded-3xl border border-[#F8DCE5] shadow-xs p-10 flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-serif font-bold text-[#30232A]">
              Thank You for Your Feedback!
            </h2>
            <p className="text-sm text-[#30232A]/60 max-w-sm">
              Your message has been successfully sent. We appreciate your help in improving AI GLAM.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] text-[#B92F60] text-xs font-bold hover:bg-[#F8DCE5] transition-colors"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-2xl bg-[#B92F60] text-white text-xs font-bold hover:bg-[#C94D78] transition-colors shadow-xs"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans text-[#30232A]">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-white border border-[#F8DCE5] text-[#30232A] hover:bg-[#FFF1F5] hover:text-[#B92F60] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#30232A]">
            We'd Love to Hear From You!
          </h1>
          <p className="text-xs text-[#30232A]/60 mt-0.5 max-w-md">
            Share your experience, report a problem, or suggest something that can help us improve AI GLAM.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-[#F8DCE5] shadow-xs p-6 sm:p-8 space-y-5">

        {/* Icon + title row */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#F8DCE5]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B92F60] to-[#C94D78] flex items-center justify-center shadow-xs">
            <MessageSquareHeart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#30232A]">Feedback &amp; Support</p>
            <p className="text-[11px] text-[#30232A]/50">
              {isRegistered
                ? `Submitting as ${user.name}`
                : 'Guest submission — your email is required for follow-up'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Name + Email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#30232A]/80">
                Your Name <span className="text-[#B92F60]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                disabled={isRegistered}
                required
                className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs text-[#30232A] placeholder-[#30232A]/30 focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#30232A]/80">
                Email Address <span className="text-[#B92F60]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isRegistered}
                required
                className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs text-[#30232A] placeholder-[#30232A]/30 focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Feedback type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#30232A]/80">
              Feedback Type <span className="text-[#B92F60]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FEEDBACK_TYPES.map(type => {
                const { emoji } = TYPE_META[type];
                const isSelected = feedbackType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFeedbackType(type)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-xs font-semibold transition-all min-h-[44px] ${
                      isSelected
                        ? 'bg-[#B92F60] text-white border-[#B92F60] shadow-xs'
                        : 'bg-[#FFF1F5]/60 border-[#F8DCE5] text-[#30232A]/70 hover:border-[#B92F60]/40 hover:bg-[#FFF1F5]'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
            {feedbackType && (
              <p className="text-[11px] text-[#30232A]/50 pl-1">
                {TYPE_META[feedbackType].desc}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#30232A]/80">
              Subject <span className="text-[#B92F60]">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief subject of your feedback"
              maxLength={200}
              required
              className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs text-[#30232A] placeholder-[#30232A]/30 focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
            />
          </div>

          {/* Message */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#30232A]/80">
              Your Message <span className="text-[#B92F60]">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your feedback, complaint, or suggestion in detail..."
              rows={5}
              maxLength={5000}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF1F5]/70 border border-[#F8DCE5] text-xs text-[#30232A] placeholder-[#30232A]/30 resize-none focus:outline-none focus:ring-4 focus:ring-[#B92F60]/15 focus:border-[#B92F60] focus:bg-white transition-all"
            />
            <p className="text-[10px] text-[#30232A]/40 text-right">
              {message.length} / 5000
            </p>
          </div>

          {/* Star rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#30232A]/80">
              Overall Rating{' '}
              <span className="font-normal text-[#30232A]/40">(Optional)</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= (hoveredStar || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(prev => prev === star ? 0 : star)}
                    className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className="w-6 h-6 transition-colors"
                      style={{
                        fill:   filled ? '#B92F60' : 'transparent',
                        stroke: filled ? '#B92F60' : '#D1A0B0',
                      }}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="text-xs text-[#B92F60] font-semibold ml-2">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {(status === 'error' || errMsg) && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errMsg}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#B92F60] via-[#C94D78] to-[#B92F60] hover:opacity-95 text-white text-sm font-bold shadow-md shadow-[#B92F60]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Feedback...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>

        </form>
      </div>

      {/* Privacy note */}
      <p className="text-center text-[11px] text-[#30232A]/40">
        Your feedback is sent directly to the AI GLAM team. We never share your personal information.
      </p>
    </div>
  );
}
