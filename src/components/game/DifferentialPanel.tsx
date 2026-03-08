import { useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export function DifferentialPanel() {
  const differential = useGameStore((s) => s.differential);
  const addToDifferential = useGameStore((s) => s.addToDifferential);
  const removeFromDifferential = useGameStore((s) => s.removeFromDifferential);
  const isComplete = useGameStore((s) => s.isComplete);
  const [input, setInput] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    addToDifferential(trimmed);
    setInput('');
  }, [input, addToDifferential]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd],
  );

  return (
    <div className="bg-bg-card rounded-xl card-border p-4">
      <h4 className="font-display font-bold text-sm text-text-primary mb-2">
        Your Differential
      </h4>
      <p className="text-xs text-text-muted mb-3">
        +50 pts if correct dx is on your differential before submitting
      </p>

      {!isComplete && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a diagnosis..."
            className="flex-1 px-3 py-2 text-sm bg-bg-surface rounded-lg text-text-primary placeholder:text-text-muted border border-black/8 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-shadow"
          />
          <button
            onClick={handleAdd}
            disabled={input.trim().length === 0}
            className="px-3 py-2 bg-accent-primary/10 text-accent-primary rounded-lg hover:bg-accent-primary/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {differential.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {differential.map((dx) => (
            <span
              key={dx}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-tertiary/10 text-accent-primary text-xs font-medium rounded-full"
            >
              {dx}
              {!isComplete && (
                <button
                  onClick={() => removeFromDifferential(dx)}
                  className="hover:text-accent-danger transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {differential.length === 0 && (
        <p className="text-xs text-text-muted italic">No diagnoses added yet</p>
      )}
    </div>
  );
}
