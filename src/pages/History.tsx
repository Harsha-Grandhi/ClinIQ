import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradeBadge } from '../components/ui/Badge';
import { useUserStore } from '../store/userStore';
import type { Specialty, Grade } from '../types';

const SPECIALTY_FILTERS: ('All' | Specialty)[] = [
  'All',
  'Cardiology',
  'Neurology',
  'Pulmonology',
  'Gastroenterology',
  'Infectious Disease',
];

const GRADE_FILTERS: ('All' | Grade)[] = ['All', 'A+', 'A', 'B', 'C', 'F'];

const RESULT_FILTERS = ['All', 'Correct', 'Incorrect'] as const;
type ResultFilter = (typeof RESULT_FILTERS)[number];

export default function History() {
  const caseHistory = useUserStore((s) => s.caseHistory);
  const totalCasesPlayed = useUserStore((s) => s.totalCasesPlayed);
  const totalCorrectFirst = useUserStore((s) => s.totalCorrectFirst);

  const [specialty, setSpecialty] = useState<'All' | Specialty>('All');
  const [grade, setGrade] = useState<'All' | Grade>('All');
  const [result, setResult] = useState<ResultFilter>('All');

  const filtered = useMemo(() => {
    return caseHistory.filter((entry) => {
      if (specialty !== 'All' && entry.specialty !== specialty) return false;
      if (grade !== 'All' && entry.grade !== grade) return false;
      if (result === 'Correct' && !entry.wasCorrect) return false;
      if (result === 'Incorrect' && entry.wasCorrect) return false;
      return true;
    });
  }, [caseHistory, specialty, grade, result]);

  const accuracy =
    totalCasesPlayed > 0 ? Math.round((totalCorrectFirst / totalCasesPlayed) * 100) : 0;
  const avgScore =
    caseHistory.length > 0
      ? Math.round(caseHistory.reduce((sum, e) => sum + e.finalScore, 0) / caseHistory.length)
      : 0;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary mb-6">
          Case History
        </h1>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-card rounded-xl card-border p-4 text-center">
            <span className="font-mono font-bold text-xl text-text-primary">
              {totalCasesPlayed}
            </span>
            <p className="text-xs text-text-muted mt-1">Total Played</p>
          </div>
          <div className="bg-bg-card rounded-xl card-border p-4 text-center">
            <span className="font-mono font-bold text-xl text-text-primary">{accuracy}%</span>
            <p className="text-xs text-text-muted mt-1">Accuracy</p>
          </div>
          <div className="bg-bg-card rounded-xl card-border p-4 text-center">
            <span className="font-mono font-bold text-xl text-text-primary">{avgScore}</span>
            <p className="text-xs text-text-muted mt-1">Avg Score</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <FilterPills label="Specialty" options={SPECIALTY_FILTERS} value={specialty} onChange={setSpecialty} />
          <FilterPills label="Grade" options={GRADE_FILTERS} value={grade} onChange={setGrade} />
          <FilterPills label="Result" options={[...RESULT_FILTERS]} value={result} onChange={setResult} />
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="bg-bg-card rounded-xl card-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/8">
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">
                      Case
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">
                      Specialty
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">
                      Your Diagnosis
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-text-muted">
                      Score
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-text-muted">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtered.map((entry, i) => (
                    <tr key={entry.caseId + i} className="hover:bg-bg-elevated/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/case/${entry.caseId}/debrief`}
                          className="font-medium text-text-primary hover:text-accent-primary transition-colors"
                        >
                          {entry.caseTitle}
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5 md:hidden">
                          {entry.specialty}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                        {entry.specialty}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={
                            entry.wasCorrect ? 'text-accent-success' : 'text-accent-danger'
                          }
                        >
                          {entry.studentDiagnosis || '—'}
                        </span>
                        {!entry.wasCorrect && (
                          <p className="text-xs text-text-muted">
                            Correct: {entry.correctDiagnosis}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-accent-primary">
                        {entry.finalScore}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <GradeBadge grade={entry.grade} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted">
              {caseHistory.length === 0
                ? 'No cases played yet. Go solve some!'
                : 'No cases match your filters.'}
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-text-muted font-medium mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
              value === opt
                ? 'bg-accent-primary text-white border-accent-primary'
                : 'bg-bg-card text-text-secondary border-black/10 hover:border-accent-primary/40'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
