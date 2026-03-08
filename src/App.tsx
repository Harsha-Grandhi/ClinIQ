import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useUserStore } from './store/userStore';
import { Navbar } from './components/layout/Navbar';
import { ScrollToTop } from './components/layout/ScrollToTop';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CaseBrowser from './pages/CaseBrowser';
import GameSession from './pages/GameSession';
import Debrief from './pages/Debrief';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';

function AppRoutes() {
  const { user, loading: authLoading } = useAuth();
  const isOnboarded = useUserStore((s) => s.isOnboarded);
  const isLoading = useUserStore((s) => s.isLoading);
  const hydrateFromSupabase = useUserStore((s) => s.hydrateFromSupabase);
  const clearState = useUserStore((s) => s.clearState);
  const location = useLocation();

  // Hydrate user store when auth user changes
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      hydrateFromSupabase(user.id);
    } else {
      clearState();
    }
  }, [user, authLoading, hydrateFromSupabase, clearState]);

  // Show loading spinner while auth or profile is loading
  if (authLoading || (user && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged in but not onboarded (no profile row yet)
  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // Fully authenticated + onboarded
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<CaseBrowser />} />
          <Route path="/case/:id" element={<GameSession />} />
          <Route path="/case/:id/debrief" element={<Debrief />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
