export function calculateEloChange(currentElo: number, grade: string): number {
  const change =
    grade === 'A+'
      ? 25
      : grade === 'A'
        ? 15
        : grade === 'B'
          ? 5
          : grade === 'C'
            ? -5
            : -20;

  return Math.max(0, currentElo + change);
}

export function getEloRank(elo: number): string {
  if (elo >= 1500) return 'Attending';
  if (elo >= 1300) return 'Fellow';
  if (elo >= 1100) return 'Resident';
  return 'Intern';
}
