import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreCounterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreCounter({ score, size = 'md', showLabel = true }: ScoreCounterProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [flash, setFlash] = useState<'none' | 'down' | 'up'>('none');
  const prevScore = useRef(score);

  useEffect(() => {
    if (score === prevScore.current) return;

    const direction = score < prevScore.current ? 'down' : 'up';
    setFlash(direction);

    const start = prevScore.current;
    const diff = score - start;
    const duration = 400;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
    prevScore.current = score;

    const timeout = setTimeout(() => setFlash('none'), 600);
    return () => clearTimeout(timeout);
  }, [score]);

  const sizeClasses =
    size === 'sm'
      ? 'text-xl'
      : size === 'lg'
        ? 'text-5xl'
        : 'text-3xl';

  const flashColor =
    flash === 'down'
      ? 'text-accent-danger'
      : flash === 'up'
        ? 'text-accent-success'
        : 'text-accent-primary';

  return (
    <div className="flex flex-col items-center">
      {showLabel && (
        <span className="text-xs uppercase tracking-wider text-text-muted font-medium mb-1">
          Score
        </span>
      )}
      <motion.span
        className={`font-mono font-bold tabular-nums ${sizeClasses} ${flashColor}`}
        animate={
          flash === 'down'
            ? { x: [0, -4, 4, -4, 4, 0] }
            : flash === 'up'
              ? { scale: [1, 1.15, 1] }
              : {}
        }
        transition={{ duration: 0.4 }}
      >
        {displayScore}
      </motion.span>
    </div>
  );
}
