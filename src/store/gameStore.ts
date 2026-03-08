import { create } from 'zustand';
import type { Case, SubmissionResult, ScoringResult } from '../types';
import { calculateScore, matchDiagnosis, getLiveScore } from '../utils/scoring';

interface GameState {
  currentCase: Case | null;
  sessionId: string | null;

  // Investigations
  historyAsked: string[];
  examPerformed: string[];
  labsOrdered: string[];
  imagingOrdered: string[];

  // Diagnosis
  differential: string[];
  diagnosisAttempts: string[];
  isCorrect: boolean | null;
  isComplete: boolean;

  // Scoring
  currentScore: number;
  differentialIncludedCorrect: boolean;
  finalScoring: ScoringResult | null;

  // Actions
  startCase: (caseData: Case) => void;
  askHistory: (id: string) => void;
  performExam: (id: string) => void;
  orderLab: (id: string) => void;
  orderImaging: (id: string) => void;
  addToDifferential: (diagnosis: string) => void;
  removeFromDifferential: (diagnosis: string) => void;
  submitDiagnosis: (diagnosis: string) => SubmissionResult;
  resetSession: () => void;
}

const initialState = {
  currentCase: null,
  sessionId: null,
  historyAsked: [] as string[],
  examPerformed: [] as string[],
  labsOrdered: [] as string[],
  imagingOrdered: [] as string[],
  differential: [] as string[],
  diagnosisAttempts: [] as string[],
  isCorrect: null,
  isComplete: false,
  currentScore: 500,
  differentialIncludedCorrect: false,
  finalScoring: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  startCase: (caseData) => {
    set({
      ...initialState,
      currentCase: caseData,
      sessionId: `${caseData.id}_${Date.now()}`,
      currentScore: 500,
    });
  },

  askHistory: (id) => {
    const state = get();
    if (state.historyAsked.includes(id) || state.isComplete) return;

    const newHistory = [...state.historyAsked, id];
    set({
      historyAsked: newHistory,
      currentScore: getLiveScore(
        newHistory.length,
        state.examPerformed.length,
        state.labsOrdered.length,
        state.imagingOrdered.length,
      ),
    });
  },

  performExam: (id) => {
    const state = get();
    if (state.examPerformed.includes(id) || state.isComplete) return;

    const newExam = [...state.examPerformed, id];
    set({
      examPerformed: newExam,
      currentScore: getLiveScore(
        state.historyAsked.length,
        newExam.length,
        state.labsOrdered.length,
        state.imagingOrdered.length,
      ),
    });
  },

  orderLab: (id) => {
    const state = get();
    if (state.labsOrdered.includes(id) || state.isComplete) return;

    const newLabs = [...state.labsOrdered, id];
    set({
      labsOrdered: newLabs,
      currentScore: getLiveScore(
        state.historyAsked.length,
        state.examPerformed.length,
        newLabs.length,
        state.imagingOrdered.length,
      ),
    });
  },

  orderImaging: (id) => {
    const state = get();
    if (state.imagingOrdered.includes(id) || state.isComplete) return;

    const newImaging = [...state.imagingOrdered, id];
    set({
      imagingOrdered: newImaging,
      currentScore: getLiveScore(
        state.historyAsked.length,
        state.examPerformed.length,
        state.labsOrdered.length,
        newImaging.length,
      ),
    });
  },

  addToDifferential: (diagnosis) => {
    const state = get();
    if (state.isComplete) return;

    const trimmed = diagnosis.trim();
    if (trimmed.length === 0) return;
    if (state.differential.some((d) => d.toLowerCase() === trimmed.toLowerCase())) return;

    const newDiff = [...state.differential, trimmed];

    // Check if any differential entry matches the correct diagnosis
    let diffCorrect = state.differentialIncludedCorrect;
    if (!diffCorrect && state.currentCase) {
      diffCorrect = matchDiagnosis(
        trimmed,
        state.currentCase.correct_diagnosis,
        state.currentCase.diagnosis_aliases,
      );
    }

    set({ differential: newDiff, differentialIncludedCorrect: diffCorrect });
  },

  removeFromDifferential: (diagnosis) => {
    const state = get();
    if (state.isComplete) return;
    set({
      differential: state.differential.filter((d) => d !== diagnosis),
    });
  },

  submitDiagnosis: (diagnosis) => {
    const state = get();
    const caseData = state.currentCase;

    if (!caseData || state.isComplete) {
      return { isCorrect: false, attemptsRemaining: 0, scoring: null };
    }

    const newAttempts = [...state.diagnosisAttempts, diagnosis];
    const correct = matchDiagnosis(
      diagnosis,
      caseData.correct_diagnosis,
      caseData.diagnosis_aliases,
    );
    const attemptsRemaining = 3 - newAttempts.length;

    if (correct || attemptsRemaining === 0) {
      const scoring = calculateScore({
        historyCount: state.historyAsked.length,
        examCount: state.examPerformed.length,
        labsCount: state.labsOrdered.length,
        imagingCount: state.imagingOrdered.length,
        attempts: correct ? newAttempts.length : 4, // 4 = no bonus
        differentialIncludedCorrect: state.differentialIncludedCorrect,
      });

      // If all 3 failed, override to F grade
      if (!correct) {
        scoring.grade = 'F';
        scoring.eloChange = -20;
        scoring.diagnosisBonus = 0;
      }

      set({
        diagnosisAttempts: newAttempts,
        isCorrect: correct,
        isComplete: true,
        finalScoring: scoring,
      });

      return { isCorrect: correct, attemptsRemaining, scoring };
    }

    // Incorrect but attempts remain
    set({ diagnosisAttempts: newAttempts });
    return { isCorrect: false, attemptsRemaining, scoring: null };
  },

  resetSession: () => {
    set({ ...initialState });
  },
}));
