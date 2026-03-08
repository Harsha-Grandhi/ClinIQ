import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <div
      className={`inline-flex items-center gap-1 ${
        size === 'sm' ? 'text-sm' : 'text-base'
      }`}
    >
      <Flame
        size={size === 'sm' ? 16 : 20}
        className={isActive ? 'text-accent-secondary' : 'text-text-muted'}
        fill={isActive ? 'currentColor' : 'none'}
      />
      <span
        className={`font-bold font-mono ${
          isActive ? 'text-text-primary' : 'text-text-muted'
        }`}
      >
        {streak}
      </span>
    </div>
  );
}
