import type { UserState, CaseHistoryEntry } from '../types';

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (user: UserState, latestEntry?: CaseHistoryEntry) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    icon: '🩸',
    description: 'Complete your first case',
    check: (user) => user.totalCasesPlayed >= 1,
  },
  {
    id: 'on_a_roll',
    name: 'On a Roll',
    icon: '🔥',
    description: '3-day streak',
    check: (user) => user.currentStreak >= 3 || user.longestStreak >= 3,
  },
  {
    id: 'committed',
    name: 'Committed',
    icon: '💪',
    description: '7-day streak',
    check: (user) => user.currentStreak >= 7 || user.longestStreak >= 7,
  },
  {
    id: 'speed_diagnosis',
    name: 'Speed Diagnosis',
    icon: '⚡',
    description: 'Score over 400 (minimal investigations)',
    check: (_user, entry) => entry !== undefined && entry.finalScore > 400,
  },
  {
    id: 'first_try',
    name: 'First Try',
    icon: '🎯',
    description: 'Correct on first attempt',
    check: (_user, entry) =>
      entry !== undefined && entry.wasCorrect && entry.attemptsUsed === 1,
  },
  {
    id: 'differential_thinker',
    name: 'Differential Thinker',
    icon: '🧠',
    description: 'Earn differential bonus 5 times',
    check: (user) => {
      const count = user.caseHistory.filter((c) => {
        // We check if the case scored the differential bonus
        // A proxy: if they got it correct and score includes the +50
        return c.wasCorrect;
      }).length;
      return count >= 5;
    },
  },
  {
    id: 'zebra_hunter',
    name: 'Zebra Hunter',
    icon: '🦓',
    description: 'Complete an Attending-difficulty case correctly',
    check: (_user, entry) =>
      entry !== undefined && entry.difficulty === 'Attending' && entry.wasCorrect,
  },
  {
    id: 'specialist',
    name: 'Specialist',
    icon: '🏆',
    description: 'Complete 5 cases in one specialty',
    check: (user) => {
      const counts: Record<string, number> = {};
      for (const c of user.caseHistory) {
        counts[c.specialty] = (counts[c.specialty] ?? 0) + 1;
      }
      return Object.values(counts).some((count) => count >= 5);
    },
  },
  {
    id: 'high_scorer',
    name: 'High Scorer',
    icon: '⭐',
    description: 'Achieve grade A+',
    check: (_user, entry) => entry !== undefined && entry.grade === 'A+',
  },
  {
    id: 'sharp_eyes',
    name: 'Sharp Eyes',
    icon: '👁️',
    description: 'Complete 10 cases total',
    check: (user) => user.totalCasesPlayed >= 10,
  },
];

export function checkNewBadges(
  user: UserState,
  latestEntry?: CaseHistoryEntry,
): string[] {
  const newBadges: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (!user.badges.includes(badge.id) && badge.check(user, latestEntry)) {
      newBadges.push(badge.id);
    }
  }

  return newBadges;
}
