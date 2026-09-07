import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { formatTimeRange } from '@/lib/time';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AvailabilitySlot {
  id: string;
  volunteer_name: string;
  volunteer_email: string;
  instrument_specialty: string;
  slot_type: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  one_off_date: string | null;
  notes: string;
}

interface Application {
  full_name: string;
  instrument_specialty: string;
}

export function SchedulePage() {
  const { user } = useAuth();
  const email = user?.email || '';
  const [application, setApplication] = useState<Application | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const loadSchedule = async () => {
    if (!email) return;
    setLoading(true);
    const [applicationResult, slotsResult] = await Promise.all([
      supabase
        .from('volunteer_applications')
        .select('full_name, instrument_specialty')
        .eq('email', email)
        .maybeSingle(),
      supabase
        .from('volunteer_availability')
        .select('*')
        .eq('volunteer_email', email)
        .order('day_of_week')
        .order('start_time'),
    ]);

    if (applicationResult.error || slotsResult.error) {
      setError('We could not load your schedule. Please try again.');
    } else {
      setApplication(applicationResult.data);
      setSlots((slotsResult.data || []) as AvailabilitySlot[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSchedule();
  }, [email]);

  const slotsByDay = useMemo(() => {
    return days.reduce<Record<string, AvailabilitySlot[]>>((grouped, day) => {
      grouped[day] = slots.filter((slot) => slot.day_of_week === day);
      return grouped;
    }, {});
  }, [slots]);

  const addSlot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!application || !email || startTime >= endTime) {
      setError('Choose a start time before the end time.');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);
    const { error: insertError } = await supabase.from('volunteer_availability').insert({
      volunteer_name: application.full_name,
      volunteer_email: email,
      instrument_specialty: application.instrument_specialty,
      slot_type: 'recurring',
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
      notes,
      status: 'Open',
    });

    if (insertError) {
      setError('This time could not be saved. Please try again.');
    } else {
      setNotes('');
      setSaved(true);
      await loadSchedule();
    }
    setSaving(false);
  };

  const removeSlot = async (slot: AvailabilitySlot) => {
    setError('');
    const { error: deleteError } = await supabase
      .from('volunteer_availability')
      .delete()
      .eq('id', slot.id)
      .eq('volunteer_email', email);

    if (deleteError) {
      setError('This time could not be removed. Please try again.');
    } else {
      setSlots((current) => current.filter((currentSlot) => currentSlot.id !== slot.id));
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 pt-32 pb-24 md:pt-40">
      <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-secondary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Volunteer Portal
      </Link>

      <Reveal>
        <div className="mt-8 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Teaching availability</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">Shape your week.</h1>
          <p className="mt-5 text-foreground/70 leading-relaxed">
            Add the recurring times you are available to teach. Families will see these open windows when they request a lesson.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <Reveal>
          <div className="border border-border rounded-sm bg-background overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <CalendarDays className="w-5 h-5 text-secondary" strokeWidth={1.5} />
              <div>
                <h2 className="font-display text-xl tracking-tight">Your weekly calendar</h2>
                <p className="text-sm text-foreground/60">Select a day to add an available window. All times are Eastern (EST).</p>
              </div>
            </div>
            {loading ? (
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                {days.slice(0, 4).map((day) => <div key={day} className="h-36 bg-background animate-pulse" />)}
              </div>
            ) : (
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                {days.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-36 bg-background p-4 text-left transition-colors hover:bg-secondary/5 ${selectedDay === day ? 'ring-2 ring-inset ring-secondary' : ''}`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/50">{day}</span>
                    <div className="mt-3 space-y-2">
                      {slotsByDay[day].length > 0 ? slotsByDay[day].map((slot) => (
                        <span key={slot.id} className="flex items-center gap-1.5 rounded-sm bg-secondary/10 px-2 py-1.5 text-xs text-secondary">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> {formatTimeRange(slot.start_time, slot.end_time)}
                        </span>
                      )) : <span className="text-xs italic text-foreground/35">No times added</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={addSlot} className="border border-border rounded-sm p-6 bg-card/40 lg:sticky lg:top-24">
            <h2 className="font-display text-xl tracking-tight">Add availability</h2>
            <p className="mt-1 text-sm text-foreground/60">Recurring every week</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/70">Day</label>
                <select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  {days.map((day) => <option key={day}>{day}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground/70">Starts</label>
                  <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Ends</label>
                  <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Note <span className="font-normal text-foreground/50">(optional)</span></label>
                <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="e.g. Best for beginner students" className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {saved && <p className="mt-4 flex items-center gap-2 text-sm text-accent-foreground"><CheckCircle2 className="w-4 h-4" /> Availability saved.</p>}
            <button type="submit" disabled={saving || loading} className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-secondary-foreground font-semibold rounded-sm hover:bg-secondary/90 transition-colors disabled:opacity-40">
              <Plus className="w-4 h-4" /> {saving ? 'Saving...' : 'Add to calendar'}
            </button>
          </form>
        </Reveal>
      </div>

      {!loading && slots.length > 0 && (
        <Reveal delay={0.15}>
          <div className="mt-8 border border-border rounded-sm p-6">
            <h2 className="font-display text-xl tracking-tight">All available windows</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {slots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between gap-4 border border-border rounded-sm px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{slot.day_of_week}</p>
                    <p className="mt-0.5 text-sm text-foreground/60">{formatTimeRange(slot.start_time, slot.end_time)}{slot.notes ? ` · ${slot.notes}` : ''}</p>
                  </div>
                  <button type="button" onClick={() => removeSlot(slot)} className="shrink-0 text-foreground/40 hover:text-destructive transition-colors" aria-label={`Remove ${slot.day_of_week} availability`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
