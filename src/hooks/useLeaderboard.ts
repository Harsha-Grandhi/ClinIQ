import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../types';

export function useLeaderboard(currentUserId: string | null) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, elo_rating, total_cases_played, total_correct_first')
        .order('elo_rating', { ascending: false })
        .limit(25);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const mapped: LeaderboardEntry[] = data.map((row, i) => ({
        rank: i + 1,
        name: row.name,
        eloRating: row.elo_rating,
        casesThisWeek: row.total_cases_played,
        accuracy:
          row.total_cases_played > 0
            ? Math.round((row.total_correct_first / row.total_cases_played) * 100)
            : 0,
        isCurrentUser: row.id === currentUserId,
      }));

      setEntries(mapped);
      setLoading(false);
    }

    fetchLeaderboard();
  }, [currentUserId]);

  return { entries, loading };
}
