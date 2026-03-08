import { useMemo } from 'react';
import { User, Lock, LogOut } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { EloDisplay } from '../components/ui/EloDisplay';
import { useAuth } from '../contexts/AuthContext';
import { useUserStore } from '../store/userStore';
import { getEloRank } from '../utils/elo';
import { BADGE_DEFINITIONS } from '../utils/badges';

export default function Profile() {
  const { signOut } = useAuth();
  const user = useUserStore();
  const rank = getEloRank(user.eloRating);

  const accuracy =
    user.totalCasesPlayed > 0
      ? Math.round((user.totalCorrectFirst / user.totalCasesPlayed) * 100)
      : 0;

  const favouriteSpecialty = useMemo(() => {
    if (user.caseHistory.length === 0) return '—';
    const counts: Record<string, number> = {};
    for (const c of user.caseHistory) {
      counts[c.specialty] = (counts[c.specialty] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  }, [user.caseHistory]);

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
            <User size={32} className="text-accent-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-text-primary">{user.name}</h1>
            <p className="text-sm text-text-muted">{user.yearOfStudy}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-muted hover:text-accent-danger transition-colors cursor-pointer rounded-lg hover:bg-accent-danger/5"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        {/* ELO + Rank */}
        <div className="bg-bg-card rounded-xl card-border p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Rating</p>
            <EloDisplay elo={user.eloRating} />
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Rank</p>
            <span className="font-display font-bold text-lg text-accent-primary">{rank}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBlock label="Cases Played" value={user.totalCasesPlayed} />
          <StatBlock label="Accuracy" value={`${accuracy}%`} />
          <StatBlock label="Best Streak" value={user.longestStreak} />
          <StatBlock label="Favourite" value={favouriteSpecialty} small />
        </div>

        {/* Badge collection */}
        <section>
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Badge Collection
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const earned = user.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl p-4 text-center transition-all ${
                    earned
                      ? 'bg-bg-card card-border'
                      : 'bg-bg-elevated/60 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {earned ? badge.icon : <Lock size={24} className="mx-auto text-text-muted" />}
                  </div>
                  <p className="text-xs font-bold text-text-primary">{badge.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

function StatBlock({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="bg-bg-card rounded-xl card-border p-4 text-center">
      <span
        className={`font-mono font-bold text-text-primary ${small ? 'text-sm' : 'text-xl'}`}
      >
        {value}
      </span>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  );
}
