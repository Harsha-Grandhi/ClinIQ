import { getEloRank } from '../../utils/elo';
import { TrendingUp } from 'lucide-react';

interface EloDisplayProps {
  elo: number;
  showRank?: boolean;
  size?: 'sm' | 'md';
}

export function EloDisplay({ elo, showRank = true, size = 'md' }: EloDisplayProps) {
  const rank = getEloRank(elo);

  return (
    <div className={`inline-flex items-center gap-1.5 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
      <TrendingUp size={size === 'sm' ? 14 : 16} className="text-accent-primary" />
      {showRank && (
        <span className="text-text-secondary font-medium">{rank}</span>
      )}
      <span className="font-mono font-bold text-accent-primary">{elo}</span>
    </div>
  );
}
