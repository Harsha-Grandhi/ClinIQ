import { create } from 'zustand';
import type { UserState, Specialty, YearOfStudy, CaseHistoryEntry } from '../types';
import { updateStreak } from '../utils/streak';
import { checkNewBadges } from '../utils/badges';

const STORAGE_KEY = 'cliniq_user';

function loadUser(): UserState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserState;
  } catch {
    return null;
  }
}

function saveUser(user: UserState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

interface UserStore extends UserState {
  isOnboarded: boolean;

  // Actions
  initUser: (name: string, yearOfStudy: YearOfStudy, specialties: Specialty[]) => void;
  addCaseResult: (entry: CaseHistoryEntry) => void;
  updateElo: (change: number) => void;
  resetUser: () => void;
}

const defaultState: UserState = {
  name: '',
  yearOfStudy: '3rd Year',
  specialtyPreferences: [],
  eloRating: 1000,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: '',
  totalCasesPlayed: 0,
  totalCorrectFirst: 0,
  caseHistory: [],
  badges: [],
  weeklyScore: 0,
  weekStart: '',
};

export const useUserStore = create<UserStore>((set, get) => {
  const saved = loadUser();

  return {
    ...(saved ?? defaultState),
    isOnboarded: saved !== null,

    initUser: (name, yearOfStudy, specialties) => {
      const user: UserState = {
        ...defaultState,
        name,
        yearOfStudy,
        specialtyPreferences: specialties,
      };
      saveUser(user);
      set({ ...user, isOnboarded: true });
    },

    addCaseResult: (entry) => {
      const state = get();
      const newStreak = updateStreak(state.lastPlayedDate, state.currentStreak);
      const newLongest = Math.max(state.longestStreak, newStreak);

      // Calculate weekly score
      const now = new Date();
      const weekStart = getWeekStart(now);
      const weeklyScore =
        state.weekStart === weekStart
          ? state.weeklyScore + entry.finalScore
          : entry.finalScore;

      const updatedUser: UserState = {
        ...state,
        totalCasesPlayed: state.totalCasesPlayed + 1,
        totalCorrectFirst:
          state.totalCorrectFirst + (entry.wasCorrect && entry.attemptsUsed === 1 ? 1 : 0),
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastPlayedDate: new Date().toDateString(),
        eloRating: Math.max(0, state.eloRating + entry.eloChange),
        caseHistory: [entry, ...state.caseHistory],
        weeklyScore,
        weekStart,
      };

      // Check badges
      const newBadges = checkNewBadges(updatedUser, entry);
      updatedUser.badges = [...updatedUser.badges, ...newBadges];

      saveUser(updatedUser);
      set({ ...updatedUser });
    },

    updateElo: (change) => {
      const state = get();
      const updated = { ...state, eloRating: Math.max(0, state.eloRating + change) };
      saveUser(updated);
      set(updated);
    },

    resetUser: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ ...defaultState, isOnboarded: false });
    },
  };
});

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0]!;
}
