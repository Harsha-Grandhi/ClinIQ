import { useCallback } from 'react';
import { HistoryCardComponent } from './HistoryCard';
import { useGameStore } from '../../store/gameStore';
import type { HistoryCard } from '../../types';

interface HistoryTabProps {
  cards: HistoryCard[];
}

export function HistoryTab({ cards }: HistoryTabProps) {
  const historyAsked = useGameStore((s) => s.historyAsked);
  const askHistory = useGameStore((s) => s.askHistory);
  const sessionId = useGameStore((s) => s.sessionId);

  const handleReveal = useCallback(
    (id: string) => {
      askHistory(id);
    },
    [askHistory],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <HistoryCardComponent
          key={`${sessionId}-${card.id}`}
          card={card}
          isRevealed={historyAsked.includes(card.id)}
          onReveal={handleReveal}
        />
      ))}
    </div>
  );
}
