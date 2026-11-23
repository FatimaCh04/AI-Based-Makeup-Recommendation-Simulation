import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanFace,
  Heart,
  UserCheck,
  Settings,
  LogOut,
  Sparkles,
  X,
  MessageSquareHeart,
  BookOpen,
} from 'lucide-react';
import { mockUserData } from '../../data/mockBeautyData';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard',        path: '/dashboard',    icon: LayoutDashboard },
  { name: 'Start Analysis',   path: '/capture',      icon: ScanFace, badge: 'AI' },
  { name: 'Saved Looks',      path: '/saved-looks',  icon: Heart },
  { name: 'Profile',          path: '/profile',      icon: UserCheck },
  { name: 'How to Use',       path: '/how-to-use',   icon: BookOpen },
];

const bottomItems = [
  { name: 'Feedback & Support', path: '/feedback',  icon: MessageSquareHeart },
  { name: 'Settings',           path: '/settings',  icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name || mockUserData.name;

  const handleNav = () => {
    // Close sidebar on mobile after any navigation
    if (onClose) onClose();
  };

  return (
    <>
      {/* ── Mobile backdrop ──────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#30232A]/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ───────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#F8DCE5]
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Sidebar navigation"
      >
        {/* ── Top: brand + nav ────────────────────────────────────── */}
        <div className="flex flex-col min-h-0 overflow-y-auto">
          {/* Brand header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F8DCE5]/60 flex-shrink-0">
            <button
              onClick={() => { navigate('/'); handleNav(); }}
              className="flex items-center gap-2.5 focus:outline-none"
              aria-label="Go to home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B92F60] to-[#C94D78] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-[#30232A] block leading-none">
                  AI GLAM
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#B92F60] font-bold">
                  Studio
                </span>
              </div>
            </button>

            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-[#30232A]/60 hover:bg-[#FFF1F5] touch-target flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-0.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon    = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={handleNav}
                  className={`
                    group flex items-center justify-between px-3.5 py-2.5 rounded-2xl
                    text-xs font-semibold transition-all duration-200 min-h-[44px]
                    ${isActive
                      ? 'bg-[#B92F60] text-white shadow-sm'
                      : 'text-[#30232A]/80 hover:text-[#B92F60] hover:bg-[#FFF1F5]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-[#30232A]/50 group-hover:text-[#B92F60]'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#F8DCE5] text-[#B92F60]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ── Bottom: feedback, settings, logout, user card ──────── */}
        <div className="p-3 border-t border-[#F8DCE5]/60 space-y-0.5 bg-[#FFF1F5]/40 flex-shrink-0">
          {bottomItems.map((item) => {
            const Icon    = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNav}
                className={`
                  group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl
                  text-xs font-semibold transition-all duration-200 min-h-[44px]
                  ${isActive
                    ? 'bg-[#F8DCE5] text-[#B92F60] font-bold'
                    : 'text-[#30232A]/70 hover:text-[#B92F60] hover:bg-[#FFF1F5]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#B92F60]' : 'text-[#30232A]/50 group-hover:text-[#B92F60]'
                }`} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}

          {/* Logout */}
          <button
            onClick={() => {
              handleNav();
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#30232A]/70 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 min-h-[44px]"
          >
            <LogOut className="w-4 h-4 text-[#30232A]/50 flex-shrink-0" />
            <span>Logout</span>
          </button>

          {/* User account card */}
          <button
            onClick={() => { handleNav(); navigate('/profile'); }}
            className="w-full mt-1 p-2.5 rounded-2xl bg-white border border-[#F8DCE5] shadow-sm hover:border-[#B92F60] transition-all cursor-pointer flex items-center gap-3 min-h-[52px] text-left"
          >
            <img
              src={mockUserData.avatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#F8DCE5] flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#30232A] truncate">{displayName}</div>
              <div className="text-[10px] text-[#B92F60] font-semibold">View Profile</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
