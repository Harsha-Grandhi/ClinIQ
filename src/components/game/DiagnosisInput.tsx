import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, X as XIcon } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { getAllDiagnoses } from '../../hooks/useCase';

export function DiagnosisInput() {
  const submitDiagnosis = useGameStore((s) => s.submitDiagnosis);
  const isComplete = useGameStore((s) => s.isComplete);
  const isCorrect = useGameStore((s) => s.isCorrect);
  const diagnosisAttempts = useGameStore((s) => s.diagnosisAttempts);
  const historyAsked = useGameStore((s) => s.historyAsked);
  const examPerformed = useGameStore((s) => s.examPerformed);
  const labsOrdered = useGameStore((s) => s.labsOrdered);
  const imagingOrdered = useGameStore((s) => s.imagingOrdered);

  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    remaining: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allDiagnoses = useMemo(() => getAllDiagnoses(), []);

  const totalInvestigations =
    historyAsked.length + examPerformed.length + labsOrdered.length + imagingOrdered.length;

  const canSubmit = totalInvestigations >= 3 || (
    historyAsked.length > 0 &&
    examPerformed.length > 0 &&
    labsOrdered.length > 0 &&
    imagingOrdered.length > 0
  );

  const suggestions = useMemo(() => {
    if (input.length < 2) return [];
    const lower = input.toLowerCase();
    return allDiagnoses
      .filter((d) => d.toLowerCase().includes(lower))
      .slice(0, 6);
  }, [input, allDiagnoses]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed.length === 0 || isComplete) return;

    const result = submitDiagnosis(trimmed);
    setLastResult({ correct: result.isCorrect, remaining: result.attemptsRemaining });
    if (result.isCorrect) {
      setInput(trimmed);
    } else {
      setInput('');
    }
    setShowSuggestions(false);
  }, [input, isComplete, submitDiagnosis]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const selectSuggestion = useCallback((suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  // Clear result message after delay
  useEffect(() => {
    if (lastResult && !lastResult.correct && !isComplete) {
      const timer = setTimeout(() => setLastResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastResult, isComplete]);

  if (!canSubmit && !isComplete) {
    return (
      <div className="bg-bg-card rounded-xl card-border p-4">
        <p className="text-xs text-text-muted text-center">
          Investigate more before diagnosing (minimum 3 investigations)
        </p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-xl p-4 text-center ${
          isCorrect
            ? 'bg-accent-success/10 border border-accent-success/30'
            : 'bg-accent-danger/10 border border-accent-danger/30'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          {isCorrect ? (
            <Check size={20} className="text-accent-success" />
          ) : (
            <XIcon size={20} className="text-accent-danger" />
          )}
          <span className={`font-display font-bold text-lg ${isCorrect ? 'text-accent-success' : 'text-accent-danger'}`}>
            {isCorrect ? 'Correct!' : 'Case Closed'}
          </span>
        </div>
        {!isCorrect && (
          <p className="text-sm text-text-secondary mt-1">
            All 3 attempts used
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl card-border p-4">
      <h4 className="font-display font-bold text-sm text-text-primary mb-3">
        Submit Diagnosis
      </h4>

      {/* Result feedback */}
      {lastResult && !lastResult.correct && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-accent-danger font-medium mb-2"
        >
          Not quite. {lastResult.remaining} attempt{lastResult.remaining !== 1 ? 's' : ''} remaining.
        </motion.p>
      )}

      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your diagnosis..."
            className="flex-1 px-3 py-2.5 text-sm bg-bg-surface rounded-lg text-text-primary placeholder:text-text-muted border border-black/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-shadow"
          />
          <button
            onClick={handleSubmit}
            disabled={input.trim().length === 0}
            className="px-4 py-2.5 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Send size={14} />
            Submit
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-12 mt-1 bg-bg-elevated rounded-lg border border-black/10 shadow-lg z-10 overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => selectSuggestion(s)}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-accent-primary/5 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Attempt indicators */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-xs text-text-muted mr-1">Attempts:</span>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < diagnosisAttempts.length ? 'bg-accent-danger' : 'bg-accent-primary/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
