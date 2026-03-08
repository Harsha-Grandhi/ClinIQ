import { useState, useCallback, useEffect } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import type { HistoryCard as HistoryCardType } from '../../types';

const yieldDot: Record<string, string> = {
  high: 'bg-accent-success',
  medium: 'bg-accent-warning',
  low: 'bg-text-muted',
};

interface HistoryCardProps {
  card: HistoryCardType;
  isRevealed: boolean;
  onReveal: (id: string) => void;
}

export function HistoryCardComponent({ card, isRevealed, onReveal }: HistoryCardProps) {
  const [flipped, setFlipped] = useState(isRevealed);

  // Sync local state when isRevealed changes (e.g. new case loaded)
  useEffect(() => {
    setFlipped(isRevealed);
  }, [isRevealed]);

  const handleClick = useCallback(() => {
    if (flipped) return;
    setFlipped(true);
    onReveal(card.id);
  }, [flipped, card.id, onReveal]);

  return (
    <div
      className="flip-card cursor-pointer group"
      onClick={handleClick}
    >
      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front — question side */}
        <div className="flip-card-front bg-bg-card card-border p-4 flex flex-col items-center justify-center text-center gap-3 group-hover:shadow-lg transition-shadow">
          <MessageCircleQuestion size={24} className="text-accent-primary" />
          <p className="text-sm font-medium text-text-secondary">{card.question}</p>
          <span className="text-xs text-accent-danger font-mono">-5 pts</span>
        </div>

        {/* Back — answer side */}
        <div className="flip-card-back bg-bg-elevated card-border flex flex-col">
          {/* Scrollable answer area */}
          <div className="flex-1 overflow-y-auto p-4 pb-2">
            <p className="text-xs font-medium text-text-muted mb-2">{card.question}</p>
            <p className="text-sm text-text-primary leading-relaxed">{card.answer}</p>
          </div>
          {/* Yield tag — always visible at bottom */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-black/8 bg-bg-elevated shrink-0">
            <span className={`w-2 h-2 rounded-full ${yieldDot[card.yield]}`} />
            <span className="text-xs text-text-muted capitalize">{card.yield} yield</span>
          </div>
        </div>
      </div>
    </div>
  );
}
