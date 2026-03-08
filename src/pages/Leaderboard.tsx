import { useState } from 'react';
import { Crown } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../hooks/useLeaderboard';

export default function Leaderboard() {
  const [tab, setTab] = useState<'week' | 'all'>('week');
  const { user } = useAuth();
  const { entries, loading } = useLeaderboard(user?.id ?? null);

  const crownColor = (rank: number) => {
    if (rank === 1) return 'text-accent-warning';
    if (rank === 2) return 'text-text-muted';
    if (rank === 3) return 'text-accent-tertiary';
    return 'text-transparent';
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary mb-6">
          Leaderboard
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-elevated rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('week')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              tab === 'week'
                ? 'bg-bg-card text-accent-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              tab === 'all'
                ? 'bg-bg-card text-accent-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            All Time
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-muted">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted">No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="bg-bg-card rounded-xl card-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted w-12">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">
                    Name
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-text-muted">
                    ELO
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">
                    Cases
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {entries.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`transition-colors ${
                      entry.isCurrentUser
                        ? 'bg-accent-primary/5'
                        : 'hover:bg-bg-elevated/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {entry.rank <= 3 ? (
                          <Crown size={16} className={crownColor(entry.rank)} />
                        ) : (
                          <span className="font-mono text-text-muted w-4 text-center">
                            {entry.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          entry.isCurrentUser ? 'text-accent-primary' : 'text-text-primary'
                        }`}
                      >
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-1.5 text-xs bg-accent-primary/10 text-accent-primary px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-accent-primary">
                      {entry.eloRating}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary hidden md:table-cell">
                      {entry.casesThisWeek}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary hidden md:table-cell">
                      {entry.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
