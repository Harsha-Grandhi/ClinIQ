import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Wind, Pill, Bug, ArrowRight, Stethoscope } from 'lucide-react';
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
  const initUser = useUserStore((s) => s.initUser);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [year, setYear] = useState<YearOfStudy | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>(
    SPECIALTIES.map((s) => s.name),
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

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
        {[0, 1, 2].map((i) => (
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

      <div className="w-full max-w-md relative overflow-hidden" style={{ minHeight: 400 }}>
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
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

          {step === 1 && (
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

          {step === 2 && (
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
