import type { Grade } from '../../types';

const gradeColors: Record<Grade, string> = {
  'A+': 'bg-grade-aplus/20 text-grade-aplus border-grade-aplus/30',
  A: 'bg-grade-a/20 text-grade-a border-grade-a/30',
  B: 'bg-grade-b/20 text-grade-b border-grade-b/30',
  C: 'bg-grade-c/20 text-grade-c border-grade-c/30',
  F: 'bg-grade-f/20 text-grade-f border-grade-f/30',
};

interface BadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
}

export function GradeBadge({ grade, size = 'md' }: BadgeProps) {
  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-1.5 py-0.5'
      : size === 'lg'
        ? 'text-lg px-4 py-1.5'
        : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-display font-bold rounded-full border ${gradeColors[grade]} ${sizeClasses}`}
    >
      {grade}
    </span>
  );
}
