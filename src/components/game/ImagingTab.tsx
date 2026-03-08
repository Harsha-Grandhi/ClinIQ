import { useCallback } from 'react';
import { Image, FileText } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { ImagingOption } from '../../types';

const yieldDot: Record<string, string> = {
  high: 'bg-accent-success',
  medium: 'bg-accent-warning',
  low: 'bg-text-muted',
};

interface ImagingTabProps {
  options: ImagingOption[];
}

export function ImagingTab({ options }: ImagingTabProps) {
  const imagingOrdered = useGameStore((s) => s.imagingOrdered);
  const orderImaging = useGameStore((s) => s.orderImaging);

  const handleOrder = useCallback(
    (id: string) => {
      orderImaging(id);
    },
    [orderImaging],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((img) => {
        const ordered = imagingOrdered.includes(img.id);

        return (
          <div
            key={img.id}
            className="bg-bg-card rounded-xl card-border overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                  <Image size={20} className="text-accent-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-text-primary">{img.modality}</h4>
                  <p className="text-xs text-text-muted">{img.region}</p>
                </div>
                {ordered && (
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${yieldDot[img.yield]}`} />
                    <span className="text-xs bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full font-medium">
                      Reported
                    </span>
                  </div>
                )}
              </div>

              {ordered ? (
                <div className="bg-bg-elevated rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText size={12} className="text-text-muted" />
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      Report
                    </span>
                  </div>
                  <p className="text-sm text-text-primary font-mono leading-relaxed italic">
                    {img.report}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleOrder(img.id)}
                  className="w-full mt-2 py-2 border border-black/12 rounded-lg text-sm font-medium text-accent-primary hover:bg-accent-primary/5 hover:border-accent-primary/40 transition-all cursor-pointer"
                >
                  Order · -{img.cost_points} pts
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
