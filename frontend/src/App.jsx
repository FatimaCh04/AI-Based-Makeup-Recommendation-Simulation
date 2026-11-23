import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public & Guest Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import GuestPhotoUploadPage from './pages/GuestPhotoUploadPage';
import GuestAnalysisPage from './pages/GuestAnalysisPage';
import GuestResultsPage from './pages/GuestResultsPage';
import GuestOccasionPage from './pages/GuestOccasionPage';
import GuestTryOnPage from './pages/GuestTryOnPage';

// Authenticated Studio Pages
import DashboardPage from './pages/DashboardPage';
import EventSelectionPage from './pages/EventSelectionPage';
import CameraCapturePage from './pages/CameraCapturePage';
import AIProcessingPage from './pages/AIProcessingPage';
import RecommendationResultPage from './pages/RecommendationResultPage';
import TryShadesPage from './pages/TryShadesPage';
import ComparisonPage from './pages/ComparisonPage';
import ProductSuggestionsPage from './pages/ProductSuggestionsPage';
import SaveLookPage from './pages/SaveLookPage';
import HistoryPage from './pages/HistoryPage';
import SavedLooksPage from './pages/SavedLooksPage';
import ProfilePage from './pages/ProfilePage';
import AboutHowItWorksPage from './pages/AboutHowItWorksPage';
import SettingsPage from './pages/SettingsPage';
import FeedbackPage from './pages/FeedbackPage';
import HowToUsePage from './pages/HowToUsePage';

function AppLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Standalone pages that do not render the interior sidebar / header
  const isStandalonePage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/guest');

  if (isStandalonePage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Guest Workflow (Strictly no dashboard access) */}
        <Route path="/guest/upload" element={<GuestPhotoUploadPage />} />
        <Route path="/guest/analysis" element={<GuestAnalysisPage />} />
        <Route path="/guest/results" element={<GuestResultsPage />} />
        <Route path="/guest/occasion" element={<GuestResultsPage />} />
        <Route path="/guest/tryon" element={<GuestTryOnPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1F5] flex text-[#30232A] selection:bg-[#F8DCE5] selection:text-[#B92F60] font-sans overflow-x-hidden">
      {/* Fixed / Collapsible Studio Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Studio Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Studio Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Routed Page */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl w-full mx-auto min-w-0">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/select-event" element={<ProtectedRoute><EventSelectionPage /></ProtectedRoute>} />
            <Route path="/capture" element={<ProtectedRoute><CameraCapturePage /></ProtectedRoute>} />
            <Route path="/processing" element={<ProtectedRoute><AIProcessingPage /></ProtectedRoute>} />
            <Route path="/result" element={<ProtectedRoute><RecommendationResultPage /></ProtectedRoute>} />
            <Route path="/try-shades" element={<ProtectedRoute><TryShadesPage /></ProtectedRoute>} />
            <Route path="/try-makeup" element={<ProtectedRoute><TryShadesPage /></ProtectedRoute>} />
            <Route path="/compare" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductSuggestionsPage /></ProtectedRoute>} />
            <Route path="/save-look" element={<ProtectedRoute><SaveLookPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/saved-looks" element={<ProtectedRoute><SavedLooksPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><AboutHowItWorksPage /></ProtectedRoute>} />
            <Route path="/how-it-works" element={<ProtectedRoute><AboutHowItWorksPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/how-to-use" element={<ProtectedRoute><HowToUsePage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Minimal Clean Footer */}
        <footer className="px-4 sm:px-8 py-4 border-t border-pink-100 bg-white/70 text-center text-xs text-[#756D7B]">
          AI Glam — AI-Based Makeup Recommendation and Virtual Simulation System
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}
