import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Music2,
  BookOpen,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CalendarDays,
  CalendarRange,
  Plus,
  Trash2,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const specialties = [
  'Piano / Keys',
  'Violin',
  'Viola',
  'Cello',
  'Flute',
  'Clarinet',
  'Voice',
  'Other',
];

const availabilityOptions = ['Weekday evenings', 'Weekends', 'Flexible'];

const steps = [
  { icon: User, label: 'Identity' },
  { icon: Music2, label: 'Craft' },
  { icon: BookOpen, label: 'Story' },
  { icon: Calendar, label: 'Schedule' },
];

interface AvailabilitySlot {
  slot_type: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  instrument_specialty: string;
  notes: string;
}

export function VolunteerPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    instrument_specialty: specialties[0],
    instruments: [specialties[0]],
    experience_years: 5,
    teaching_experience: '',
    availability: 'Flexible',
    bio: '',
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({ ...f, email: user.email! }));
    }
  }, [user]);

  const update = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleInstrument = (opt: string) =>
    setForm((f) => {
      const current = f.instruments.includes(opt)
        ? f.instruments.filter((i) => i !== opt)
        : [...f.instruments, opt];
      let instruments = current;
      if (instruments.length === 0) instruments = [specialties[0]];
      return { ...f, instruments, instrument_specialty: instruments.join(', ') };
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    let userId: string | undefined = user?.id;

    try {
      if (user) {
        const { data: existing } = await supabase
          .from('volunteer_applications')
          .select('id')
          .eq('email', form.email)
          .maybeSingle();
        if (existing) {
          setError('You already have a volunteer application on file. Please log in to your portal.');
          setSubmitting(false);
          return;
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password,
        });

        if (authError) {
          if (authError.message === 'User already registered') {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: form.email,
              password,
            });
            if (signInError) {
              setError('An account with this email already exists. Please log in with your previous password, or use a different email.');
              setSubmitting(false);
              return;
            }
            userId = signInData.user?.id;

            const { data: existing } = await supabase
              .from('volunteer_applications')
              .select('id')
              .eq('email', form.email)
              .maybeSingle();
            if (existing) {
              setError('You already have a volunteer application on file. Please log in to your portal.');
              setSubmitting(false);
              return;
            }
          } else {
            setError(authError.message);
            setSubmitting(false);
            return;
          }
        } else {
          userId = authData.user?.id;
        }
      }

      const { error: appError } = await supabase.from('volunteer_applications').insert({
        ...form,
        experience_years: Number(form.experience_years) || 0,
        status: 'Pending',
        user_id: userId,
      });

      if (appError) throw appError;

      if (slots.length > 0) {
        await supabase.from('volunteer_availability').insert(
          slots.map((s) => ({
            ...s,
            volunteer_name: form.full_name,
            volunteer_email: form.email,
            instrument_specialty: s.instrument_specialty || form.instrument_specialty,
            status: 'Open',
          }))
        );
      }

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
          <h1 className="mt-6 font-display text-4xl tracking-tight">Welcome to the orchestra.</h1>
          <p className="mt-4 text-foreground/70">
            Thank you, {form.full_name.split(' ')[0]}. Your application is in. Our coordinator will
            contact you at {form.email} to arrange an orientation and your first student match.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 text-primary font-semibold"
          >
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
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-10 md:pt-40">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">The Conductor's Application</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl text-balance">
              Volunteer to teach.
            </h1>
            <p className="mt-5 max-w-xl text-foreground/70 leading-relaxed">
              Musicians giving their craft forward. Teach from anywhere — all lessons
              happen online. A short, considered application — we treat your time as the gift it is.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <Reveal>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-foreground/40'}`}>
                  <s.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-[0.12em] hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="border border-border rounded-sm p-8 md:p-10 bg-background">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground/70">Full name</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Email</label>
                  <input
                    type="email"
                    required
                    disabled={!!user}
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {user && (
                    <p className="mt-1.5 text-xs text-foreground/50">Using your account email.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={!form.full_name || !form.email}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground/70">Instrument specialty</label>
                  <p className="mt-1 text-xs text-foreground/50">Choose all that apply.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {specialties.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleInstrument(s)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                          form.instruments.includes(s)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Years of experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={form.experience_years}
                    onChange={(e) => update('experience_years', e.target.value)}
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Have you taught before?</label>
                  <textarea
                    rows={3}
                    value={form.teaching_experience}
                    onChange={(e) => update('teaching_experience', e.target.value)}
                    placeholder="e.g. 3 years private lessons, 2 years at a community music school"
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground/70">Why do you want to teach with us?</label>
                  <textarea
                    rows={5}
                    value={form.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    placeholder="Tell us what music means to you and why you want to pass it on."
                    className="mt-1.5 w-full px-4 py-3 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground/70">General availability</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availabilityOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update('availability', opt)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                          form.availability === opt
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
                  <label className="text-sm font-medium text-foreground/70">Available lesson times (optional)</label>
                  <p className="mt-1 text-xs text-foreground/50">
                    Add specific recurring slots so families can request them directly.
                  </p>
                  <SlotBuilder slots={slots} setSlots={setSlots} defaultSpecialty={form.instrument_specialty} />
                </div>

                {!user && (
                  <div>
                    <label className="text-sm font-medium text-foreground/70">Create a password</label>
                    <p className="mt-1 text-xs text-foreground/50">
                      You'll use this with your email to log in to the volunteer portal.
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

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
                  >
                    {submitting ? 'Submitting...' : 'Submit application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </Reveal>
      </section>
    </>
  );
}

function SlotBuilder({
  slots,
  setSlots,
  defaultSpecialty,
}: {
  slots: AvailabilitySlot[];
  setSlots: (s: AvailabilitySlot[]) => void;
  defaultSpecialty: string;
}) {
  const [slotType, setSlotType] = useState('recurring');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        slot_type: slotType,
        day_of_week: slotType === 'recurring' ? day : '',
        start_time: startTime,
        end_time: endTime,
        instrument_specialty: defaultSpecialty,
        notes,
      },
    ]);
    setNotes('');
  };

  const removeSlot = (i: number) => {
    setSlots(slots.filter((_, idx) => idx !== i));
  };

  const formatSlot = (s: AvailabilitySlot) => {
    if (s.slot_type === 'recurring') {
      return `${s.day_of_week} ${s.start_time}–${s.end_time}`;
    }
    return `One-off ${s.start_time}–${s.end_time}`;
  };

  return (
    <div className="mt-3 border border-border rounded-sm p-4 bg-muted/30">
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSlotType('recurring')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
            slotType === 'recurring' ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-background border-border'
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5 inline mr-1" /> Recurring
        </button>
        <button
          type="button"
          onClick={() => setSlotType('one-off')}
          className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
            slotType === 'one-off' ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-background border-border'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 inline mr-1" /> One-off
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {slotType === 'recurring' && (
          <div>
            <label className="text-xs font-medium text-foreground/60">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-foreground/60">Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground/60">End time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-foreground/60">Notes (optional)</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Comfortable with beginners; open to 30-min slots."
          className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        type="button"
        onClick={addSlot}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-cta text-cta-foreground text-sm font-medium rounded-sm hover:bg-cta/90 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add this time
      </button>

      {slots.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {slots.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-sm border border-border p-3 bg-background">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-secondary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium">{formatSlot(s)}</p>
                  {s.instrument_specialty && <p className="text-xs text-foreground/60">{s.instrument_specialty}</p>}
                  {s.notes && <p className="text-xs text-foreground/50 mt-0.5">{s.notes}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSlot(i)}
                className="text-foreground/40 hover:text-destructive transition-colors"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-foreground/50 italic">No times added yet.</p>
      )}
    </div>
  );
}
