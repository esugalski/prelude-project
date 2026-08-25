import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { supabase } from '@/lib/supabase';
import iconMark from '@/assets/brand/03_icon_mark_transparent.png';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'request' | 'reset'>('request');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setMode('reset');
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('Check your inbox — we sent you a verification link to change your password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Your password has been changed. Redirecting you to the portal...');
        setTimeout(() => navigate('/portal'), 2000);
      }
    } catch {
      setError('Something went wrong. Please try again.');
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
            <img src={iconMark} alt="" className="w-6 h-6 object-contain" />
            <span className="font-display text-xl font-semibold">Melody Mission</span>
          </div>

          {mode === 'request' ? (
            <>
              <h1 className="mt-6 font-display text-4xl tracking-tight">Change password.</h1>
              <p className="mt-3 text-foreground/70">
                Enter your email and we'll send you a verification link to set a new password.
              </p>

              <form onSubmit={handleRequestReset} className="mt-8 space-y-5">
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

                {error && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {message && (
                  <div className="flex items-start gap-2 text-sm text-accent-foreground">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cta text-cta-foreground font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send verification email {!loading && <ArrowRight className="w-4 h-4" />}</>}
                </button>
              </form>

              <div className="mt-8 text-sm text-foreground/60">
                <Link to="/login" className="text-primary font-medium hover:underline">Back to login</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-4xl tracking-tight">Set new password.</h1>
              <p className="mt-3 text-foreground/70">
                Your email has been verified. Choose a new password for your account.
              </p>

              <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground/70">New password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Confirm new password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {message && (
                  <div className="flex items-start gap-2 text-sm text-accent-foreground">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cta text-cta-foreground font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
                </button>
              </form>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
