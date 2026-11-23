import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Lock, Edit3, CheckCircle2,
  AlertCircle, Eye, EyeOff, Save, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { mockUserData } from '../data/mockBeautyData';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // Active sub-modals/drawers: null | 'personal' | 'password'
  const [activeSection, setActiveSection] = useState(null);

  // Form states
  const [isEditingTop, setIsEditingTop] = useState(false);
  const [name, setName] = useState(user?.name || 'aliza');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 392-1084');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Feedback messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const displayName = user?.name || name;
  const displayEmail = user?.email || 'lizzay2307@gmail.com';
  const avatar = user?.avatar || mockUserData.avatar;

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 3500);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3500);
    }
  };

  // 1. Save Profile (Name & Phone)
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showNotification('Name cannot be empty', true);
      return;
    }
    setSavingProfile(true);
    try {
      const res = await apiClient.put('/user/profile', {
        name: name.trim(),
        phone: phone.trim()
      });
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      setIsEditingTop(false);
      showNotification('Profile information saved successfully!');
    } catch (err) {
      updateUser({ name: name.trim(), phone: phone.trim() });
      setIsEditingTop(false);
      showNotification('Profile updated!');
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showNotification('Please enter your current password', true);
      return;
    }
    if (newPassword.length < 6) {
      showNotification('New password must be at least 6 characters', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', true);
      return;
    }

    setPwdLoading(true);
    try {
      const res = await apiClient.post('/user/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      showNotification(res.data?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection(null);
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not change password. Check your current password.';
      showNotification(msg, true);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-[#30232A]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-2xl bg-white border border-[#F8DCE5] text-[#30232A] hover:bg-[#FFF1F5] hover:text-[#B92F60] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#30232A]">Profile</h1>
          <p className="text-xs text-[#30232A]/60">Manage account details &amp; beauty preferences</p>
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#F8DCE5] shadow-xs space-y-6">
        {/* User Info Header Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#F8DCE5]/60">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={avatar}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#F8DCE5] shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="space-y-1">
              {isEditingTop ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="px-3 py-1.5 rounded-xl border border-[#F8DCE5] text-sm font-bold text-[#30232A] focus:outline-none focus:border-[#B92F60] w-full max-w-xs"
                  />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="px-3 py-1 rounded-xl border border-[#F8DCE5] text-xs text-[#30232A] focus:outline-none focus:border-[#B92F60] w-full max-w-xs block"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-serif font-bold text-[#30232A]">{displayName}</h2>
                  <p className="text-xs text-[#30232A]/70">{displayEmail}</p>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFF1F5] border border-[#F8DCE5] text-[10px] font-bold text-[#B92F60]">
                    Premium Beauty Member
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Edit / Save Button */}
          {isEditingTop ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingTop(false)}
                className="px-4 py-2 rounded-2xl bg-white border border-[#F8DCE5] text-xs font-semibold text-[#30232A]/70 hover:bg-[#FFF1F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-2xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTop(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* 2 Profile Settings Cards (Personal Information & Change Password) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Personal Information */}
          <div
            onClick={() => setActiveSection(activeSection === 'personal' ? null : 'personal')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSection === 'personal'
                ? 'bg-[#FFF1F5] border-[#B92F60] shadow-xs'
                : 'bg-[#FFF1F5]/60 border-[#F8DCE5] hover:bg-[#FFF1F5] hover:border-[#B92F60]/40'
            } flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] shadow-2xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#30232A]">Personal Information</h4>
                <p className="text-[11px] text-[#30232A]/60">Name, Email, Beauty Preferences</p>
              </div>
            </div>
            <span className="text-xs text-[#B92F60] font-semibold">
              {activeSection === 'personal' ? 'Close' : 'View'}
            </span>
          </div>

          {/* Card 2: Change Password */}
          <div
            onClick={() => setActiveSection(activeSection === 'password' ? null : 'password')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSection === 'password'
                ? 'bg-[#FFF1F5] border-[#B92F60] shadow-xs'
                : 'bg-[#FFF1F5]/60 border-[#F8DCE5] hover:bg-[#FFF1F5] hover:border-[#B92F60]/40'
            } flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#F8DCE5] flex items-center justify-center text-[#B92F60] shadow-2xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#30232A]">Change Password</h4>
                <p className="text-[11px] text-[#30232A]/60">Security &amp; Account Credentials</p>
              </div>
            </div>
            <span className="text-xs text-[#B92F60] font-semibold">
              {activeSection === 'password' ? 'Close' : 'Update'}
            </span>
          </div>
        </div>

        {/* ================= EXPANDED SECTION DETAILS ================= */}

        {/* 1. Personal Information Expanded Details */}
        {activeSection === 'personal' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#F8DCE5] pb-3">
              <h3 className="text-sm font-serif font-bold text-[#30232A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#B92F60]" />
                <span>Personal Information Details</span>
              </h3>
              <button onClick={() => setActiveSection(null)} className="text-[#30232A]/50 hover:text-[#30232A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#30232A]/70 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8DCE5] focus:outline-none focus:border-[#B92F60] font-semibold text-[#30232A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#30232A]/70 mb-1">Email Address</label>
                <input
                  type="email"
                  value={displayEmail}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-white/70 border border-[#F8DCE5] text-[#30232A]/60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#30232A]/70 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8DCE5] focus:outline-none focus:border-[#B92F60] font-semibold text-[#30232A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#30232A]/70 mb-1">Membership Status</label>
                <div className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8DCE5] text-[#B92F60] font-bold">
                  Verified Member (Active)
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-5 py-2 rounded-xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Personal Information</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Change Password Form */}
        {activeSection === 'password' && (
          <form onSubmit={handleChangePassword} className="p-5 sm:p-6 rounded-2xl bg-[#FFF1F5] border border-[#F8DCE5] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#F8DCE5] pb-3">
              <h3 className="text-sm font-serif font-bold text-[#30232A] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#B92F60]" />
                <span>Change Your Password</span>
              </h3>
              <button type="button" onClick={() => setActiveSection(null)} className="text-[#30232A]/50 hover:text-[#30232A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#30232A]/70 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-9 rounded-xl bg-white border border-[#F8DCE5] text-xs font-semibold text-[#30232A] focus:outline-none focus:border-[#B92F60]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-2.5 top-2.5 text-[#30232A]/40 hover:text-[#30232A]"
                  >
                    {showCurrentPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#30232A]/70 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 pr-9 rounded-xl bg-white border border-[#F8DCE5] text-xs font-semibold text-[#30232A] focus:outline-none focus:border-[#B92F60]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-2.5 top-2.5 text-[#30232A]/40 hover:text-[#30232A]"
                  >
                    {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#30232A]/70 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8DCE5] text-xs font-semibold text-[#30232A] focus:outline-none focus:border-[#B92F60]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-5 py-2 rounded-xl bg-[#B92F60] hover:bg-[#C94D78] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{pwdLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
