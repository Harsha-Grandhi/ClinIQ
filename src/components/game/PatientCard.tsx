import { User } from 'lucide-react';
import { ScoreCounter } from '../ui/ScoreCounter';
import type { Case } from '../../types';

interface PatientCardProps {
  caseData: Case;
  currentScore: number;
  attemptsUsed: number;
}

export function PatientCard({ caseData, currentScore, attemptsUsed }: PatientCardProps) {
  const { patient, presentation } = caseData;

  return (
    <div className="space-y-4">
      {/* Patient info */}
      <div className="bg-bg-card rounded-xl card-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center">
            <User size={20} className="text-accent-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-text-primary">
              {patient.name}
            </h3>
            <p className="text-xs text-text-muted">
              {patient.age}{patient.gender} · {patient.occupation}
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{presentation}</p>
      </div>

      {/* Score + Attempts */}
      <div className="bg-bg-card rounded-xl card-border p-4 flex items-center justify-between">
        <ScoreCounter score={currentScore} size="md" />
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-text-muted font-medium">Attempts</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < attemptsUsed ? 'bg-accent-danger' : 'bg-accent-primary/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
