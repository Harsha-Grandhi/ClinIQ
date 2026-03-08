import { create } from 'zustand';
import type { UserState, Specialty, YearOfStudy, CaseHistoryEntry, Grade } from '../types';
import { updateStreak } from '../utils/streak';
import { checkNewBadges } from '../utils/badges';
import { supabase } from '../lib/supabase';

interface UserStore extends UserState {
  isOnboarded: boolean;
  isLoading: boolean;

  // Actions
  initUser: (name: string, yearOfStudy: YearOfStudy, specialties: Specialty[]) => void;
  addCaseResult: (entry: CaseHistoryEntry) => void;
  updateElo: (change: number) => void;
  resetUser: () => void;
  hydrateFromSupabase: (userId: string) => Promise<void>;
  clearState: () => void;
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

export const useUserStore = create<UserStore>((set, get) => ({
  ...defaultState,
  isOnboarded: false,
  isLoading: true,

  hydrateFromSupabase: async (userId: string) => {
    set({ isLoading: true });

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      // User exists in auth but no profile yet (mid-onboarding)
      set({ ...defaultState, isOnboarded: false, isLoading: false });
      return;
    }

    // Fetch case history
    const { data: results } = await supabase
      .from('case_results')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    const caseHistory: CaseHistoryEntry[] = (results ?? []).map((r) => ({
      caseId: r.case_id,
      caseTitle: r.case_title,
      specialty: r.specialty,
      difficulty: r.difficulty,
      correctDiagnosis: r.correct_diagnosis,
      studentDiagnosis: r.student_diagnosis,
      wasCorrect: r.was_correct,
      attemptsUsed: r.attempts_used,
      finalScore: r.final_score,
      grade: r.grade as Grade,
      eloChange: r.elo_change,
      playedAt: r.played_at,
      investigationsUsed: r.investigations_used as CaseHistoryEntry['investigationsUsed'],
    }));

    set({
      name: profile.name,
      yearOfStudy: profile.year_of_study as YearOfStudy,
      specialtyPreferences: profile.specialty_preferences as Specialty[],
      eloRating: profile.elo_rating,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      lastPlayedDate: profile.last_played_date ?? '',
      totalCasesPlayed: profile.total_cases_played,
      totalCorrectFirst: profile.total_correct_first,
      caseHistory,
      badges: profile.badges,
      weeklyScore: profile.weekly_score,
      weekStart: profile.week_start ?? '',
      isOnboarded: true,
      isLoading: false,
    });
  },

  initUser: (name, yearOfStudy, specialties) => {
    const user: UserState = {
      ...defaultState,
      name,
      yearOfStudy,
      specialtyPreferences: specialties,
    };
    set({ ...user, isOnboarded: true, isLoading: false });

    // Write to Supabase in background
    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      await supabase.from('profiles').insert({
        id: authUser.id,
        name,
        year_of_study: yearOfStudy,
        specialty_preferences: specialties,
      });
    })();
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

    set({ ...updatedUser });

    // Sync to Supabase in background
    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Insert case result
      await supabase.from('case_results').insert({
        user_id: authUser.id,
        case_id: entry.caseId,
        case_title: entry.caseTitle,
        specialty: entry.specialty,
        difficulty: entry.difficulty,
        correct_diagnosis: entry.correctDiagnosis,
        student_diagnosis: entry.studentDiagnosis,
        was_correct: entry.wasCorrect,
        attempts_used: entry.attemptsUsed,
        final_score: entry.finalScore,
        grade: entry.grade,
        elo_change: entry.eloChange,
        investigations_used: entry.investigationsUsed as Record<string, unknown>,
      });

      // Update profile stats
      await supabase
        .from('profiles')
        .update({
          elo_rating: updatedUser.eloRating,
          current_streak: updatedUser.currentStreak,
          longest_streak: updatedUser.longestStreak,
          last_played_date: updatedUser.lastPlayedDate,
          total_cases_played: updatedUser.totalCasesPlayed,
          total_correct_first: updatedUser.totalCorrectFirst,
          badges: updatedUser.badges,
          weekly_score: updatedUser.weeklyScore,
          week_start: updatedUser.weekStart,
        })
        .eq('id', authUser.id);
    })();
  },

  updateElo: (change) => {
    const state = get();
    const newElo = Math.max(0, state.eloRating + change);
    set({ eloRating: newElo });

    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      await supabase.from('profiles').update({ elo_rating: newElo }).eq('id', authUser.id);
    })();
  },

  resetUser: () => {
    set({ ...defaultState, isOnboarded: false, isLoading: false });
  },

  clearState: () => {
    set({ ...defaultState, isOnboarded: false, isLoading: false });
  },
}));

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0]!;
}
