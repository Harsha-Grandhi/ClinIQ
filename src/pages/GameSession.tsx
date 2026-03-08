import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PatientCard } from '../components/game/PatientCard';
import { DifferentialPanel } from '../components/game/DifferentialPanel';
import { DiagnosisInput } from '../components/game/DiagnosisInput';
import { InvestigationTabs } from '../components/game/InvestigationTabs';
import { GradeBadge } from '../components/ui/Badge';
import { useCase } from '../hooks/useCase';
import { useGameStore } from '../store/gameStore';
import { useUserStore } from '../store/userStore';
import type { CaseHistoryEntry } from '../types';

export default function GameSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseData = useCase(id);

  const startCase = useGameStore((s) => s.startCase);
  const currentCase = useGameStore((s) => s.currentCase);
  const currentScore = useGameStore((s) => s.currentScore);
  const diagnosisAttempts = useGameStore((s) => s.diagnosisAttempts);
  const isComplete = useGameStore((s) => s.isComplete);
  const isCorrect = useGameStore((s) => s.isCorrect);
  const finalScoring = useGameStore((s) => s.finalScoring);
  const historyAsked = useGameStore((s) => s.historyAsked);
  const examPerformed = useGameStore((s) => s.examPerformed);
  const labsOrdered = useGameStore((s) => s.labsOrdered);
  const imagingOrdered = useGameStore((s) => s.imagingOrdered);
  const differentialIncludedCorrect = useGameStore((s) => s.differentialIncludedCorrect);

  const addCaseResult = useUserStore((s) => s.addCaseResult);
  const savedRef = useRef(false);

  // Start case when component mounts or case changes
  useEffect(() => {
    if (caseData && (!currentCase || currentCase.id !== caseData.id)) {
      startCase(caseData);
      savedRef.current = false;
    }
  }, [caseData, currentCase, startCase]);

  // Save result when case completes (guard against double-fire in StrictMode)
  useEffect(() => {
    if (!isComplete || !finalScoring || !caseData || savedRef.current) return;
    savedRef.current = true;

    const entry: CaseHistoryEntry = {
      caseId: caseData.id,
      caseTitle: caseData.title,
      specialty: caseData.specialty,
      difficulty: caseData.difficulty,
      correctDiagnosis: caseData.correct_diagnosis,
      studentDiagnosis: diagnosisAttempts[diagnosisAttempts.length - 1] ?? '',
      wasCorrect: isCorrect ?? false,
      attemptsUsed: diagnosisAttempts.length,
      finalScore: finalScoring.score,
      grade: finalScoring.grade,
      eloChange: finalScoring.eloChange,
      playedAt: new Date().toISOString(),
      investigationsUsed: {
        history: [...historyAsked],
        exam: [...examPerformed],
        labs: [...labsOrdered],
        imaging: [...imagingOrdered],
      },
    };

    addCaseResult(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  if (!caseData) {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">Case not found.</p>
          <Link to="/cases" className="text-accent-primary hover:underline mt-2 inline-block">
            Back to cases
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (!currentCase) return null;

  return (
    <PageWrapper noPadding>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left panel */}
        <div className="w-full lg:w-[360px] shrink-0 p-4 pb-6 lg:p-5 lg:border-r border-black/8 lg:overflow-y-auto lg:max-h-screen lg:sticky lg:top-0 space-y-4">
          <PatientCard
            caseData={currentCase}
            currentScore={currentScore}
            attemptsUsed={diagnosisAttempts.length}
          />
          <DifferentialPanel />
          <DiagnosisInput />

          {/* Completion summary */}
          {isComplete && finalScoring && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card rounded-xl card-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Final Score</span>
                <span className="font-mono font-bold text-2xl text-accent-primary">
                  {finalScoring.score}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Grade</span>
                <GradeBadge grade={finalScoring.grade} size="lg" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">ELO Change</span>
                <span
                  className={`font-mono font-bold ${
                    finalScoring.eloChange >= 0 ? 'text-accent-success' : 'text-accent-danger'
                  }`}
                >
                  {finalScoring.eloChange > 0 ? '+' : ''}
                  {finalScoring.eloChange}
                </span>
              </div>

              {!isCorrect && (
                <div className="pt-2 border-t border-black/8">
                  <p className="text-xs text-text-muted">Correct diagnosis:</p>
                  <p className="text-sm font-bold text-text-primary">
                    {currentCase.correct_diagnosis}
                  </p>
                </div>
              )}

              {finalScoring.diagnosisBonus > 0 && (
                <p className="text-xs text-accent-primary">
                  +{finalScoring.diagnosisBonus} diagnosis bonus
                </p>
              )}
              {differentialIncludedCorrect && (
                <p className="text-xs text-accent-primary">+50 differential bonus</p>
              )}

              <button
                onClick={() => navigate(`/case/${caseData.id}/debrief`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-primary text-white font-display font-bold rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer"
              >
                {isCorrect ? 'See Debrief' : 'See What Went Wrong'}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <InvestigationTabs caseData={currentCase} />
        </div>
      </div>
    </PageWrapper>
  );
}
