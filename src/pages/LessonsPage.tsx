import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Music2, BookOpen } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const instrumentOptions = [
  'Piano / Keys',
  'Violin',
  'Viola',
  'Cello',
  'Flute',
  'Clarinet',
  'Voice',
  'Other',
  'Not sure yet',
];

const benefits = [
  {
    icon: Music2,
    title: 'Free weekly lessons',
    body: 'One-on-one online teaching from a volunteer musician, at no cost to your family.',
  },
  {
    icon: BookOpen,
    title: 'Open courses',
    body: 'A free modular catalog your child and teacher move through together, at their own pace.',
  },
];

export function LessonsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    child_name: '',
    child_age: 8 as number | string,
    parent_name: '',
    parent_email: '',
    instrument_interest: instrumentOptions[0],
    instruments: [instrumentOptions[0]],
    notes: '',
  });
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({ ...f, parent_email: user.email! }));
    }
  }, [user]);

  const update = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleInstrument = (opt: string) =>
    setForm((f) => {
      const current = f.instruments.includes(opt)
        ? f.instruments.filter((i) => i !== opt)
        : [...f.instruments, opt];
      // If selecting "Not sure yet", clear others; if selecting anything else, remove "Not sure yet"
      let instruments = current;
      if (opt === 'Not sure yet' && current.includes(opt)) {
        instruments = [opt];
      } else if (opt !== 'Not sure yet' && current.includes(opt)) {
        instruments = current.filter((i) => i !== 'Not sure yet');
      }
      if (instruments.length === 0) instruments = [instrumentOptions[0]];
      return { ...f, instruments, instrument_interest: instruments.join(', ') };
    });

  const ageNum = Number(form.child_age);
  const ageOutOfRange = form.child_age !== '' && (isNaN(ageNum) || ageNum < 5 || ageNum > 13);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 13) {
      setError('Our program is for children ages 5–13. Please enter an age in that range.');
      return;
    }
    setSubmitting(true);
    setError('');

    let userId: string | undefined = user?.id;
    let isReturningUser = !!user;

    try {
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.parent_email,
          password,
        });

        if (authError) {
          if (authError.message === 'User already registered') {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: form.parent_email,
              password,
            });
            if (signInError) {
              setError('An account with this email already exists. Please log in with your previous password, or use a different email.');
              setSubmitting(false);
              return;
            }
            userId = signInData.user?.id;
            isReturningUser = true;
          } else {
            setError(authError.message);
            setSubmitting(false);
            return;
          }
        } else {
          userId = authData.user?.id;
        }
      }

      if (isReturningUser) {
        const { data: existing } = await supabase
          .from('lesson_enrollments')
          .select('id')
          .eq('parent_email', form.parent_email)
          .maybeSingle();
        if (existing) {
          setError('You already have an enrollment on file. Please log in to your portal.');
          setSubmitting(false);
          return;
        }
      }

      const { error: insertError } = await supabase.from('lesson_enrollments').insert({
        child_name: form.child_name,
        child_age: Number(form.child_age) || 0,
        parent_name: form.parent_name,
        parent_email: form.parent_email,
        instrument_interest: form.instrument_interest,
        notes: form.notes,
        status: 'Pending',
        user_id: userId,
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-40 pb-24 text-center">
        <Reveal>
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" strokeWidth={1.5} />
          <h1 className="mt-6 font-display text-4xl tracking-tight">Your child is on the list.</h1>
          <p className="mt-4 text-foreground/70">
            Thank you, {form.parent_name.split(' ')[0]}. We've received your enrollment for{' '}
            {form.child_name.split(' ')[0]}. Our coordinator will contact you at{' '}
            {form.parent_email} to match your child with a teacher and arrange their first lesson.
          </p>
          <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-primary font-semibold">
            Log in to your portal <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-10 md:pt-40">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Enrollment</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl text-balance">
              Sign your child up for free lessons.
            </h1>
            <p className="mt-5 max-w-xl text-foreground/70 leading-relaxed">
              Every child deserves a first note. Lessons are one-on-one, online, and completely free —
              and if your child doesn't have an instrument, we'll do our best to provide one.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Benefits */}
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight">What your child gets</h2>
            <div className="mt-8 space-y-6">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center">
                    <b.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg tracking-tight">{b.title}</h3>
                    <p className="mt-1 text-sm text-foreground/70 leading-relaxed">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-accent/30 rounded-sm border border-accent">
              <p className="text-accent-foreground leading-relaxed text-sm">
                <strong>How it works:</strong> Fill out the form, and a coordinator will contact you
                within a week to match your child with a volunteer teacher. Lessons happen online at
                a time that works for your family.
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1}>
            <form
              onSubmit={submit}
              className="border border-border rounded-sm p-8 bg-background space-y-5"
            >
              <h2 className="font-display text-2xl tracking-tight">Enrollment form</h2>

              <div>
                <label className="text-sm font-medium text-foreground/70">Child's name</label>
                <input
                  type="text"
                  required
                  value={form.child_name}
                  onChange={(e) => update('child_name', e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70">Child's age (5–13)</label>
                <input
                  type="number"
                  min="5"
                  max="13"
                  required
                  value={form.child_age}
                  onChange={(e) => update('child_age', e.target.value)}
                  className={`mt-1.5 w-full px-4 py-3 border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                    ageOutOfRange ? 'border-destructive' : 'border-input'
                  }`}
                />
                {ageOutOfRange && (
                  <p className="mt-1.5 text-sm text-destructive">
                    Our program is for children ages 5–13. Please enter an age in that range.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70">Parent / guardian name</label>
                <input
                  type="text"
                  required
                  value={form.parent_name}
                  onChange={(e) => update('parent_name', e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70">Parent / guardian email</label>
                <input
                  type="email"
                  required
                  disabled={!!user}
                  value={form.parent_email}
                  onChange={(e) => update('parent_email', e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {user && (
                  <p className="mt-1.5 text-xs text-foreground/50">Using your account email.</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70">Instrument interest</label>
                <p className="mt-1 text-xs text-foreground/50">Choose all that apply.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {instrumentOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInstrument(opt)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                        form.instruments.includes(opt)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70">Anything we should know? (optional)</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Does your child have any musical background? Any scheduling needs?"
                  className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {!user && (
                <div>
                  <label className="text-sm font-medium text-foreground/70">Create a password</label>
                  <p className="mt-1 text-xs text-foreground/50">
                    You'll use this with your email to log in to the student portal.
                  </p>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cta text-cta-foreground font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
              >
                {submitting ? 'Submitting...' : 'Enroll my child'}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
