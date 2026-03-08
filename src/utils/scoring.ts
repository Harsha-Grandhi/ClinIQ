import type { Grade, ScoringResult } from '../types';

interface ScoreInput {
  historyCount: number;
  examCount: number;
  labsCount: number;
  imagingCount: number;
  attempts: number;
  differentialIncludedCorrect: boolean;
}

export function calculateScore(input: ScoreInput): ScoringResult {
  const base = 500;

  const deductions = {
    history: input.historyCount * 5,
    exam: input.examCount * 10,
    labs: input.labsCount * 20,
    imaging: input.imagingCount * 35,
  };

  const totalDeductions =
    deductions.history + deductions.exam + deductions.labs + deductions.imaging;

  const diagnosisBonus =
    input.attempts === 1
      ? 200
      : input.attempts === 2
        ? 100
        : input.attempts === 3
          ? 50
          : 0;

  const differentialBonus = input.differentialIncludedCorrect ? 50 : 0;

  const score = Math.max(0, base - totalDeductions + diagnosisBonus + differentialBonus);

  const grade: Grade =
    score >= 450
      ? 'A+'
      : score >= 350
        ? 'A'
        : score >= 250
          ? 'B'
          : score >= 150
            ? 'C'
            : 'F';

  const eloChange =
    grade === 'A+'
      ? 25
      : grade === 'A'
        ? 15
        : grade === 'B'
          ? 5
          : grade === 'C'
            ? -5
            : -20;

  return { score, grade, eloChange, diagnosisBonus, differentialBonus, deductions };
}

export function matchDiagnosis(
  input: string,
  correct: string,
  aliases: string[],
): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

  const ni = normalize(input);
  if (ni.length === 0) return false;

  return [correct, ...aliases].some((d) => {
    const nd = normalize(d);
    return ni === nd || ni.includes(nd) || nd.includes(ni);
  });
}

export function getLiveScore(
  historyCount: number,
  examCount: number,
  labsCount: number,
  imagingCount: number,
): number {
  return Math.max(
    0,
    500 - historyCount * 5 - examCount * 10 - labsCount * 20 - imagingCount * 35,
  );
}
