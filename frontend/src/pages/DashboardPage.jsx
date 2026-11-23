import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, PlusCircle, Bookmark, Trash2, Eye, Droplets,
  AlertCircle, ArrowRight, UserCheck,
  RefreshCw, Heart, ScanFace, Calendar, CheckCircle2,
  Layers, Clock, Gem, Briefcase, PartyPopper, Sun,
  ChevronRight, Activity, Camera, Zap, Copy, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import dashModel from '../assets/dashboard-girl.png';
import SavedLookThumbnail from '../components/SavedLookThumbnail';

/* ─── Skin guide data ───────────────────────────────────────────────────────── */
const SKIN_GUIDE = {
  Oily:        { c:'#0369A1', bg:'#F0F9FF', b:'#BAE6FD', tips:['Use oil-free, matte-finish primer','Apply translucent powder on T-zone','Choose gel-based moisturiser before makeup'] },
  Dry:         { c:'#D97706', bg:'#FFFBEB', b:'#FDE68A', tips:['Hydrate with a rich serum first','Use a dewy or satin-finish foundation','Set with hydrating fixing mist'] },
  Combination: { c:'#7C3AED', bg:'#F5F3FF', b:'#EDE9FE', tips:['Use pore-blurring primer on T-zone only','Blend foundation with a damp sponge','Set oily areas with loose powder'] },
  Normal:      { c:'#B92F60', bg:'#FFF1F5', b:'#F8DCE5', tips:['Apply lightweight hydrating toner first','Use satin-finish foundation','Set with a dewy fixing mist'] },
};

function EvtIcon({ event = '' }) {
  const e = event.toLowerCase();
  if (e.includes('wedding')) return <Gem className="w-3 h-3" />;
  if (e.includes('party'))   return <PartyPopper className="w-3 h-3" />;
  if (e.includes('office'))  return <Briefcase className="w-3 h-3" />;
  return <Sun className="w-3 h-3" />;
}

/* ─── Stat card ─────────────────────────────────────────────────────────────── */
function Stat({ icon: Icon, label, value, sub, c, bg, b, onClick }) {
  return (
    <button onClick={onClick}
      className="group bg-white rounded-2xl border p-3.5 shadow-sm flex items-center gap-3 text-left hover:shadow-md hover:-translate-y-0.5 transition-all min-w-0"
      style={{ borderColor: b }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color: c }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#30232A]/50 font-medium leading-none mb-0.5">{label}</p>
        <p className="text-sm sm:text-base font-black text-[#30232A] leading-tight break-words">{value}</p>
        {sub && <p className="text-[10px] text-[#30232A]/40 mt-0.5 break-words leading-snug">{sub}</p>}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-[#30232A]/20 group-hover:text-[#B92F60] flex-shrink-0 transition-colors" />
    </button>
  );
}

/* ─── Quick action tile ─────────────────────────────────────────────────────── */
function QA({ icon: Icon, label, sub, onClick, c = '#B92F60', bg = '#FFF1F5' }) {
  return (
    <button onClick={onClick}
      className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-[#F8DCE5] hover:border-[#B92F60]/40 hover:bg-[#FFF9FB] transition-all text-center">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ background: bg }}>
        <Icon className="w-4.5 h-4.5" style={{ color: c }} />
      </div>
      <p className="text-[10px] font-bold text-[#30232A] group-hover:text-[#B92F60] transition-colors leading-tight whitespace-pre-line">{label}</p>
      {sub && <p className="text-[9px] text-[#30232A]/40 leading-tight">{sub}</p>}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedLooks,    setSavedLooks]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [showSkinModal, setShowSkinModal] = useState(false);
  const [deleteModal,   setDeleteModal]   = useState(null); // stores look id to delete

  const fetchSavedLooks = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await apiClient.get('/user/saved-looks');
      if (r.data?.looks) setSavedLooks(r.data.looks);
    } catch { setError('Unable to load saved looks.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSavedLooks(); }, [fetchSavedLooks]);

  const handleDelete = async (id) => {
    // Open styled modal instead of browser confirm
    setDeleteModal(id);
  };

  const confirmDelete = async () => {
    const id = deleteModal;
    setDeleteModal(null);
    try {
      await apiClient.delete(`/user/saved-looks/${id}`);
      setSavedLooks(p => p.filter(l => l.id !== id));
    } catch { alert('Could not delete. Try again.'); }
  };

  const handleView = (look) => {
    const baseImg = look.original_image || look.thumbnail;
    if (baseImg)        sessionStorage.setItem('glamai_guest_image',    baseImg);
    if (look.event)     sessionStorage.setItem('glamai_guest_occasion', look.event);
    if (look.analysis)  sessionStorage.setItem('glamai_guest_analysis', JSON.stringify(look.analysis));
    if (look.shades)    sessionStorage.setItem('glamai_guest_palette',  JSON.stringify({ shades: look.shades }));
    navigate('/result');
  };

  /* ── Derived ─────────────────────────────────────────────────────────────── */
  const name     = user?.name || 'Beauty Enthusiast';
  const first    = name.split(' ')[0];
  const profile  = user?.beauty_profile || (() => {
    const s = sessionStorage.getItem('glamai_guest_analysis');
    if (s) try { return JSON.parse(s); } catch {}
    return null;
  })();
  const total        = savedLooks.length;
  const lastDate     = savedLooks[0]?.date || null;
  const recent       = savedLooks.slice(0, 2);
  const guide        = profile?.skin_type ? (SKIN_GUIDE[profile.skin_type] || SKIN_GUIDE.Normal) : null;

  /* activity — real data only */
  const acts = [];
  if (profile) acts.push({ dot: '#7C3AED', text: 'Face analysis completed.',      time: 'Last analysis' });
  savedLooks.slice(0, 2).forEach(l => acts.push({ dot: '#B92F60', text: `${l.event || 'Custom'} makeup look generated.`, time: l.date || '' }));
  if (savedLooks.length) acts.push({ dot: '#059669', text: 'A makeup look saved.', time: savedLooks.at(-1)?.date || '' });
  if (!acts.length)       acts.push({ dot: '#CBD5E1', text: 'No activity yet. Create your first look!', time: '' });

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4 pb-16 font-sans text-[#30232A]">

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER
         ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl shadow-sm" style={{ background: 'linear-gradient(135deg, #FFD6E7 0%, #FFF1F5 35%, #FFE4EF 65%, #FDDDE9 100%)' }}>

        {/* Soft blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,#F8A4C2 0%,transparent 70%)' }} />
        <div className="absolute -bottom-8 left-1/3 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: 'radial-gradient(circle,#FBBCD4 0%,transparent 70%)' }} />

        {/* Decorative hearts */}
        {[['top-5 right-[42%]','w-4 h-4','0.5'],['top-12 right-[30%]','w-3 h-3','0.35'],['bottom-6 right-[35%]','w-3 h-3','0.4']].map(([pos, sz, op], i) => (
          <svg key={i} className={`absolute ${pos} ${sz} pointer-events-none`} style={{ opacity: op }} viewBox="0 0 32 30" fill="none" stroke="#B92F60" strokeWidth="2.5">
            <path d="M16 27C16 27 3 18 3 10 C3 6 6 3 10 3 C13 3 15.5 5 16 7 C16.5 5 19 3 22 3 C26 3 29 6 29 10 C29 18 16 27 16 27Z" />
          </svg>
        ))}
        {/* Sparkle */}
        <svg className="absolute top-6 right-[38%] w-5 h-5 pointer-events-none" style={{ opacity: 0.6 }} viewBox="0 0 24 24" fill="#B92F60">
          <path d="M12 2L13.2 10.8L22 12L13.2 13.2L12 22L10.8 13.2L2 12L10.8 10.8Z" />
        </svg>
        {/* Brush stroke top-left */}
        <svg className="absolute left-6 top-5 w-18 h-7 pointer-events-none" style={{ opacity: 0.35 }} viewBox="0 0 90 28" fill="none">
          <path d="M3 20 C18 5 46 2 74 13 C82 17 88 20 86 14" stroke="#F4A7C0" strokeWidth="12" strokeLinecap="round" />
        </svg>

        <div className="relative flex items-stretch min-h-[210px] sm:min-h-[240px] lg:min-h-[260px]">

          {/* ── Left text ───────────────────────────────────────── */}
          <div className="flex-1 px-6 sm:px-8 py-6 flex flex-col justify-center gap-2.5" style={{ maxWidth: 'min(58%, 480px)' }}>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#B92F60] bg-white/60 px-2.5 py-1 rounded-full border border-[#F8DCE5] self-start">
              <Sparkles className="w-3 h-3" /> AI GLAM Beauty Studio
            </span>

            <h1 className="font-serif font-black text-[#30232A] leading-tight" style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.75rem)' }}>
              Your Beauty,<br /><span className="text-[#B92F60]">Your Style.</span>
            </h1>

            <p className="text-[11px] sm:text-xs text-[#30232A]/55 leading-relaxed max-w-[260px]">
              Discover personalized makeup recommendations designed around your unique beauty profile.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => navigate('/capture')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow-lg transition-all active:scale-[0.97] hover:opacity-95"
                style={{ background: 'linear-gradient(135deg,#B92F60,#C94D78)' }}>
                <PlusCircle className="w-3.5 h-3.5" /> Create New Look
              </button>
              <button onClick={() => navigate('/saved-looks')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/80 border border-[#F8DCE5] text-[#B92F60] text-xs font-bold hover:bg-white transition-all">
                <Bookmark className="w-3.5 h-3.5" /> Explore Saved Looks
              </button>
            </div>
          </div>

          {/* ── Right image ─────────────────────────────────────── */}
          <div className="absolute right-0 bottom-0 top-0 pointer-events-none select-none overflow-hidden"
               style={{ width: 'clamp(180px, 42%, 360px)' }}>

            {/* Gradient overlays — fade image edges into banner bg */}
            <div className="absolute inset-0 z-10 pointer-events-none"
                 style={{ background: 'linear-gradient(to right, #FFD6E7 0%, #FDDDE9 14%, transparent 42%)' }} />
            <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
                 style={{ height: '15%', background: 'linear-gradient(to bottom, #FFD6E7 0%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
                 style={{ height: '12%', background: 'linear-gradient(to top, #FFE4EF 0%, transparent 100%)' }} />
            <div className="absolute top-0 right-0 bottom-0 z-10 pointer-events-none"
                 style={{ width: '8%', background: 'linear-gradient(to left, #FDDDE9 0%, transparent 100%)' }} />

            {/*
              Key fix: use object-contain + object-top so the full portrait
              (face, hair, shoulders, upper body) is always visible.
              The image is portrait-ratio so contain + top keeps everything shown.
            */}
            <img
              src={dashModel}
              alt="AI GLAM Beauty Studio"
              className="absolute inset-0 w-full h-full"
              style={{
                objectFit: 'contain',
                objectPosition: 'center top',
              }}
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS ROW
         ══════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Sparkles} label="Total Looks Created" value={loading?'—':total}
              sub={`${total} look${total!==1?'s':''} created`}
              c="#B92F60" bg="#FFF1F5" b="#F8DCE5" onClick={()=>navigate('/capture')} />
        <Stat icon={Heart}    label="Saved Makeup Looks"  value={loading?'—':total}
              sub={lastDate?`Last: ${lastDate}`:'No looks yet'}
              c="#C94D78" bg="#FFF1F5" b="#F8DCE5" onClick={()=>navigate('/saved-looks')} />
        <Stat icon={ScanFace} label="Beauty Profile"      value={profile?'Complete':'Pending'}
              sub={profile?`${profile.skin_tone||''} · ${profile.undertone||''}`:'Run face analysis'}
              c={profile?'#059669':'#D97706'} bg={profile?'#ECFDF5':'#FFFBEB'} b={profile?'#A7F3D0':'#FDE68A'}
              onClick={()=>navigate('/profile')} />
        <Stat icon={Calendar} label="Last Analysis Date"  value={lastDate||(profile?'Done':'Never')}
              sub={profile?`${profile.face_shape||''} face shape`:'No analysis yet'}
              c="#0369A1" bg="#F0F9FF" b="#BAE6FD" onClick={()=>navigate('/capture')} />
      </section>

      {/* ══════════════════════════════════════════════════════════
          BEAUTY PROFILE  |  RECENT LOOKS
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ─ Beauty Profile ───────────────────────────────────── */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-[#F8DCE5] shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF1F5] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#B92F60]" />
              </div>
              <h2 className="text-sm font-bold text-[#30232A]">My Beauty Profile</h2>
            </div>
            <button onClick={()=>navigate('/profile')}
              className="text-[11px] font-semibold text-[#B92F60] hover:underline flex items-center gap-1">
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {profile ? (
            <div className="flex items-start gap-4">
              {/* Circular skin-tone swatch */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="relative">
                  <div className="w-[68px] h-[68px] rounded-full border-[3px] border-white shadow-lg ring-2 ring-[#F8DCE5]"
                       style={{ background: `radial-gradient(circle at 40% 35%, ${profile.skin_tone_hex ? profile.skin_tone_hex + 'CC' : '#E8B89A'}, ${profile.skin_tone_hex || '#D4916A'})` }} />
                  {/* Crown pin */}
                  <div className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#B92F60] to-[#C94D78] flex items-center justify-center shadow-sm border-2 border-white">
                    <span className="text-[9px] leading-none">👑</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-[#B92F60] uppercase tracking-wide mt-0.5">Skin Tone</span>
              </div>

              {/* Metrics */}
              <div className="flex-1 min-w-0 space-y-2">
                {[
                  { e:'🎨', l:'Skin Tone',  v: profile.skin_tone  },
                  { e:'💧', l:'Undertone',  v: profile.undertone  },
                  { e:'🌿', l:'Skin Type',  v: profile.skin_type  },
                  { e:'⬡',  l:'Face Shape', v: profile.face_shape },
                ].map(({ e, l, v }) => (
                  <div key={l} className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-center text-sm flex-shrink-0">{e}</span>
                    <span className="text-[#30232A]/50 flex-shrink-0">{l}:</span>
                    <span className="font-bold text-[#30232A] truncate">{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-7 rounded-2xl border border-dashed border-[#F8DCE5] bg-[#FFF9FB] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-[#F8DCE5] flex items-center justify-center mx-auto">
                <ScanFace className="w-6 h-6 text-[#B92F60]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#30232A]">Your Beauty Profile is waiting!</p>
                <p className="text-[11px] text-[#30232A]/55 mt-1 px-3 leading-relaxed max-w-[220px] mx-auto">
                  Complete face analysis to discover your skin tone, undertone &amp; face shape.
                </p>
              </div>
              <button onClick={()=>navigate('/capture')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-white text-xs font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg,#B92F60,#C94D78)' }}>
                <Camera className="w-3.5 h-3.5" /> Analyze Your Face
              </button>
            </div>
          )}
        </section>

        {/* ─ Recent Looks ─────────────────────────────────────── */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-[#F8DCE5] shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF1F5] flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-[#B92F60]" />
              </div>
              <h2 className="text-sm font-bold text-[#30232A]">Your Recent Makeup Looks</h2>
            </div>
            <button onClick={()=>navigate('/saved-looks')}
              className="text-[11px] font-semibold text-[#B92F60] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading && (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#30232A]/50">
              <RefreshCw className="w-4 h-4 animate-spin text-[#B92F60]" /> Loading…
            </div>
          )}
          {!loading && error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              <button onClick={fetchSavedLooks} className="ml-auto font-semibold">Retry</button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recent.map(look => (
                <div key={look.id}
                  className="group rounded-2xl border border-[#F8DCE5] overflow-hidden bg-[#FFF9FB] hover:shadow-md hover:border-[#B92F60]/30 transition-all">
                  {/* Thumbnail */}
                  <div className="relative bg-[#F8DCE5] overflow-hidden rounded-t-2xl" style={{ aspectRatio:'4/3' }}>
                    <SavedLookThumbnail look={look} />
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/90 text-[9px] font-bold text-[#B92F60]">
                      <EvtIcon event={look.event} />
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-2.5 space-y-1.5">
                    <p className="text-[11px] font-bold text-[#30232A] truncate">
                      {look.title||`${look.event||'Custom'} Look`}
                    </p>
                    {look.date && (
                      <p className="text-[10px] text-[#30232A]/40 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />{look.date}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button onClick={()=>handleView(look)} title="View"
                        className="p-1.5 rounded-lg bg-[#FFF1F5] hover:bg-[#F8DCE5] transition-colors">
                        <Eye className="w-3 h-3 text-[#B92F60]" />
                      </button>
                      <button onClick={()=>handleView(look)} title="Compare"
                        className="p-1.5 rounded-lg bg-[#FFF1F5] hover:bg-[#F8DCE5] transition-colors">
                        <Copy className="w-3 h-3 text-[#B92F60]" />
                      </button>
                      <button onClick={()=>handleDelete(look.id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-3 h-3 text-[#30232A]/35 hover:text-rose-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create More tile */}
              <button onClick={()=>navigate('/capture')}
                className="group rounded-2xl border-2 border-dashed border-[#F8DCE5] hover:border-[#B92F60]/50 bg-[#FFF9FB] hover:bg-[#FFF1F5] transition-all flex flex-col items-center justify-center gap-2 p-4"
                style={{ aspectRatio: recent.length === 0 ? '4/3' : '1/1', minHeight:'100px' }}>
                <div className="w-9 h-9 rounded-full bg-[#FFF1F5] border border-[#F8DCE5] group-hover:bg-[#F8DCE5] flex items-center justify-center transition-colors">
                  <PlusCircle className="w-4 h-4 text-[#B92F60]" />
                </div>
                <p className="text-[11px] font-bold text-[#B92F60] text-center leading-tight">
                  {recent.length===0 ? 'Create Your\nFirst Look' : 'Create More\nLooks'}
                </p>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════
          QUICK ACTIONS  |  SKIN CARE CORNER  |  RECENT ACTIVITY
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* ─ Quick Actions ────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#F8DCE5] shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFF1F5] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#B92F60]" />
            </div>
            <h2 className="text-sm font-bold text-[#30232A]">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <QA icon={Camera}    label={'Create\nNew Look'}     onClick={()=>navigate('/capture')}      c="#B92F60" bg="#FFF1F5" />
            <QA icon={Heart}     label={'View\nSaved Looks'}    onClick={()=>navigate('/saved-looks')}  c="#C94D78" bg="#FFF1F5" />
            <QA icon={Droplets}  label={'Explore\nSkin Guide'}  onClick={()=>setShowSkinModal(true)}    c="#0369A1" bg="#F0F9FF" />
            <QA icon={UserCheck} label={'View\nBeauty Profile'} onClick={()=>navigate('/profile')}      c="#7C3AED" bg="#F5F3FF" />
          </div>
        </section>

        {/* ─ Skin Care Corner ─────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#F8DCE5] shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                <span className="text-sm">🌿</span>
              </div>
              <h2 className="text-sm font-bold text-[#30232A]">Your Skin Care Corner</h2>
            </div>
            <button onClick={()=>setShowSkinModal(true)}
              className="text-[11px] font-semibold text-[#B92F60] hover:underline flex items-center gap-0.5 flex-shrink-0">
              Explore Skin Guide <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {guide ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                   style={{ background: guide.bg, color: guide.c, border:`1px solid ${guide.b}` }}>
                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                Your Skin Type: {profile.skin_type}
              </div>
              <p className="text-xs text-[#30232A]/60 leading-relaxed">
                Get personalized skincare tips for healthy and glowing skin.
              </p>
              <ul className="space-y-1.5">
                {guide.tips.slice(0,2).map((tip,i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-[#30232A]/70">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: guide.c }} />
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-[#30232A]/35 italic">General advice. Not a medical recommendation.</p>
            </div>
          ) : (
            <div className="py-5 rounded-2xl border border-dashed border-[#F8DCE5] bg-[#FFF9FB] text-center space-y-2.5">
              <p className="text-xs text-[#30232A]/55 px-3 leading-relaxed">
                Complete face analysis to unlock personalized skin tips.
              </p>
              <button onClick={()=>navigate('/capture')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#B92F60,#C94D78)' }}>
                <ScanFace className="w-3.5 h-3.5" /> Analyze Now
              </button>
            </div>
          )}
        </section>

        {/* ─ Recent Activity ──────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#F8DCE5] shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF1F5] flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-[#B92F60]" />
              </div>
              <h2 className="text-sm font-bold text-[#30232A]">Recent Activity</h2>
            </div>
            <button onClick={()=>navigate('/saved-looks')}
              className="text-[11px] font-semibold text-[#B92F60] hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-0.5">
            {acts.map((a,i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[#F8F0F2]/70 last:border-0">
                <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.dot }} />
                <p className="flex-1 text-[11px] text-[#30232A]/75 leading-snug">{a.text}</p>
                {a.time && <p className="text-[10px] text-[#30232A]/35 whitespace-nowrap flex-shrink-0">{a.time}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SKIN GUIDE MODAL
         ══════════════════════════════════════════════════════════ */}
      {showSkinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-[#F8DCE5] p-5 sm:p-6 shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#B92F60]" />
                <h3 className="text-sm font-bold text-[#30232A]">Personalized Skin Guide</h3>
              </div>
              <button onClick={()=>setShowSkinModal(false)} className="p-1.5 rounded-xl hover:bg-[#FFF1F5] text-[#30232A]/50 text-sm">✕</button>
            </div>
            {guide ? (
              <div className="space-y-3">
                <div className="px-3 py-2 rounded-2xl text-xs font-bold"
                     style={{ background: guide.bg, border:`1px solid ${guide.b}`, color: guide.c }}>
                  Skin Type: {profile.skin_type}
                </div>
                {[
                  { step:'1. Preparation', tip: guide.tips[0] },
                  { step:'2. Application', tip:'Use a damp beauty sponge to press foundation for seamless blending.' },
                  { step:'3. Setting',     tip:'Dust translucent powder and finish with a dewy fixing mist.' },
                ].map(({step,tip}) => (
                  <div key={step} className="p-3 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] space-y-0.5">
                    <p className="text-xs font-bold text-[#B92F60]">{step}</p>
                    <p className="text-xs text-[#30232A]/70">{tip}</p>
                  </div>
                ))}
                <p className="text-[10px] text-[#30232A]/40 italic">General cosmetic prep advice; not a medical recommendation.</p>
              </div>
            ) : (
              <p className="text-xs text-[#30232A]/60 text-center py-4">Run a face analysis first to unlock your personalized skin guide.</p>
            )}
            <button onClick={()=>setShowSkinModal(false)}
              className="w-full py-2.5 rounded-2xl text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#B92F60,#C94D78)' }}>
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
         ══════════════════════════════════════════════════════════ */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-[#F8DCE5] shadow-2xl overflow-hidden animate-slide-in-up">

            {/* Top accent bar */}
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right,#B92F60,#C94D78,#E86A92)' }} />

            <div className="p-6 space-y-4">
              {/* Icon + heading */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#30232A]">Delete this Look?</h3>
                  <p className="text-xs text-[#30232A]/55 mt-1 leading-relaxed">
                    This makeup look will be permanently removed from your saved collection. This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] text-[#30232A] text-xs font-bold hover:bg-[#F8DCE5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
