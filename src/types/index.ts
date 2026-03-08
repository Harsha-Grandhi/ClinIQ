// ── Case Data Types ──

export type Specialty =
  | 'Cardiology'
  | 'Neurology'
  | 'Pulmonology'
  | 'Gastroenterology'
  | 'Infectious Disease';

export type Difficulty = 'Intern' | 'Resident' | 'Attending';

export type Urgency = 'high' | 'medium' | 'low';

export type Yield = 'high' | 'medium' | 'low';

export type LabFlag = 'normal' | 'high' | 'low' | 'critical';

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'F';

export interface CaseBundle {
  version: string;
  total_cases: number;
  cases: Case[];
}

export interface Case {
  id: string;
  title: string;
  specialty: Specialty;
  difficulty: Difficulty;
  urgency: Urgency;
  patient: {
    name: string;
    age: number;
    gender: 'M' | 'F';
    occupation: string;
  };
  presentation: string;
  correct_diagnosis: string;
  diagnosis_aliases: string[];
  india_context: string;
  history_cards: HistoryCard[];
  exam_regions: ExamRegion[];
  lab_panels: LabPanel[];
  imaging_options: ImagingOption[];
  differential_decoys: string[];
  optimal_path: {
    history_ids: string[];
    exam_ids: string[];
    lab_ids: string[];
    imaging_ids: string[];
    explanation: string;
  };
  debrief: Debrief;
  related_cases: RelatedCase[];
  tier_costs: { history: number; exam: number; labs: number; imaging: number };
}

export interface HistoryCard {
  id: string;
  question: string;
  answer: string;
  yield: Yield;
  hint_value: string;
}

export interface ExamRegion {
  region: string;
  findings: ExamFinding[];
}

export interface ExamFinding {
  id: string;
  name: string;
  result: string;
  yield: Yield;
}

export interface LabPanel {
  panel: string;
  tests: LabTest[];
}

export interface LabTest {
  id: string;
  name: string;
  value: string;
  normal_range: string;
  flag: LabFlag;
  yield: Yield;
}

export interface ImagingOption {
  id: string;
  modality: string;
  region: string;
  cost_points: number;
  report: string;
  yield: Yield;
}

export interface Debrief {
  pathophysiology: string;
  classic_presentation: string;
  key_discriminators: string[];
  common_mimics: CommonMimic[];
  treatment: string;
  clinical_pearl: string;
  attendings_note: string;
  india_context: string;
  learning_tags: string[];
}

export interface CommonMimic {
  name?: string;
  reason?: string;
}

export interface RelatedCase {
  label: string;
  teaser: string;
  teaches: string;
}

// ── User State Types ──

export type YearOfStudy = '3rd Year' | '4th Year' | '5th Year' | 'Intern' | 'PG Aspirant';

export interface UserState {
  name: string;
  yearOfStudy: YearOfStudy;
  specialtyPreferences: Specialty[];
  eloRating: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  totalCasesPlayed: number;
  totalCorrectFirst: number;
  caseHistory: CaseHistoryEntry[];
  badges: string[];
  weeklyScore: number;
  weekStart: string;
}

export interface CaseHistoryEntry {
  caseId: string;
  caseTitle: string;
  specialty: string;
  difficulty: string;
  correctDiagnosis: string;
  studentDiagnosis: string;
  wasCorrect: boolean;
  attemptsUsed: number;
  finalScore: number;
  grade: Grade;
  eloChange: number;
  playedAt: string;
  investigationsUsed: {
    history: string[];
    exam: string[];
    labs: string[];
    imaging: string[];
  };
}

// ── Game Session Types ──

export interface ScoringResult {
  score: number;
  grade: Grade;
  eloChange: number;
  diagnosisBonus: number;
  differentialBonus: number;
  deductions: {
    history: number;
    exam: number;
    labs: number;
    imaging: number;
  };
}

export interface SubmissionResult {
  isCorrect: boolean;
  attemptsRemaining: number;
  scoring: ScoringResult | null;
}

// ── Leaderboard Types ──

export interface LeaderboardEntry {
  rank: number;
  name: string;
  eloRating: number;
  casesThisWeek: number;
  accuracy: number;
  isCurrentUser: boolean;
}
