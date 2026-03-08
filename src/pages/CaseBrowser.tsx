import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAllCases } from '../hooks/useCase';
import { useUserStore } from '../store/userStore';
import { SpecialtyTag } from '../components/ui/SpecialtyTag';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { GradeBadge } from '../components/ui/Badge';
import { UrgencyDot } from '../components/ui/UrgencyDot';
import type { Specialty, Difficulty } from '../types';

const SPECIALTIES: ('All' | Specialty)[] = [
  'All',
  'Cardiology',
  'Neurology',
  'Pulmonology',
  'Gastroenterology',
  'Infectious Disease',
];

const DIFFICULTIES: ('All' | Difficulty)[] = ['All', 'Intern', 'Resident', 'Attending'];

const STATUSES = ['All', 'Unplayed', 'Played', 'Incorrect'] as const;
type StatusFilter = (typeof STATUSES)[number];

const specialtyBarColors: Record<Specialty, string> = {
  Cardiology: 'bg-cardiology',
  Neurology: 'bg-neurology',
  Pulmonology: 'bg-pulmonology',
  Gastroenterology: 'bg-gastroenterology',
  'Infectious Disease': 'bg-infectious',
};

export default function CaseBrowser() {
  const [searchParams] = useSearchParams();
  const cases = useAllCases();
  const caseHistory = useUserStore((s) => s.caseHistory);

  const initialSpecialty = (searchParams.get('specialty') as Specialty) || 'All';
  const [specialty, setSpecialty] = useState<'All' | Specialty>(
    SPECIALTIES.includes(initialSpecialty as Specialty) ? initialSpecialty : 'All',
  );
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>('All');
  const [status, setStatus] = useState<StatusFilter>('All');

  const playedMap = useMemo(() => {
    const map = new Map<string, { grade: string; wasCorrect: boolean }>();
    for (const entry of caseHistory) {
      if (!map.has(entry.caseId)) {
        map.set(entry.caseId, { grade: entry.grade, wasCorrect: entry.wasCorrect });
      }
    }
    return map;
  }, [caseHistory]);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (specialty !== 'All' && c.specialty !== specialty) return false;
      if (difficulty !== 'All' && c.difficulty !== difficulty) return false;

      const played = playedMap.get(c.id);
      if (status === 'Unplayed' && played) return false;
      if (status === 'Played' && !played) return false;
      if (status === 'Incorrect' && (!played || played.wasCorrect)) return false;

      return true;
    });
  }, [cases, specialty, difficulty, status, playedMap]);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary mb-6">
          Case Browser
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <FilterRow label="Specialty" options={SPECIALTIES} value={specialty} onChange={setSpecialty} />
          <FilterRow label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          <FilterRow label="Status" options={[...STATUSES]} value={status} onChange={setStatus} />
        </div>

        {/* Results count */}
        <p className="text-sm text-text-muted mb-4">
          {filtered.length} case{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Case grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const played = playedMap.get(c.id);
            return (
              <Link
                key={c.id}
                to={`/case/${c.id}`}
                className="relative bg-bg-card rounded-xl card-border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Specialty color bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${specialtyBarColors[c.specialty]}`} />

                <div className="p-4 pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-base text-text-primary group-hover:text-accent-primary transition-colors">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {played?.wasCorrect && (
                        <CheckCircle size={16} className="text-accent-success" />
                      )}
                      {played && (
                        <GradeBadge grade={played.grade as 'A+' | 'A' | 'B' | 'C' | 'F'} size="sm" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary mb-3">
                    {c.patient.age}{c.patient.gender} · {c.patient.occupation}
                  </p>

                  <div className="flex items-center gap-2">
                    <SpecialtyTag specialty={c.specialty} size="sm" showIcon={false} />
                    <DifficultyBadge difficulty={c.difficulty} />
                    <UrgencyDot urgency={c.urgency} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">No cases match your filters.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function FilterRow<T extends string>({
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
    <div className="flex-1">
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
