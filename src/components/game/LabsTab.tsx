import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { LabPanel } from '../../types';

const flagColors: Record<string, string> = {
  critical: 'bg-accent-danger/15 text-accent-danger border-accent-danger/30',
  high: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
  low: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
  normal: 'bg-bg-elevated text-text-muted border-black/8',
};

interface LabsTabProps {
  panels: LabPanel[];
}

export function LabsTab({ panels }: LabsTabProps) {
  const labsOrdered = useGameStore((s) => s.labsOrdered);
  const orderLab = useGameStore((s) => s.orderLab);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleTest = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const orderSelected = useCallback(() => {
    for (const id of selected) {
      orderLab(id);
    }
    setSelected(new Set());
  }, [selected, orderLab]);

  const pendingCount = [...selected].filter((id) => !labsOrdered.includes(id)).length;

  return (
    <div className="space-y-4">
      {panels.map((panel) => (
        <div key={panel.panel} className="bg-bg-card rounded-xl card-border overflow-hidden">
          <div className="px-4 py-2.5 border-b border-black/8">
            <h4 className="text-sm font-display font-bold text-text-primary">{panel.panel}</h4>
          </div>

          <div className="divide-y divide-black/5">
            {panel.tests.map((test) => {
              const ordered = labsOrdered.includes(test.id);
              const isSelected = selected.has(test.id);

              return (
                <div key={test.id} className="px-4 py-2.5">
                  {ordered ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-text-primary font-medium">
                          {test.name}
                        </span>
                        <p className="text-xs text-text-muted mt-0.5">
                          Normal: {test.normal_range}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-mono font-bold px-2.5 py-0.5 rounded-full border ${flagColors[test.flag]}`}
                      >
                        {test.value}
                      </span>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTest(test.id)}
                        className="w-4 h-4 rounded accent-accent-primary"
                      />
                      <span className="text-sm text-text-secondary flex-1">{test.name}</span>
                      <span className="text-xs text-accent-danger font-mono">-20 pts</span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {pendingCount > 0 && (
        <button
          onClick={orderSelected}
          className="w-full py-2.5 bg-accent-primary text-white font-display font-bold rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer"
        >
          Order {pendingCount} Test{pendingCount > 1 ? 's' : ''} (-{pendingCount * 20} pts)
        </button>
      )}
    </div>
  );
}
