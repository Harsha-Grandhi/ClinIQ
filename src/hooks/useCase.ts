import { useMemo } from 'react';
import casesData from '../data/cases.json';
import type { Case, CaseBundle } from '../types';

const bundle = casesData as CaseBundle;

export function useAllCases(): Case[] {
  return bundle.cases;
}

export function useCase(id: string | undefined): Case | null {
  return useMemo(() => {
    if (!id) return null;
    return bundle.cases.find((c) => c.id === id) ?? null;
  }, [id]);
}

export function getCaseOfTheDay(cases: Case[]): Case {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % cases.length;
  return cases[index]!;
}

export function getAllDiagnoses(): string[] {
  const set = new Set<string>();
  for (const c of bundle.cases) {
    set.add(c.correct_diagnosis);
    for (const alias of c.diagnosis_aliases) {
      set.add(alias);
    }
  }
  return Array.from(set);
}
