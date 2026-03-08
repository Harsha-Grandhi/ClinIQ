export function updateStreak(lastPlayed: string, current: number): number {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastPlayed === today) return current; // already played today
  if (lastPlayed === yesterday) return current + 1; // consecutive day
  return 1; // streak broken, reset to 1
}
