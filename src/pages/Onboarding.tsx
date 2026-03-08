import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Brain,
  Wind,
  Pill,
  Bug,
  ArrowRight,
  Stethoscope,
  ClipboardList,
  Search,
  ListChecks,
  Send,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserStore } from '../store/userStore';
import type { Specialty, YearOfStudy } from '../types';
import type { LucideIcon } from 'lucide-react';

const YEARS: YearOfStudy[] = ['3rd Year', '4th Year', '5th Year', 'Intern', 'PG Aspirant'];

const SPECIALTIES: { name: Specialty; icon: LucideIcon; color: string }[] = [
  { name: 'Cardiology', icon: Heart, color: 'text-cardiology border-cardiology/30 bg-cardiology/10' },
  { name: 'Neurology', icon: Brain, color: 'text-neurology border-neurology/30 bg-neurology/10' },
  { name: 'Pulmonology', icon: Wind, color: 'text-pulmonology border-pulmonology/30 bg-pulmonology/10' },
  { name: 'Gastroenterology', icon: Pill, color: 'text-gastroenterology border-gastroenterology/30 bg-gastroenterology/10' },
  { name: 'Infectious Disease', icon: Bug, color: 'text-infectious border-infectious/30 bg-infectious/10' },
];

const HOW_TO_PLAY_STEPS = [
  {
    icon: ClipboardList,
    title: 'Read the Case',
    description: 'You get a patient with symptoms, vitals, and a brief presentation. Read carefully — every detail matters.',
    color: 'text-accent-primary bg-accent-primary/10',
  },
  {
    icon: Search,
    title: 'Investigate',
    description: 'Ask history questions, perform physical exam, order labs and imaging. Each investigation costs points — be strategic!',
    color: 'text-pulmonology bg-pulmonology/10',
  },
  {
    icon: ListChecks,
    title: 'Build Your Differential',
    description: 'Add possible diagnoses to your differential list. You earn a bonus if the correct answer is on your list.',
    color: 'text-neurology bg-neurology/10',
  },
  {
    icon: Send,
    title: 'Submit Diagnosis',
    description: 'You get 3 attempts to name the correct diagnosis. Fewer investigations + first-attempt correct = higher score.',
    color: 'text-infectious bg-infectious/10',
  },
  {
    icon: BarChart3,
    title: 'Learn & Level Up',
    description: 'Review the debrief with pathophysiology, clinical pearls, and your ELO rating updates. Track your progress over time.',
    color: 'text-cardiology bg-cardiology/10',
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const initUser = useUserStore((s) => s.initUser);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [year, setYear] = useState<YearOfStudy | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>(
    SPECIALTIES.map((s) => s.name),
  );

  // Step indices — how-to-play screens inserted after welcome
  // Welcome → HowToPlay1 → HowToPlay2 → Signup (or skip) → About → Specialties
  const welcomeStep = 0;
  const howToPlay1Step = 1;
  const howToPlay2Step = 2;
  const signupStep = user ? -1 : 3;
  const aboutStep = user ? 3 : 4;
  const specialtyStep = user ? 4 : 5;
  const totalSteps = user ? 5 : 6;

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const handleSignUp = useCallback(async () => {
    if (!email.trim() || password.length < 6) return;

    setAuthLoading(true);
    setAuthError('');

    const { error } = await signUp(email.trim(), password);

    if (error) {
      setAuthError(error);
      setAuthLoading(false);
    } else {
      setAuthLoading(false);
      goNext();
    }
  }, [email, password, signUp, goNext]);

  const toggleSpecialty = useCallback((specialty: Specialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  }, []);

  const handleFinish = useCallback(() => {
    if (!year || !name.trim()) return;
    initUser(name.trim(), year, selectedSpecialties.length > 0 ? selectedSpecialties : SPECIALTIES.map((s) => s.name));
    navigate('/', { replace: true });
  }, [name, year, selectedSpecialties, initUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg-surface">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step
                ? 'bg-accent-primary w-6'
                : i < step
                  ? 'bg-accent-primary/50'
                  : 'bg-text-muted/30'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative overflow-hidden" style={{ minHeight: 500 }}>
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── Step 0: Welcome ── */}
          {step === welcomeStep && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-8">
                <Stethoscope size={40} className="text-accent-primary" />
              </div>

              <h1 className="font-display font-bold text-4xl md:text-5xl text-accent-primary mb-4 tracking-tight">
                ClinIQ
              </h1>
              <p className="text-text-secondary text-lg md:text-xl font-medium mb-2">
                Think like a doctor.
              </p>
              <p className="text-text-muted text-lg md:text-xl mb-12">
                Not like a student.
              </p>

              <button
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-3 bg-accent-primary text-white font-display font-bold text-lg rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer"
              >
                Let's start
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* ── Step 1: How to Play (part 1 — steps 1-3) ── */}
          {step === howToPlay1Step && (
            <motion.div
              key="howto1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display font-bold text-2xl mb-2 text-center text-text-primary">
                How It Works
              </h2>
              <p className="text-text-muted text-sm mb-8 text-center">
                Solve cases like a real doctor
              </p>

              <div className="w-full space-y-4 mb-8">
                {HOW_TO_PLAY_STEPS.slice(0, 3).map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="flex items-start gap-4 bg-bg-card rounded-xl card-border p-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary mb-0.5">
                        <span className="text-accent-primary mr-1.5">{i + 1}.</span>
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-3 bg-accent-primary text-white font-display font-bold text-lg rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer"
              >
                Next
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* ── Step 2: How to Play (part 2 — steps 4-5 + scoring) ── */}
          {step === howToPlay2Step && (
            <motion.div
              key="howto2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display font-bold text-2xl mb-2 text-center text-text-primary">
                How It Works
              </h2>
              <p className="text-text-muted text-sm mb-8 text-center">
                Diagnose, learn, and climb the ranks
              </p>

              <div className="w-full space-y-4 mb-6">
                {HOW_TO_PLAY_STEPS.slice(3).map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="flex items-start gap-4 bg-bg-card rounded-xl card-border p-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary mb-0.5">
                        <span className="text-accent-primary mr-1.5">{i + 4}.</span>
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Scoring quick reference */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="w-full bg-accent-primary/5 border border-accent-primary/15 rounded-xl p-4 mb-8"
              >
                <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-3">
                  Scoring Guide
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Base score</span>
                    <span className="font-mono font-bold text-text-primary">500 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">History card</span>
                    <span className="font-mono font-bold text-accent-danger">-5 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Exam finding</span>
                    <span className="font-mono font-bold text-accent-danger">-10 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Lab test</span>
                    <span className="font-mono font-bold text-accent-danger">-20 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Imaging</span>
                    <span className="font-mono font-bold text-accent-danger">-35 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Differential bonus</span>
                    <span className="font-mono font-bold text-accent-success">+50 pts</span>
                  </div>
                </div>
              </motion.div>

              <button
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-3 bg-accent-primary text-white font-display font-bold text-lg rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer"
              >
                Got it
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* ── Signup step (skipped if already logged in) ── */}
          {step === signupStep && (
            <motion.div
              key="signup"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display font-bold text-2xl mb-2 text-center text-text-primary">
                Create Account
              </h2>
              <p className="text-text-secondary text-sm mb-8 text-center">
                Sign up to save your progress across devices
              </p>

              {authError && (
                <div className="w-full bg-accent-danger/10 border border-accent-danger/20 rounded-lg px-4 py-2.5 mb-4">
                  <p className="text-sm text-accent-danger">{authError}</p>
                </div>
              )}

              <div className="w-full mb-4">
                <label className="block text-sm text-text-secondary mb-1.5 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-bg-card rounded-xl text-text-primary placeholder:text-text-muted card-border outline-none focus:ring-2 focus:ring-accent-primary/40 transition-shadow"
                  autoFocus
                />
              </div>

              <div className="w-full mb-8">
                <label className="block text-sm text-text-secondary mb-1.5 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 bg-bg-card rounded-xl text-text-primary placeholder:text-text-muted card-border outline-none focus:ring-2 focus:ring-accent-primary/40 transition-shadow"
                />
              </div>

              <button
                onClick={handleSignUp}
                disabled={authLoading || !email.trim() || password.length < 6}
                className="flex items-center gap-2 px-8 py-3 bg-accent-primary text-white font-display font-bold text-lg rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Creating account...' : 'Sign Up'}
                <ArrowRight size={20} />
              </button>

              <p className="text-text-muted text-xs mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── About You ── */}
          {step === aboutStep && (
            <motion.div
              key="about"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display font-bold text-2xl mb-8 text-center text-text-primary">
                About You
              </h2>

              <div className="w-full mb-8">
                <label className="block text-sm text-text-secondary mb-3 font-medium">
                  What year are you in?
                </label>
                <div className="flex flex-wrap gap-2">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => setYear(y)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                        year === y
                          ? 'bg-accent-primary text-white border-accent-primary'
                          : 'bg-bg-card text-text-secondary border-black/10 hover:border-black/25'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full mb-10">
                <label className="block text-sm text-text-secondary mb-3 font-medium">
                  Your name?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Arjun"
                  className="w-full px-4 py-3 bg-bg-card rounded-xl text-text-primary placeholder:text-text-muted card-border outline-none focus:ring-2 focus:ring-accent-primary/40 transition-shadow"
                  autoFocus
                />
              </div>

              <button
                onClick={goNext}
                disabled={!year || !name.trim()}
                className="flex items-center gap-2 px-8 py-3 bg-accent-primary text-white font-display font-bold text-lg rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* ── Specialty Preferences ── */}
          {step === specialtyStep && (
            <motion.div
              key="specialties"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display font-bold text-2xl mb-2 text-center text-text-primary">
                Specialty Preferences
              </h2>
              <p className="text-text-secondary text-sm mb-8 text-center">
                Which specialties interest you most?
              </p>

              <div className="w-full grid grid-cols-1 gap-3 mb-8">
                {SPECIALTIES.map(({ name: specName, icon: Icon, color }) => {
                  const isSelected = selectedSpecialties.includes(specName);
                  return (
                    <button
                      key={specName}
                      onClick={() => toggleSpecialty(specName)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? `${color} border-current/30`
                          : 'bg-bg-card text-text-muted border-black/8 hover:border-black/20'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-current/10' : 'bg-bg-elevated'
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="font-medium">{specName}</span>
                      <div className="ml-auto">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-current bg-current/20'
                              : 'border-text-muted/40'
                          }`}
                        >
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-3 bg-accent-primary text-white font-display font-bold text-lg rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer"
              >
                Start playing
                <ArrowRight size={20} />
              </button>

              <p className="text-text-muted text-xs mt-4">
                You can change this anytime in settings
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
