import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music2, ArrowRight, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/portal';

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. If you haven\'t signed up yet, enroll your child or apply to volunteer first.'
          : signInError.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Could not reach the server. Please check your internet connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md w-full px-6 py-32">
        <Reveal>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>

          <div className="mt-8 flex items-center gap-2">
            <Music2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="font-display text-xl font-semibold">Prelude<span className="text-primary">.</span></span>
          </div>

          <h1 className="mt-6 font-display text-4xl tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-foreground/70">
            Log in to access your portal. If you enrolled your child or applied to volunteer, use
            the email and password you signed up with.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground/70">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Link
              to="/reset-password"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <KeyRound className="w-4 h-4" /> Forgot your password? Change it here
            </Link>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {loading ? 'Signing in...' : 'Log in'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 space-y-2 text-sm text-foreground/60">
            <p>
              Haven't enrolled your child yet?{' '}
              <Link to="/lessons" className="text-primary font-medium hover:underline">Enroll now</Link>
            </p>
            <p>
              Want to volunteer?{' '}
              <Link to="/volunteer" className="text-primary font-medium hover:underline">Apply to teach</Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
