import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Stethoscope } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { ExamRegion } from '../../types';

const yieldDot: Record<string, string> = {
  high: 'bg-accent-success',
  medium: 'bg-accent-warning',
  low: 'bg-text-muted',
};

interface ExamTabProps {
  regions: ExamRegion[];
}

export function ExamTab({ regions }: ExamTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const examPerformed = useGameStore((s) => s.examPerformed);
  const performExam = useGameStore((s) => s.performExam);

  const toggleRegion = useCallback((region: string) => {
    setExpanded((prev) => (prev === region ? null : region));
  }, []);

  const handleExam = useCallback(
    (id: string) => {
      performExam(id);
    },
    [performExam],
  );

  return (
    <div className="space-y-2">
      {regions.map((region) => {
        const isExpanded = expanded === region.region;
        const revealedCount = region.findings.filter((f) =>
          examPerformed.includes(f.id),
        ).length;

        return (
          <div key={region.region} className="bg-bg-card rounded-xl card-border overflow-hidden">
            <button
              onClick={() => toggleRegion(region.region)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-bg-elevated/50 transition-colors"
            >
              <Stethoscope size={18} className="text-accent-primary shrink-0" />
              <span className="font-medium text-sm text-text-primary flex-1">
                {region.region}
              </span>
              {revealedCount > 0 && (
                <span className="text-xs text-text-muted">
                  {revealedCount}/{region.findings.length}
                </span>
              )}
              {isExpanded ? (
                <ChevronDown size={16} className="text-text-muted" />
              ) : (
                <ChevronRight size={16} className="text-text-muted" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 space-y-2">
                {region.findings.map((finding) => {
                  const revealed = examPerformed.includes(finding.id);
                  return (
                    <div key={finding.id}>
                      {revealed ? (
                        <div className="flex items-start gap-2 px-3 py-2 bg-bg-elevated rounded-lg">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${yieldDot[finding.yield]}`} />
                          <div>
                            <span className="text-xs font-medium text-text-muted">
                              {finding.name}
                            </span>
                            <p className="text-sm text-text-primary">{finding.result}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExam(finding.id)}
                          className="w-full text-left px-3 py-2 rounded-lg border border-black/8 hover:border-accent-primary/30 hover:bg-accent-primary/5 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">
                              {finding.name}
                            </span>
                            <span className="text-xs text-accent-danger font-mono">-10 pts</span>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
