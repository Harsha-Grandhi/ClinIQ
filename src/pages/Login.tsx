import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password) return;

      setLoading(true);
      setError('');

      const { error: err } = await signIn(email.trim(), password);

      if (err) {
        setError(err);
        setLoading(false);
      } else {
        navigate('/', { replace: true });
      }
    },
    [email, password, signIn, navigate],
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-4">
            <Stethoscope size={32} className="text-accent-primary" />
          </div>
          <h1 className="font-display font-bold text-3xl text-accent-primary tracking-tight">
            ClinIQ
          </h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-accent-danger/10 border border-accent-danger/20 rounded-lg px-4 py-2.5">
              <p className="text-sm text-accent-danger">{error}</p>
            </div>
          )}

          <div>
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

          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-bg-card rounded-xl text-text-primary placeholder:text-text-muted card-border outline-none focus:ring-2 focus:ring-accent-primary/40 transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-accent-primary text-white font-display font-bold text-lg rounded-xl hover:bg-accent-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          New here?{' '}
          <Link
            to="/onboarding"
            className="text-accent-primary hover:underline inline-flex items-center gap-1"
          >
            Create account <ArrowRight size={14} />
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
