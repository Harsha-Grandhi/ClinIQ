import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Trophy, Clock } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { EloDisplay } from '../ui/EloDisplay';
import { StreakBadge } from '../ui/StreakBadge';

const navLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/cases', icon: BookOpen, label: 'Cases' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Navbar() {
  const location = useLocation();
  const { eloRating, currentStreak } = useUserStore();

  return (
    <>
      {/* Desktop top bar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-bg-surface border-b border-black/8">
        <Link to="/" className="font-display font-bold text-xl text-accent-primary tracking-tight">
          ClinIQ
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors hover:text-accent-primary ${
                location.pathname === to ? 'text-accent-primary' : 'text-text-secondary'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <EloDisplay elo={eloRating} size="sm" />
          <StreakBadge streak={currentStreak} size="sm" />
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 bg-bg-surface border-t border-black/8">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
              location.pathname === to ? 'text-accent-primary' : 'text-text-muted'
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
