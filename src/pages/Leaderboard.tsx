import { useState, useMemo } from 'react';
import { Crown } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useUserStore } from '../store/userStore';
import type { LeaderboardEntry } from '../types';

const MOCK_NAMES = [
  'Priya Sharma', 'Rahul Deshmukh', 'Ananya Iyer', 'Vikram Reddy',
  'Sneha Patel', 'Arjun Nair', 'Kavya Menon', 'Rohan Gupta',
  'Isha Kulkarni', 'Aditya Joshi', 'Meera Sundaram', 'Karthik Raman',
  'Divya Choudhary', 'Siddharth Das', 'Pooja Hegde', 'Manish Tiwari',
  'Ritu Agarwal', 'Harsh Vardhan', 'Neha Kapoor', 'Pranav Mehta',
];

function generateMockData(userName: string, userElo: number, userCases: number, userAccuracy: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = MOCK_NAMES.map((name, i) => ({
    rank: 0,
    name,
    eloRating: Math.round(1600 - i * 35 + (Math.sin(i * 7) * 40)),
    casesThisWeek: Math.max(1, Math.round(12 - i * 0.5 + (Math.cos(i * 3) * 3))),
    accuracy: Math.max(40, Math.min(98, Math.round(95 - i * 2.5 + (Math.sin(i * 5) * 8)))),
    isCurrentUser: false,
  }));

  // Insert current user around position 8-12
  const userEntry: LeaderboardEntry = {
    rank: 0,
    name: userName,
    eloRating: userElo,
    casesThisWeek: userCases,
    accuracy: userAccuracy,
    isCurrentUser: true,
  };

  entries.push(userEntry);
  entries.sort((a, b) => b.eloRating - a.eloRating);
  entries.forEach((e, i) => (e.rank = i + 1));

  return entries;
}

export default function Leaderboard() {
  const [tab, setTab] = useState<'week' | 'all'>('week');
  const user = useUserStore();

  const accuracy =
    user.totalCasesPlayed > 0
      ? Math.round((user.totalCorrectFirst / user.totalCasesPlayed) * 100)
      : 0;

  const entries = useMemo(
    () => generateMockData(user.name, user.eloRating, user.totalCasesPlayed, accuracy),
    [user.name, user.eloRating, user.totalCasesPlayed, accuracy],
  );

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

        {/* Table */}
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
      </div>
    </PageWrapper>
  );
}
