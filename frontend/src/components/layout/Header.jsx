import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Menu, Sparkles, User, LogOut, Sliders } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { mockUserData } from '../../data/mockBeautyData';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const displayName = user?.name || mockUserData.name;
  const displayEmail = user?.email || mockUserData.email;
  const firstName = displayName.split(' ')[0] || 'there';

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#F8DCE5] px-3 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-2 min-w-0">
        
        {/* Left: hamburger + greeting */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden flex-shrink-0 p-2 rounded-2xl text-[#30232A] bg-white border border-[#F8DCE5] hover:bg-[#FFF1F5] shadow-sm touch-target"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#30232A] truncate">
              Welcome, {firstName}!
            </h2>
            <p className="hidden sm:block text-xs text-[#30232A]/60 font-normal truncate">
              Let's find your tailored makeup look today.
            </p>
          </div>
        </div>

        {/* Right: notification + user */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsUserMenuOpen(false);
              }}
              className="relative p-2.5 rounded-2xl bg-white border border-[#F8DCE5] text-[#30232A] hover:text-[#B92F60] hover:border-[#B92F60]/40 shadow-2xs transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B92F60] ring-2 ring-white" />
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>

          {/* User Profile Pill */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-white border border-[#F8DCE5] shadow-2xs hover:border-[#B92F60]/40 transition-all"
            >
              <img
                src={mockUserData.avatar}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-[#F8DCE5]"
              />
              <span className="hidden sm:inline text-xs font-bold text-[#30232A]">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#30232A]/50" />
            </button>

          {/* Dropdown Menu — right-aligned, max-w to stay in viewport */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-3xl shadow-lg border border-[#F8DCE5] py-2 z-50 animate-slide-in-up max-w-[calc(100vw-1rem)]">
                <div className="px-4 py-2 border-b border-[#F8DCE5]/60">
                  <p className="text-xs font-bold text-[#30232A]">{displayName}</p>
                  <p className="text-[11px] text-[#30232A]/60 truncate">{displayEmail}</p>
                </div>

                <div className="py-1 text-xs">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[#30232A] hover:bg-[#FFF1F5] hover:text-[#B92F60]"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[#30232A] hover:bg-[#FFF1F5] hover:text-[#B92F60]"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Studio Settings</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#F8DCE5]/60">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
