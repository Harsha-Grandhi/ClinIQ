import type { Urgency } from '../../types';

const urgencyColors: Record<Urgency, string> = {
  high: 'bg-accent-danger',
  medium: 'bg-accent-warning',
  low: 'bg-accent-success',
};

interface UrgencyDotProps {
  urgency: Urgency;
}

export function UrgencyDot({ urgency }: UrgencyDotProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${urgencyColors[urgency]}`}
      title={`${urgency} urgency`}
    />
  );
}
