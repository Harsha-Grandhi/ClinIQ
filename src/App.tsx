import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useUserStore } from './store/userStore';
import { Navbar } from './components/layout/Navbar';
import { ScrollToTop } from './components/layout/ScrollToTop';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CaseBrowser from './pages/CaseBrowser';
import GameSession from './pages/GameSession';
import Debrief from './pages/Debrief';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';

function AppRoutes() {
  const isOnboarded = useUserStore((s) => s.isOnboarded);
  const location = useLocation();

  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

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
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
