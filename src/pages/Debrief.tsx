import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Pill,
  Sparkles,
  GraduationCap,
  MapPin,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GradeBadge } from '../components/ui/Badge';
import { SpecialtyTag } from '../components/ui/SpecialtyTag';
import { useCase, useAllCases } from '../hooks/useCase';
import { useUserStore } from '../store/userStore';

const sectionDelay = (i: number) => ({ delay: i * 0.08 });

export default function Debrief() {
  const { id } = useParams<{ id: string }>();
  const caseData = useCase(id);
  const allCases = useAllCases();
  const caseHistory = useUserStore((s) => s.caseHistory);

  const historyEntry = useMemo(() => {
    if (!id) return null;
    return caseHistory.find((h) => h.caseId === id) ?? null;
  }, [id, caseHistory]);

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

  const { debrief, optimal_path } = caseData;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div {...sectionDelay(0)}>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-primary mb-4"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary">
                {caseData.title}
              </h1>
              <p className="text-sm text-text-muted mt-1">
                {caseData.patient.age}{caseData.patient.gender} · {caseData.patient.occupation}
              </p>
              <div className="mt-2">
                <SpecialtyTag specialty={caseData.specialty} size="sm" />
              </div>
            </div>
            {historyEntry && <GradeBadge grade={historyEntry.grade} size="lg" />}
          </div>
        </motion.div>

        {/* Section 1 — Performance */}
        {historyEntry && (
          <Section index={1} icon={<BookOpen size={18} />} title="Your Performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your path */}
              <div className="bg-bg-elevated rounded-lg p-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Your Path
                </h4>
                <InvestigationList
                  label="History"
                  ids={historyEntry.investigationsUsed.history}
                  cost={5}
                />
                <InvestigationList
                  label="Exam"
                  ids={historyEntry.investigationsUsed.exam}
                  cost={10}
                />
                <InvestigationList
                  label="Labs"
                  ids={historyEntry.investigationsUsed.labs}
                  cost={20}
                />
                <InvestigationList
                  label="Imaging"
                  ids={historyEntry.investigationsUsed.imaging}
                  cost={35}
                />
                <div className="mt-3 pt-3 border-t border-black/8 flex justify-between">
                  <span className="text-sm font-medium text-text-secondary">Final Score</span>
                  <span className="font-mono font-bold text-accent-primary">
                    {historyEntry.finalScore}
                  </span>
                </div>
              </div>

              {/* Optimal path */}
              <div className="bg-accent-primary/5 rounded-lg p-4 border border-accent-primary/20">
                <h4 className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-2">
                  Optimal Path
                </h4>
                <InvestigationList label="History" ids={optimal_path.history_ids} cost={5} />
                <InvestigationList label="Exam" ids={optimal_path.exam_ids} cost={10} />
                <InvestigationList label="Labs" ids={optimal_path.lab_ids} cost={20} />
                <InvestigationList label="Imaging" ids={optimal_path.imaging_ids} cost={35} />
                <p className="text-xs text-text-secondary mt-3 leading-relaxed">
                  {optimal_path.explanation}
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* Section 2 — The Diagnosis */}
        <Section index={2} icon={<Sparkles size={18} />} title="The Diagnosis">
          <p className="text-xl font-display font-bold text-accent-primary">
            {caseData.correct_diagnosis}
          </p>
          {historyEntry && !historyEntry.wasCorrect && (
            <p className="text-sm text-accent-danger line-through mt-1">
              Your answer: {historyEntry.studentDiagnosis}
            </p>
          )}
        </Section>

        {/* Section 3 — Pathophysiology */}
        <Section index={3} icon={<BookOpen size={18} />} title="Pathophysiology">
          <p className="text-sm text-text-secondary leading-relaxed">
            {debrief.pathophysiology}
          </p>
          <div className="mt-4 bg-bg-elevated rounded-lg p-4">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
              Classic Presentation
            </h4>
            <p className="text-sm text-text-primary leading-relaxed">
              {debrief.classic_presentation}
            </p>
          </div>
        </Section>

        {/* Section 4 — Key Discriminators */}
        <Section index={4} icon={<AlertTriangle size={18} />} title="Key Discriminators">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {debrief.key_discriminators.map((d, i) => (
              <div
                key={i}
                className="bg-accent-primary/5 border border-accent-primary/20 rounded-lg px-4 py-3"
              >
                <p className="text-sm text-text-primary font-medium">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 5 — Common Mimics */}
        <Section index={5} icon={<AlertTriangle size={18} />} title="Common Mimics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {debrief.common_mimics.map((mimic, i) => (
              <div key={i} className="bg-bg-card rounded-xl card-border p-4">
                <h4 className="text-sm font-bold text-text-primary mb-1">
                  {typeof mimic === 'string' ? mimic : mimic.name ?? 'Unknown'}
                </h4>
                {typeof mimic !== 'string' && mimic.reason && (
                  <p className="text-xs text-text-muted">{mimic.reason}</p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Section 6 — Treatment */}
        <Section index={6} icon={<Pill size={18} />} title="Treatment">
          <div className="bg-accent-success/10 border border-accent-success/20 rounded-lg p-4">
            <p className="text-sm text-text-primary leading-relaxed">{debrief.treatment}</p>
          </div>
        </Section>

        {/* Section 7 — Clinical Pearl */}
        <Section index={7} icon={<Lightbulb size={18} />} title="Clinical Pearl">
          <div className="bg-accent-warning/10 border border-accent-warning/30 rounded-xl p-5">
            <p className="text-sm text-text-primary leading-relaxed font-medium">
              {debrief.clinical_pearl}
            </p>
          </div>
        </Section>

        {/* Section 8 — Attending's Note */}
        <Section index={8} icon={<GraduationCap size={18} />} title="Attending's Note">
          <div className="bg-bg-elevated rounded-xl p-6 border-l-4 border-accent-primary">
            <p className="text-sm text-text-primary leading-relaxed italic font-body">
              {debrief.attendings_note}
            </p>
          </div>
        </Section>

        {/* Section 9 — India Context */}
        <Section index={9} icon={<MapPin size={18} />} title="India Context">
          <p className="text-sm text-text-secondary leading-relaxed">
            {debrief.india_context}
          </p>
        </Section>

        {/* Section 10 — Learning Tags */}
        <Section index={10} icon={<Tag size={18} />} title="Learning Tags">
          <div className="flex flex-wrap gap-2">
            {debrief.learning_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-accent-tertiary/10 text-accent-primary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </Section>

        {/* Section 11 — Related Cases */}
        {caseData.related_cases.length > 0 && (
          <Section index={11} icon={<BookOpen size={18} />} title="Related Cases">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {caseData.related_cases.map((rc, i) => {
                const linkedCase = allCases.find(
                  (c) =>
                    c.title.toLowerCase().includes(rc.label.toLowerCase()) ||
                    rc.label.toLowerCase().includes(c.title.toLowerCase()),
                );

                const cardContent = (
                  <>
                    <h4 className="text-sm font-bold text-text-primary mb-1">{rc.label}</h4>
                    <p className="text-xs text-text-muted mb-2">{rc.teaser}</p>
                    <p className="text-xs text-accent-primary font-medium">{rc.teaches}</p>
                  </>
                );

                return linkedCase ? (
                  <Link
                    key={i}
                    to={`/case/${linkedCase.id}`}
                    className="bg-bg-card rounded-xl card-border p-4 hover:shadow-lg transition-shadow"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    key={i}
                    className="bg-bg-card rounded-xl card-border p-4 hover:shadow-lg transition-shadow"
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Bottom CTAs */}
        <div className="flex gap-3 pt-4 pb-8">
          <Link
            to="/"
            className="px-6 py-2.5 border border-black/10 text-text-secondary font-medium rounded-xl hover:bg-bg-elevated transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/cases"
            className="flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-white font-display font-bold rounded-xl hover:bg-accent-primary/90 transition-colors"
          >
            Next Case <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

// ── Helpers ──

function Section({
  index,
  icon,
  title,
  children,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent-primary">{icon}</span>
        <h2 className="font-display font-bold text-lg text-text-primary">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function InvestigationList({
  label,
  ids,
  cost,
}: {
  label: string;
  ids: string[];
  cost: number;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="mb-2">
      <span className="text-xs text-text-muted">{label}:</span>
      <span className="text-xs text-text-secondary ml-1">
        {ids.length} ({ids.length * cost} pts)
      </span>
    </div>
  );
}
