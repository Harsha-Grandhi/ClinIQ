import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  CheckCircle,
  Target,
  Flame,
  ArrowRight,
  Heart,
  Brain,
  Wind,
  Pill,
  Bug,
  Crown,
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useUserStore } from '../store/userStore';
import { useAllCases, getCaseOfTheDay } from '../hooks/useCase';
import { SpecialtyTag } from '../components/ui/SpecialtyTag';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { GradeBadge } from '../components/ui/Badge';
import { EloDisplay } from '../components/ui/EloDisplay';
import { StreakBadge } from '../components/ui/StreakBadge';
import { UrgencyDot } from '../components/ui/UrgencyDot';
import type { Specialty, CaseHistoryEntry } from '../types';
import type { LucideIcon } from 'lucide-react';

const specialtyNav: { name: Specialty; icon: LucideIcon; color: string }[] = [
  { name: 'Cardiology', icon: Heart, color: 'text-cardiology bg-cardiology/10' },
  { name: 'Neurology', icon: Brain, color: 'text-neurology bg-neurology/10' },
  { name: 'Pulmonology', icon: Wind, color: 'text-pulmonology bg-pulmonology/10' },
  { name: 'Gastroenterology', icon: Pill, color: 'text-gastroenterology bg-gastroenterology/10' },
  { name: 'Infectious Disease', icon: Bug, color: 'text-infectious bg-infectious/10' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma', elo: 1580 },
  { rank: 2, name: 'Rahul Deshmukh', elo: 1520 },
  { rank: 3, name: 'Ananya Iyer', elo: 1475 },
];

const crownColors = ['text-accent-warning', 'text-text-muted', 'text-accent-warning/60'];

export default function Dashboard() {
  const cases = useAllCases();
  const user = useUserStore();
  const caseOfDay = useMemo(() => getCaseOfTheDay(cases), [cases]);

  const alreadyPlayed = user.caseHistory.find((h) => h.caseId === caseOfDay.id);
  const accuracy =
    user.totalCasesPlayed > 0
      ? Math.round((user.totalCorrectFirst / user.totalCasesPlayed) * 100)
      : 0;
  const recentCases = user.caseHistory.slice(0, 3);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Status bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary">
              Welcome back, {user.name}
            </h1>
            <div className="mt-1">
              <EloDisplay elo={user.eloRating} size="sm" />
            </div>
          </div>
          <StreakBadge streak={user.currentStreak} />
        </div>

        {/* Case of the Day */}
        <CaseOfDayCard
          caseData={caseOfDay}
          played={alreadyPlayed ?? null}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard
            icon={<Target size={20} className="text-accent-primary" />}
            label="Cases Played"
            value={user.totalCasesPlayed}
          />
          <StatCard
            icon={<CheckCircle size={20} className="text-accent-success" />}
            label="Accuracy"
            value={`${accuracy}%`}
          />
          <StatCard
            icon={<Flame size={20} className="text-accent-secondary" />}
            label="Current Streak"
            value={user.currentStreak}
          />
        </div>

        {/* Recent Cases */}
        {recentCases.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg text-text-primary">Recent Cases</h2>
              <Link
                to="/history"
                className="text-sm text-accent-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {recentCases.map((entry) => (
                <RecentCaseCard key={entry.caseId + entry.playedAt} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by Specialty */}
        <section>
          <h2 className="font-display font-bold text-lg text-text-primary mb-3">
            Browse Cases
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {specialtyNav.map(({ name, icon: Icon, color }) => (
              <Link
                key={name}
                to={`/cases?specialty=${encodeURIComponent(name)}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl card-border hover:shadow-lg transition-shadow ${color}`}
              >
                <Icon size={28} />
                <span className="text-xs font-medium text-center">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Leaderboard Preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-text-primary">Leaderboard</h2>
            <Link
              to="/leaderboard"
              className="text-sm text-accent-primary hover:underline flex items-center gap-1"
            >
              Full board <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-bg-card rounded-xl card-border divide-y divide-black/8">
            {MOCK_LEADERBOARD.map(({ rank, name, elo }, i) => (
              <div key={rank} className="flex items-center gap-3 px-4 py-3">
                <Crown size={16} className={crownColors[i]} />
                <span className="font-mono text-sm font-bold text-text-muted w-6">
                  #{rank}
                </span>
                <span className="text-sm font-medium text-text-primary flex-1">{name}</span>
                <span className="font-mono text-sm text-accent-primary font-bold">{elo}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

// ── Sub-components ──

function CaseOfDayCard({
  caseData,
  played,
}: {
  caseData: ReturnType<typeof getCaseOfTheDay>;
  played: CaseHistoryEntry | null;
}) {
  const preview = caseData.presentation.slice(0, 140) + '...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative rounded-2xl bg-bg-card card-border overflow-hidden"
    >
      {/* Specialty color accent bar */}
      <SpecialtyBar specialty={caseData.specialty} />

      <div className="p-5 md:p-6 pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Case of the Day
            </span>
            <h3 className="font-display font-bold text-xl mt-1 text-text-primary">
              {caseData.title}
            </h3>
          </div>
          <UrgencyDot urgency={caseData.urgency} />
        </div>

        <p className="text-text-secondary text-sm leading-relaxed mb-4">{preview}</p>

        <div className="flex items-center gap-2 mb-5">
          <SpecialtyTag specialty={caseData.specialty} size="sm" />
          <DifficultyBadge difficulty={caseData.difficulty} />
          <span className="text-xs text-text-muted">
            {caseData.patient.age}{caseData.patient.gender} · {caseData.patient.occupation}
          </span>
        </div>

        {played ? (
          <div className="flex items-center gap-3">
            <GradeBadge grade={played.grade} />
            <span className="text-sm text-text-muted">
              Scored {played.finalScore} pts
            </span>
            <Link
              to={`/case/${caseData.id}/debrief`}
              className="ml-auto text-sm text-accent-primary hover:underline"
            >
              View debrief
            </Link>
          </div>
        ) : (
          <Link
            to={`/case/${caseData.id}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary text-white font-display font-bold rounded-xl hover:bg-accent-primary/90 transition-colors"
          >
            <Play size={18} />
            Play Today's Case
          </Link>
        )}
      </div>
    </motion.div>
  );
}

const specialtyBarColors: Record<Specialty, string> = {
  Cardiology: 'bg-cardiology',
  Neurology: 'bg-neurology',
  Pulmonology: 'bg-pulmonology',
  Gastroenterology: 'bg-gastroenterology',
  'Infectious Disease': 'bg-infectious',
};

function SpecialtyBar({ specialty }: { specialty: Specialty }) {
  return (
    <div className={`absolute top-0 left-0 right-0 h-1 ${specialtyBarColors[specialty]}`} />
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-bg-card rounded-xl card-border p-4 flex flex-col items-center text-center gap-2">
      {icon}
      <span className="font-mono font-bold text-xl text-text-primary">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

function RecentCaseCard({ entry }: { entry: CaseHistoryEntry }) {
  return (
    <Link
      to={`/case/${entry.caseId}/debrief`}
      className="flex-shrink-0 w-56 bg-bg-card rounded-xl card-border p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">{entry.specialty}</span>
        <GradeBadge grade={entry.grade} size="sm" />
      </div>
      <h4 className="text-sm font-medium text-text-primary truncate">{entry.caseTitle}</h4>
      <p className="text-xs text-text-muted mt-1">
        {entry.wasCorrect ? entry.correctDiagnosis : `Missed: ${entry.correctDiagnosis}`}
      </p>
    </Link>
  );
}
