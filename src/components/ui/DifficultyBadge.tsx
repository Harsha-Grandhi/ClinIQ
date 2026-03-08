import type { Difficulty } from '../../types';

const difficultyColors: Record<Difficulty, string> = {
  Intern: 'bg-accent-success/15 text-accent-success border-accent-success/30',
  Resident: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
  Attending: 'bg-accent-danger/15 text-accent-danger border-accent-danger/30',
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${difficultyColors[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
