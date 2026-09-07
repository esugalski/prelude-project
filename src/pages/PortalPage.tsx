import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  XCircle,
  GraduationCap,
  UserCog,
  Handshake,
  AlertCircle,
  BookOpenCheck,
  Bell,
  UserCircle,
  Table,
  X,
  Mail,
  Phone,
  Music,
  StickyNote,
  CalendarDays,
  Plus,
  Trash2,
  Sparkles,
  Hourglass,
  LayoutGrid,
  ClipboardList,
  Loader2,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Save,
  Pencil,
  Video,
  KeyRound,
  MessageCircle,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { ProfileEditor } from '@/components/ProfileEditor';
import { ProfileCard, type VolunteerProfileView, type StudentProfileView } from '@/components/ProfileCard';
import { ChatBox, UnreadDot, useUnreadMatches } from '@/components/ChatBox';
import { supabase } from '@/lib/supabase';
import { formatTimeRange } from '@/lib/time';
import { useAuth } from '@/lib/auth';
import { courseData, courseTitles, courseDescriptions, instrumentFamilies } from '@/data/courses';

const childInstrumentOptions = [
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

interface Slot {
  id: string;
  volunteer_name: string;
  volunteer_email: string;
  instrument_specialty: string;
  slot_type: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  notes: string;
  status: string;
}

interface Enrollment {
  id: string;
  child_name: string;
  child_age: number;
  parent_name: string;
  parent_email: string;
  instrument_interest: string;
  notes: string;
  status: string;
  user_id: string | null;
  created_at?: string;
  profile_image_url?: string;
  profile_hobbies?: string;
  profile_learning_style?: string;
}

interface VolunteerApp {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  instrument_specialty: string;
  experience_years: number;
  teaching_experience: string;
  availability: string;
  bio: string;
  status: string;
  user_id: string | null;
  created_at?: string;
  profile_bio?: string;
  profile_image_url?: string;
  profile_hobbies?: string;
  profile_teaching_methods?: string;
  training_completed?: boolean;
  training_completed_at?: string | null;
  meet_link?: string | null;
}

interface Match {
  id: string;
  volunteer_id: string;
  enrollment_id: string;
  status: string;
}

export function PortalPage() {
  const { user, isAdmin } = useAuth();

  if (isAdmin) return <AdminPortal />;
  return <MemberPortal userEmail={user?.email || ''} />;
}

function MemberPortal({ userEmail }: { userEmail: string }) {
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase
      .from('volunteer_applications')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()
      .then(({ data }) => {
        setIsVolunteer(!!data);
        setChecking(false);
      });
  }, [userEmail]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
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
            <p className="text-xs uppercase tracking-[0.22em] text-primary">{isVolunteer ? 'Volunteer Portal' : 'Student Portal'}</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl text-balance">
              Welcome back.
            </h1>
            <p className="mt-5 max-w-xl text-foreground/70 leading-relaxed">
              {isVolunteer
                ? 'Manage your teaching schedule, training, and student connections.'
                : 'Browse available lesson times, courses, and track your enrollment.'}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal>
          <div className="flex justify-end mb-6">
            <Link
              to="/reset-password"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
            >
              <KeyRound className="w-4 h-4" /> Change password
            </Link>
          </div>
        </Reveal>
        {isVolunteer ? <VolunteerPortal userEmail={userEmail} /> : <StudentPortal userEmail={userEmail} />}
      </section>
    </>
  );
}

function StudentPortal({ userEmail }: { userEmail: string }) {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const [matchByEnrollment, setMatchByEnrollment] = useState<Record<string, VolunteerProfileView[]>>({});
  const [viewTab, setViewTab] = useState<'overview' | 'chat'>('overview');
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [showAddChild, setShowAddChild] = useState(false);

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [viewingVolunteer, setViewingVolunteer] = useState<VolunteerProfileView | null>(null);

  const selectedEnrollment = enrollments.find((e) => e.id === selectedEnrollmentId) ?? null;
  const matchedVolunteers = selectedEnrollmentId ? matchByEnrollment[selectedEnrollmentId] ?? [] : [];
  const activeChatTeacher = matchedVolunteers.find((v) => v.match_id === activeChatMatchId) ?? matchedVolunteers[0] ?? null;
  const visibleSlots = matchedVolunteers.length > 0
    ? slots.filter((s) => matchedVolunteers.some((v) => v.email === s.volunteer_email))
    : [];

  // Unread status across every one of this parent's children's teachers, not just the
  // currently selected child - the Chat tab dot should reflect the whole family.
  const allMatchIds = Object.values(matchByEnrollment)
    .flat()
    .map((v) => v.match_id)
    .filter((id): id is string => Boolean(id));
  const { unread: unreadMatches, markRead: markMatchRead } = useUnreadMatches(allMatchIds, 'volunteer');

  const refetchEnrollments = async () => {
    const { data } = await supabase
      .from('lesson_enrollments')
      .select('*')
      .eq('parent_email', userEmail)
      .order('created_at', { ascending: true });
    if (data) setEnrollments(data);
  };

  useEffect(() => {
    Promise.all([
      supabase
        .from('volunteer_availability')
        .select('*')
        .eq('status', 'Open')
        .order('created_at', { ascending: false }),
      supabase
        .from('lesson_enrollments')
        .select('*')
        .eq('parent_email', userEmail)
        .order('created_at', { ascending: true }),
    ]).then(async ([slotsRes, enrollRes]) => {
      setSlots(slotsRes.data || []);
      const enrolls = enrollRes.data || [];
      setEnrollments(enrolls);
      setSelectedEnrollmentId((prev) =>
        prev && enrolls.some((e) => e.id === prev) ? prev : enrolls[0]?.id ?? null
      );

      const matchable = enrolls
        .filter((e) => e.status === 'Matched' || e.status === 'Active')
        .map((e) => e.id);

      if (matchable.length > 0) {
        const { data: matchData } = await supabase
          .from('matches')
          .select('id, volunteer_id, enrollment_id')
          .in('enrollment_id', matchable);

        const volunteerIds = [...new Set((matchData || []).map((m) => m.volunteer_id))];

        if (volunteerIds.length > 0) {
          const { data: volData } = await supabase
            .from('volunteer_applications')
            .select('id, full_name, email, phone, instrument_specialty, experience_years, bio, profile_bio, profile_image_url, profile_hobbies, profile_teaching_methods, meet_link')
            .in('id', volunteerIds);

          const volById: Record<string, NonNullable<typeof volData>[number]> = {};
          (volData || []).forEach((v) => {
            volById[v.id] = v;
          });

          const matchMap: Record<string, VolunteerProfileView[]> = {};
          (matchData || []).forEach((m) => {
            const v = volById[m.volunteer_id];
            if (v) {
              if (!matchMap[m.enrollment_id]) matchMap[m.enrollment_id] = [];
              matchMap[m.enrollment_id].push({ kind: 'volunteer', ...v, match_id: m.id } as VolunteerProfileView);
            }
          });
          setMatchByEnrollment(matchMap);
        }
      }

      setLoading(false);
    });
  }, [userEmail]);

  const requestSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const slot = slots.find((s) => s.id === requestingId);
    if (!slot) return;
    setSubmitting(true);
    setError('');
    const name = studentName || selectedEnrollment?.parent_name || '';
    const email = userEmail || selectedEnrollment?.parent_email || '';
    const { error: insertError } = await supabase.from('slot_requests').insert({
      slot_id: requestingId,
      student_name: name,
      student_email: email,
      enrollment_id: selectedEnrollmentId,
      notes,
      status: 'Pending',
    });
    setSubmitting(false);
    if (insertError) {
      setError('Your request could not be sent. Please try again.');
      return;
    }
    setRequestingId(null);
    setDone(true);
  };

  return (
    <>
      <Reveal>
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          <div className="border border-border rounded-sm p-6 bg-background">
            <BookOpen className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <h3 className="mt-3 font-display text-lg tracking-tight">Browse courses</h3>
            <p className="mt-1 text-sm text-foreground/60">Move through free modular courses at your own pace.</p>
            <Link to={`/courses?enrollmentId=${selectedEnrollment?.id ?? ''}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all">
              Open courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="border border-border rounded-sm p-6 bg-background">
            <Calendar className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <h3 className="mt-3 font-display text-lg tracking-tight">Lesson times</h3>
            <p className="mt-1 text-sm text-foreground/60">Browse available lesson slots and request a time that works for you.</p>
            <a href="#lesson-times" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all">
              See available times <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Reveal>

      {enrollments.length > 0 && (
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {enrollments.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedEnrollmentId(e.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                  selectedEnrollmentId === e.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {e.child_name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAddChild(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-sm border border-dashed border-border text-foreground/60 hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" /> Add child
            </button>
          </div>
        </Reveal>
      )}

      {enrollments.length > 0 && (
        <Reveal>
          <div className="flex gap-2 mb-8">
            <button
              type="button"
              onClick={() => setViewTab('overview')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                viewTab === 'overview'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Overview
            </button>
            <button
              type="button"
              onClick={() => setViewTab('chat')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                viewTab === 'chat'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <MessageCircle className="w-4 h-4" /> Chat
              {unreadMatches.size > 0 && <UnreadDot className={viewTab === 'chat' ? 'bg-primary-foreground' : ''} />}
            </button>
          </div>
        </Reveal>
      )}

      {viewTab === 'overview' && (
      <>
      {selectedEnrollment && (
        <Reveal>
          <div className="border border-border rounded-sm p-6 bg-card/40 mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <h3 className="font-display text-lg tracking-tight">Your enrollment</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-foreground/50">Child</p>
                <p className="text-sm font-medium">{selectedEnrollment.child_name}, age {selectedEnrollment.child_age}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Instrument interest</p>
                <p className="text-sm font-medium">{selectedEnrollment.instrument_interest || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/50">Status</p>
                <p className="text-sm font-medium">
                  {selectedEnrollment.status === 'Pending' && (
                    <span className="inline-flex items-center gap-1.5 text-amber-700">
                      <Clock className="w-3.5 h-3.5" /> Pending review
                    </span>
                  )}
                  {selectedEnrollment.status === 'Accepted' && (
                    <span className="inline-flex items-center gap-1.5 text-accent-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accepted — waiting to be matched
                    </span>
                  )}
                  {selectedEnrollment.status === 'Rejected' && (
                    <span className="inline-flex items-center gap-1.5 text-destructive">
                      <XCircle className="w-3.5 h-3.5" /> Not accepted
                    </span>
                  )}
                  {selectedEnrollment.status === 'Matched' && (
                    <span className="inline-flex items-center gap-1.5 text-accent-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched with a volunteer
                    </span>
                  )}
                  {selectedEnrollment.status === 'Active' && (
                    <span className="inline-flex items-center gap-1.5 text-accent-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lessons active
                    </span>
                  )}
                </p>
              </div>
            </div>
            {matchedVolunteers.length > 0 && (
              <div className="mt-4 space-y-2">
                {matchedVolunteers.map((teacher) => (
                  <div
                    key={teacher.email}
                    className="flex flex-wrap items-center gap-3 border border-border rounded-sm p-3"
                  >
                    <div className="flex-1 min-w-[140px]">
                      <p className="text-xs uppercase tracking-[0.1em] text-secondary">
                        {teacher.instrument_specialty || 'Teacher'}
                      </p>
                      <p className="text-sm font-medium">{teacher.full_name}</p>
                    </div>
                    {teacher.meet_link && (
                      <a
                        href={teacher.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join session
                      </a>
                    )}
                    <button
                      onClick={() => setViewingVolunteer(teacher)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-sm hover:bg-secondary/90 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      View profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {selectedEnrollment && (
        <Reveal>
          <div className="mb-10">
            <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
              <UserCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
              {selectedEnrollment.child_name}'s profile
            </h3>
            <p className="text-sm text-foreground/60 mb-5">
              This is what your child's teacher will see. Add a photo and tell them about your child.
            </p>
            <div className="border border-border rounded-sm p-6 bg-background">
              <ProfileEditor
                key={selectedEnrollment.id}
                kind="student"
                enrollmentId={selectedEnrollment.id}
                initialHobbies={selectedEnrollment.profile_hobbies || ''}
                initialLearningStyle={selectedEnrollment.profile_learning_style || ''}
                initialImageUrl={selectedEnrollment.profile_image_url || ''}
                initialInstruments={selectedEnrollment.instrument_interest || ''}
                onSaved={refetchEnrollments}
              />
            </div>
          </div>
        </Reveal>
      )}

      <Reveal>
        <h2 id="lesson-times" className="font-display text-2xl tracking-tight mb-1">Available lesson times</h2>
        <p className="text-sm text-foreground/50 mb-5">All times are Eastern (EST).</p>
      </Reveal>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      ) : visibleSlots.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSlots.map((slot, i) => (
            <Reveal key={slot.id} delay={i * 0.05}>
              <div className="border border-border rounded-sm p-5 bg-background hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-secondary">{slot.instrument_specialty}</p>
                    <h3 className="mt-1.5 font-display text-lg tracking-tight">{slot.volunteer_name}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground rounded-sm">Open</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-foreground/60">
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  {slot.slot_type === 'recurring'
                    ? `${slot.day_of_week} ${formatTimeRange(slot.start_time, slot.end_time)}`
                    : `One-off ${formatTimeRange(slot.start_time, slot.end_time)}`}
                </div>
                {slot.notes && <p className="mt-2 text-xs text-foreground/50">{slot.notes}</p>}
                <button
                  onClick={() => setRequestingId(slot.id)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors"
                >
                  Request this slot
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="border border-dashed border-border rounded-sm p-12 text-center">
            <Calendar className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
            <p className="mt-4 text-foreground/60 max-w-md mx-auto">
              {matchedVolunteers.length > 0
                ? "Your matched teacher hasn't posted open lesson times yet. Check back soon."
                : "You'll see available lesson times here once we've matched your child with a teacher."}
            </p>
          </div>
        </Reveal>
      )}
      </>
      )}

      {viewTab === 'chat' && (
        <Reveal>
          <div className="mb-10">
            <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
              <MessageCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
              {selectedEnrollment ? `Chat for ${selectedEnrollment.child_name}` : 'Chat'}
            </h3>
            <p className="text-sm text-foreground/60 mb-5">
              Message your child's matched teacher{matchedVolunteers.length !== 1 ? 's' : ''} directly.
            </p>
            {matchedVolunteers.length === 0 ? (
              <div className="border border-dashed border-border rounded-sm p-12 text-center">
                <MessageCircle className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
                <p className="mt-4 text-foreground/60 max-w-md mx-auto">
                  You'll be able to chat here once your child is matched with a teacher.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                {matchedVolunteers.length > 1 && (
                  <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                    {matchedVolunteers.map((teacher) => {
                      const active = activeChatTeacher?.match_id === teacher.match_id;
                      return (
                        <button
                          key={teacher.match_id}
                          type="button"
                          onClick={() => setActiveChatMatchId(teacher.match_id ?? null)}
                          className={`shrink-0 text-left px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                            active
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          <p className="flex items-center gap-1.5">
                            {teacher.full_name}
                            {teacher.match_id && unreadMatches.has(teacher.match_id) && (
                              <UnreadDot className={active ? 'bg-primary-foreground' : ''} />
                            )}
                          </p>
                          <p className={`text-xs ${active ? 'text-primary-foreground/70' : 'text-foreground/50'}`}>
                            {teacher.instrument_specialty}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
                {activeChatTeacher?.match_id && (
                  <ChatBox
                    matchId={activeChatTeacher.match_id}
                    currentRole="parent"
                    currentEmail={userEmail}
                    counterpartName={activeChatTeacher.full_name}
                    counterpartSubtitle={activeChatTeacher.instrument_specialty}
                    unread={unreadMatches.has(activeChatTeacher.match_id)}
                    onRead={() => markMatchRead(activeChatTeacher.match_id!)}
                  />
                )}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {requestingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setRequestingId(null)}
        >
          <div
            className="w-full max-w-md bg-background border border-border rounded-sm p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl tracking-tight">Request this lesson time</h3>
            <form onSubmit={requestSlot} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/70">Your name</label>
                <input
                  type="text"
                  required
                  value={studentName || selectedEnrollment?.parent_name || ''}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={selectedEnrollment?.parent_name || ''}
                  className="mt-1.5 w-full px-4 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any questions or info for the teacher?"
                  className="mt-1.5 w-full px-4 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRequestingId(null)}
                  className="flex-1 py-2.5 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
                >
                  {submitting ? 'Sending...' : 'Send request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {done && (
        <Reveal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-foreground/40 backdrop-blur-sm" onClick={() => { setDone(false); setRequestingId(null); }}>
            <div className="w-full max-w-md bg-background border border-border rounded-sm p-10 text-center" onClick={(e) => e.stopPropagation()}>
              <CheckCircle2 className="w-10 h-10 text-primary mx-auto" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-2xl tracking-tight">Request sent!</h3>
              <p className="mt-3 text-foreground/70 max-w-md mx-auto">
                Your request has been submitted. The volunteer teacher will contact you at {userEmail} to confirm.
              </p>
              <button onClick={() => { setDone(false); setRequestingId(null); setStudentName(''); setNotes(''); }} className="mt-6 text-primary font-medium hover:underline">
                Browse more slots
              </button>
            </div>
          </div>
        </Reveal>
      )}

      {showAddChild && (
        <AddChildModal
          parentName={enrollments[0]?.parent_name ?? ''}
          parentEmail={userEmail}
          userId={user?.id}
          onClose={() => setShowAddChild(false)}
          onAdded={(newId) => {
            setShowAddChild(false);
            refetchEnrollments().then(() => setSelectedEnrollmentId(newId));
          }}
        />
      )}

      {viewingVolunteer && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" onClick={() => setViewingVolunteer(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-lg tracking-tight">{viewingVolunteer.full_name}'s profile</h3>
              <button onClick={() => setViewingVolunteer(null)} className="p-1.5 hover:bg-muted rounded-sm transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <ProfileCard profile={viewingVolunteer} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function AddChildModal({ parentName, parentEmail, userId, onClose, onAdded }: {
  parentName: string;
  parentEmail: string;
  userId?: string;
  onClose: () => void;
  onAdded: (newEnrollmentId: string) => void;
}) {
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number | string>(8);
  const [instruments, setInstruments] = useState<string[]>([childInstrumentOptions[0]]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ageInvalid = (() => {
    const n = Number(childAge);
    return childAge === '' || isNaN(n) || n < 5 || n > 13;
  })();

  const toggleInstrument = (opt: string) => {
    setInstruments((prev) => {
      let next = prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt];
      if (opt === 'Not sure yet' && next.includes(opt)) {
        next = [opt];
      } else if (opt !== 'Not sure yet' && next.includes(opt)) {
        next = next.filter((x) => x !== 'Not sure yet');
      }
      if (next.length === 0) next = [childInstrumentOptions[0]];
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ageInvalid) {
      setError('Our program is for children ages 5–13. Please enter an age in that range.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { data, error: insertError } = await supabase
      .from('lesson_enrollments')
      .insert({
        child_name: childName,
        child_age: Number(childAge),
        parent_name: parentName,
        parent_email: parentEmail,
        instrument_interest: instruments.join(', '),
        notes,
        status: 'Pending',
        user_id: userId,
      })
      .select('id')
      .single();
    setSubmitting(false);
    if (insertError || !data) {
      setError('Your child could not be added. Please try again.');
      return;
    }
    onAdded(data.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-background border border-border rounded-sm p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl tracking-tight">Add a child</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-sm transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/70">Child's name</label>
            <input
              type="text"
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="mt-1.5 w-full px-4 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/70">Child's age (5–13)</label>
            <input
              type="number"
              min="5"
              max="13"
              required
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className={`mt-1.5 w-full px-4 py-2.5 border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                ageInvalid ? 'border-destructive' : 'border-input'
              }`}
            />
            {ageInvalid && (
              <p className="mt-1.5 text-sm text-destructive">
                Our program is for children ages 5–13. Please enter an age in that range.
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/70">Instrument interest</label>
            <p className="mt-1 text-xs text-foreground/50">Choose all that apply.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {childInstrumentOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleInstrument(opt)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-sm border transition-colors ${
                    instruments.includes(opt)
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
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Does your child have any musical background? Any scheduling needs?"
              className="mt-1.5 w-full px-4 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Adding...' : 'Add child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface StudentProgress {
  enrollment_id: string;
  matchId: string;
  student_name: string;
  parent_email: string;
  instrument: string;
  child_age: number;
  parent_name: string;
  notes: string;
  profile_image_url?: string;
  profile_hobbies?: string;
  profile_learning_style?: string;
  progress: { instrument_family: string; movement_index: number }[];
}

interface VolunteerMessage {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface SessionLog {
  id: string;
  enrollment_id: string;
  session_date: string;
  duration_minutes: number;
  notes: string;
  confirmed: boolean;
  created_at: string;
}

interface AvailabilitySlot {
  id: string;
  volunteer_name: string;
  volunteer_email: string;
  instrument_specialty: string;
  slot_type: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  notes: string;
  status: string;
}

interface SlotRequest {
  id: string;
  slot_id: string;
  student_name: string;
  student_email: string;
  notes: string;
  status: string;
  created_at: string;
}

type VolunteerTab = 'overview' | 'upcoming' | 'hours' | 'calendar' | 'courses' | 'resources' | 'chat';

function VolunteerPortal({ userEmail }: { userEmail: string }) {
  const [application, setApplication] = useState<VolunteerApp | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [messages, setMessages] = useState<VolunteerMessage[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [tab, setTab] = useState<VolunteerTab>('overview');
  const [trainingComplete, setTrainingComplete] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('prelude-training-progress-v2');
      if (stored) {
        const progress = JSON.parse(stored) as boolean[];
        const allDone = progress.length > 0 && progress.every(Boolean);
        setTrainingComplete(allDone);
        if (allDone) {
          supabase.rpc('complete_volunteer_training').catch(() => {});
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const loadData = async () => {
    if (!userEmail) return;
    const { data: appData } = await supabase
      .from('volunteer_applications')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();
    setApplication(appData);

    if (appData?.status !== 'Approved') {
      setLoading(false);
      return;
    }

    const [matchRes, msgRes, slotsRes] = await Promise.all([
      supabase.from('matches').select('id, enrollment_id').eq('volunteer_id', appData.id),
      supabase.from('volunteer_messages').select('id, title, body, read, created_at').eq('volunteer_id', appData.id).order('created_at', { ascending: false }),
      supabase.from('volunteer_availability').select('*').eq('volunteer_email', userEmail).order('day_of_week').order('start_time'),
    ]);
    setMessages(msgRes.data || []);
    setAvailabilitySlots(slotsRes.data || []);

    const slotIds = (slotsRes.data || []).map((s) => s.id);
    if (slotIds.length > 0) {
      const { data: requestsData } = await supabase
        .from('slot_requests')
        .select('id, slot_id, student_name, student_email, notes, status, created_at')
        .in('slot_id', slotIds)
        .eq('status', 'Pending')
        .order('created_at', { ascending: false });
      setSlotRequests(requestsData || []);
    } else {
      setSlotRequests([]);
    }

    const enrollmentIds = (matchRes.data || []).map((m) => m.enrollment_id);
    const matchIdByEnrollment: Record<string, string> = {};
    (matchRes.data || []).forEach((m) => {
      matchIdByEnrollment[m.enrollment_id] = m.id;
    });
    if (enrollmentIds.length === 0) {
      setStudents([]);
      setSessionLogs([]);
      setLoading(false);
      return;
    }

    const [enrollRes, progRes, logRes] = await Promise.all([
      supabase.from('lesson_enrollments').select('id, child_name, child_age, parent_name, parent_email, instrument_interest, notes, profile_image_url, profile_hobbies, profile_learning_style').in('id', enrollmentIds),
      supabase.from('course_progress').select('enrollment_id, instrument_family, movement_index').in('enrollment_id', enrollmentIds),
      supabase.from('session_logs').select('id, enrollment_id, session_date, duration_minutes, notes, confirmed, created_at').in('enrollment_id', enrollmentIds).order('session_date', { ascending: false }),
    ]);

    const progressByEnrollment: Record<string, { instrument_family: string; movement_index: number }[]> = {};
    (progRes.data || []).forEach((p) => {
      if (!progressByEnrollment[p.enrollment_id]) progressByEnrollment[p.enrollment_id] = [];
      progressByEnrollment[p.enrollment_id].push({ instrument_family: p.instrument_family, movement_index: p.movement_index });
    });

    const studentList: StudentProgress[] = (enrollRes.data || []).map((e) => ({
      enrollment_id: e.id,
      matchId: matchIdByEnrollment[e.id],
      student_name: e.child_name,
      parent_email: e.parent_email,
      instrument: e.instrument_interest || 'Not specified',
      child_age: e.child_age,
      parent_name: e.parent_name,
      notes: e.notes || '',
      profile_image_url: e.profile_image_url,
      profile_hobbies: e.profile_hobbies,
      profile_learning_style: e.profile_learning_style,
      progress: progressByEnrollment[e.id] || [],
    }));
    setStudents(studentList);
    setSessionLogs(logRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userEmail]);

  const totalMinutes = sessionLogs.filter((s) => s.confirmed).reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSessions = sessionLogs.filter((s) => s.confirmed).length;
  const unconfirmedSessions = sessionLogs.filter((s) => !s.confirmed);

  const studentNameById = (enrollmentId: string) =>
    students.find((s) => s.enrollment_id === enrollmentId)?.student_name || 'Student';

  const chatMatchIds = students.map((s) => s.matchId).filter(Boolean);
  const { unread: unreadMatches, markRead: markMatchRead } = useUnreadMatches(chatMatchIds, 'parent');

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  const tabs: { id: VolunteerTab; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'hours', label: 'Hours Log', icon: Hourglass },
    { id: 'calendar', label: 'My Calendar', icon: CalendarDays },
    { id: 'courses', label: 'Courses', icon: BookOpenCheck },
    { id: 'resources', label: 'Resources', icon: FolderOpen },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ];

  return (
    <>
      {/* Welcome header */}
      <Reveal>
        <div className="relative overflow-hidden border border-border rounded-sm p-8 bg-gradient-to-br from-primary/10 via-card/40 to-background mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Volunteer Portal</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
              Welcome back, {application?.full_name?.split(' ')[0] || 'friend'}.
            </h2>
            <p className="mt-2 text-sm text-foreground/60 max-w-lg leading-relaxed">
              {application?.status === 'Approved'
                ? 'Here is your teaching dashboard. Log your sessions, manage your calendar, and track your students progress through their courses.'
                : application?.status === 'Pending'
                  ? 'Your application is under review. You will be notified once approved.'
                  : 'Welcome to the volunteer portal.'}
            </p>
            {application?.status === 'Approved' && (
              <div className="mt-5 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-background/60 rounded-sm border border-border">
                  <Hourglass className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <span className="text-sm font-semibold">{totalHours} hrs</span>
                  <span className="text-xs text-foreground/50">volunteered</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background/60 rounded-sm border border-border">
                  <Users className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                  <span className="text-sm font-semibold">{students.length}</span>
                  <span className="text-xs text-foreground/50">students</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background/60 rounded-sm border border-border">
                  <ClipboardList className="w-4 h-4 text-foreground/50" strokeWidth={1.5} />
                  <span className="text-sm font-semibold">{unconfirmedSessions.length}</span>
                  <span className="text-xs text-foreground/50">to confirm</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {application?.status !== 'Approved' ? (
        <Reveal>
          <div className="border border-border rounded-sm p-6 bg-card/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl tracking-tight">Your application</h3>
                <p className="mt-1 text-sm text-foreground/60">{application?.instrument_specialty} &middot; {application?.experience_years} yrs experience</p>
              </div>
              {application?.status === 'Pending' && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-sm">
                  <Clock className="w-3.5 h-3.5" /> Pending review
                </span>
              )}
              {application?.status === 'Denied' && (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-destructive/10 text-destructive rounded-sm">
                  <XCircle className="w-3.5 h-3.5" /> Denied
                </span>
              )}
            </div>
          </div>
        </Reveal>
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id ? 'text-primary' : 'text-foreground/50 hover:text-foreground/80'
                }`}
              >
                <t.icon className="w-4 h-4" strokeWidth={1.5} />
                {t.label}
                {t.id === 'hours' && unconfirmedSessions.length > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{unconfirmedSessions.length}</span>
                )}
                {t.id === 'chat' && unreadMatches.size > 0 && <UnreadDot />}
                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <>
              {messages.length > 0 && (
                <Reveal>
                  <div className="mb-8">
                    <h3 className="font-display text-xl tracking-tight flex items-center gap-2 mb-4">
                      <Bell className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                      Messages
                      {messages.filter((m) => !m.read).length > 0 && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                          {messages.filter((m) => !m.read).length} new
                        </span>
                      )}
                    </h3>
                    <div className="space-y-3">
                      {messages.slice(0, 3).map((msg) => (
                        <div key={msg.id} className={`border rounded-sm p-4 ${msg.read ? 'border-border bg-background' : 'border-secondary/40 bg-secondary/5'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-sm flex items-center gap-2">
                                {!msg.read && <span className="w-2 h-2 bg-secondary rounded-full" />}
                                {msg.title}
                              </p>
                              <p className="mt-1 text-sm text-foreground/70 leading-relaxed">{msg.body}</p>
                              <p className="mt-1.5 text-xs text-foreground/40">
                                {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            {!msg.read && (
                              <button
                                onClick={async () => {
                                  await supabase.from('volunteer_messages').update({ read: true }).eq('id', msg.id);
                                  setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
                                }}
                                className="text-xs text-foreground/50 hover:text-foreground whitespace-nowrap"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              <Reveal>
                <div className="grid gap-4 md:grid-cols-2 mb-8">
                  {trainingComplete ? (
                    <div className="border border-accent/50 rounded-sm p-6 bg-accent/20 flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-accent-foreground shrink-0" strokeWidth={1.5} />
                      <div>
                        <h3 className="font-display text-lg tracking-tight">Training complete</h3>
                        <p className="mt-1 text-sm text-foreground/60">You've finished all six training modules. You're ready to teach!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-secondary/40 rounded-sm p-6 bg-secondary/5">
                      <GraduationCap className="w-6 h-6 text-secondary" strokeWidth={1.5} />
                      <h3 className="mt-3 font-display text-lg tracking-tight">Volunteer training</h3>
                      <p className="mt-1 text-sm text-foreground/60">Complete the training on connecting with children before your first lesson.</p>
                      <Link to="/portal/training" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:gap-2.5 transition-all">
                        Start training <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                  <div className="border border-border rounded-sm p-6 bg-background">
                    <UserCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    <h3 className="mt-3 font-display text-lg tracking-tight">Your profile</h3>
                    <p className="mt-1 text-sm text-foreground/60">This is what matched students and parents will see.</p>
                    <button onClick={() => document.getElementById('volunteer-profile-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all">
                      Edit profile <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Reveal>

              <Reveal>
                <MeetLinkCard
                  volunteerId={application.id}
                  meetLink={application.meet_link || ''}
                  onSaved={(meetLink) => setApplication((current) => current ? { ...current, meet_link: meetLink } : current)}
                />
              </Reveal>

              <Reveal>
                <div className="mb-10" id="volunteer-profile-editor">
                  <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
                    <UserCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    Your profile
                  </h3>
                  <p className="text-sm text-foreground/60 mb-5">
                    This is what matched students and parents will see. Add a photo and tell them about yourself.
                  </p>
                  <div className="border border-border rounded-sm p-6 bg-background">
                    <ProfileEditor
                      kind="volunteer"
                      initialBio={application.profile_bio || ''}
                      initialImageUrl={application.profile_image_url || ''}
                      initialHobbies={application.profile_hobbies || ''}
                      initialTeachingMethods={application.profile_teaching_methods || ''}
                      initialInstruments={application.instrument_specialty || ''}
                    />
                  </div>
                </div>
              </Reveal>
            </>
          )}

          {/* UPCOMING SESSIONS TAB */}
          {tab === 'upcoming' && (
            <Reveal>
              <div className="mb-8">
                <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
                  <Calendar className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  Upcoming sessions
                </h3>
                <p className="text-sm text-foreground/60 mb-5">
                  Lessons scheduled with your students. Confirm each session after it happens.
                </p>

                {students.length === 0 ? (
                  <div className="border border-dashed border-border rounded-sm p-10 text-center">
                    <Users className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
                    <p className="mt-4 text-foreground/60 max-w-md mx-auto">
                      No students matched to you yet. Once matched, your upcoming sessions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => {
                      const studentSessions = sessionLogs.filter((s) => s.enrollment_id === student.enrollment_id);
                      const upcoming = studentSessions.filter((s) => new Date(s.session_date) >= new Date(new Date().toDateString()));
                      return (
                        <div key={student.enrollment_id} className="border border-border rounded-sm p-5 bg-background">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="font-display text-lg tracking-tight">{student.student_name}</h4>
                              <p className="text-sm text-foreground/60">{student.instrument} &middot; {student.parent_email}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              {application?.meet_link && (
                                <StartSessionButton meetLink={application.meet_link} />
                              )}
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary whitespace-nowrap hover:gap-2.5 transition-all"
                              >
                                View details <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {upcoming.length > 0 ? (
                            <div className="mt-4 space-y-2">
                              {upcoming.map((session) => (
                                <div key={session.id} className="flex items-center justify-between gap-3 rounded-sm border border-border px-4 py-3 bg-muted/30">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                                    <div>
                                      <p className="text-sm font-medium">
                                        {new Date(session.session_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                      </p>
                                      <p className="text-xs text-foreground/50">{session.duration_minutes} minutes</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-end gap-3">
                                    {application?.meet_link && <StartSessionButton meetLink={application.meet_link} compact />}
                                    {session.confirmed ? (
                                      <span className="inline-flex items-center gap-1.5 text-xs text-accent-foreground">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
                                        <Clock className="w-3.5 h-3.5" /> Awaiting confirmation
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-4 text-sm text-foreground/50">No upcoming sessions scheduled.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {/* HOURS LOG TAB */}
          {tab === 'hours' && (
            <Reveal>
              <div className="mb-8">
                <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
                  <Hourglass className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  Hours log
                </h3>
                <p className="text-sm text-foreground/60 mb-5">
                  Log each session after it happens and confirm it to count toward your total hours.
                </p>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <div className="border border-border rounded-sm p-5 bg-card/40">
                    <Hourglass className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <p className="mt-2 text-3xl font-display tracking-tight">{totalHours}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">Total hours volunteered</p>
                  </div>
                  <div className="border border-border rounded-sm p-5 bg-card/40">
                    <CheckCircle2 className="w-5 h-5 text-accent-foreground" strokeWidth={1.5} />
                    <p className="mt-2 text-3xl font-display tracking-tight">{totalSessions}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">Sessions confirmed</p>
                  </div>
                  <div className="border border-border rounded-sm p-5 bg-card/40">
                    <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                    <p className="mt-2 text-3xl font-display tracking-tight">{unconfirmedSessions.length}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">Awaiting confirmation</p>
                  </div>
                </div>

                <SessionLogForm students={students} volunteerId={application?.id} onLogged={loadData} />

                {/* Session log list */}
                <div className="mt-6">
                  <h4 className="font-display text-lg tracking-tight mb-3">All sessions</h4>
                  {sessionLogs.length === 0 ? (
                    <p className="text-sm text-foreground/50 border border-dashed border-border rounded-sm p-6 text-center">
                      No sessions logged yet. Use the form above to log a session after each lesson.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sessionLogs.map((session) => (
                        <div key={session.id} className="flex items-center justify-between gap-3 border border-border rounded-sm px-4 py-3 bg-background">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-foreground/40" strokeWidth={1.5} />
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(session.session_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-foreground/50">
                                  {studentNameById(session.enrollment_id)} &middot; {session.duration_minutes} min
                                </p>
                              </div>
                            </div>
                            {session.notes && (
                              <p className="text-xs text-foreground/50 italic hidden sm:block">&ldquo;{session.notes}&rdquo;</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {session.confirmed ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-accent-foreground">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                              </span>
                            ) : (
                              <button
                                onClick={async () => {
                                  await supabase.from('session_logs').update({ confirmed: true }).eq('id', session.id);
                                  setSessionLogs((prev) => prev.map((s) => s.id === session.id ? { ...s, confirmed: true } : s));
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:gap-2.5 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm session
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                await supabase.from('session_logs').delete().eq('id', session.id);
                                setSessionLogs((prev) => prev.filter((s) => s.id !== session.id));
                              }}
                              className="text-foreground/40 hover:text-destructive transition-colors"
                              aria-label="Delete session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* MY CALENDAR TAB */}
          {tab === 'calendar' && (
            <Reveal>
              <VolunteerCalendarTab userEmail={userEmail} application={application} slots={availabilitySlots} requests={slotRequests} onReload={loadData} />
            </Reveal>
          )}

          {/* RESOURCES TAB */}
          {tab === 'resources' && (
            <Reveal>
              <VolunteerResourcesTab volunteerId={application?.id || ''} students={students} />
            </Reveal>
          )}

          {/* CHAT TAB */}
          {tab === 'chat' && (
            <Reveal>
              <VolunteerChatTab
                students={students}
                userEmail={userEmail}
                unreadMatches={unreadMatches}
                onRead={markMatchRead}
              />
            </Reveal>
          )}

          {/* COURSES TAB */}
          {tab === 'courses' && (
            <Reveal>
              <div className="mb-8">
                <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
                  <BookOpenCheck className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  Courses &amp; student progress
                </h3>
                <p className="text-sm text-foreground/60 mb-5">
                  See which course modules each student has completed.
                </p>

                {students.length === 0 ? (
                  <div className="border border-dashed border-border rounded-sm p-10 text-center">
                    <Users className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
                    <p className="mt-4 text-foreground/60 max-w-md mx-auto">
                      No students matched to you yet. Once matched, their course progress will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => {
                      const familiesWithProgress = instrumentFamilies.filter(
                        (f) => f !== 'All' && student.progress.some((p) => p.instrument_family === f)
                      );
                      return (
                        <div key={student.enrollment_id} className="border border-border rounded-sm p-5 bg-background">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <h4 className="font-display text-lg tracking-tight hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedStudent(student)}>
                                {student.student_name}
                              </h4>
                              <p className="text-sm text-foreground/60">{student.instrument}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              {application?.meet_link && <StartSessionButton meetLink={application.meet_link} />}
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary whitespace-nowrap hover:gap-2.5 transition-all"
                              >
                                View profile <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {familiesWithProgress.length > 0 ? (
                            <div className="mt-4 space-y-3">
                              {familiesWithProgress.map((family) => {
                                const totalMovements = courseData[family]?.length || 0;
                                const completedCount = student.progress.filter((p) => p.instrument_family === family).length;
                                const pct = totalMovements > 0 ? Math.round((completedCount / totalMovements) * 100) : 0;
                                return (
                                  <div key={family}>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-medium">{family}</span>
                                      <span className="text-foreground/60">{completedCount} of {totalMovements} movements</span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-4 text-sm text-foreground/50">
                              No course progress yet. This student has not completed any quiz movements.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>
          )}
        </>
      )}

      {selectedStudent && (
        <StudentDetailDrawer
          student={selectedStudent}
          meetLink={application?.meet_link || ''}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
}

function MeetLinkCard({ volunteerId, meetLink, onSaved }: {
  volunteerId: string;
  meetLink: string;
  onSaved: (meetLink: string) => void;
}) {
  const [value, setValue] = useState(meetLink);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(meetLink);
  }, [meetLink]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      try {
        const url = new URL(trimmed);
        if (url.protocol !== 'https:' || url.hostname !== 'meet.google.com') throw new Error();
      } catch {
        setError('Paste a valid Google Meet link beginning with https://meet.google.com/');
        return;
      }
    }
    setSaving(true);
    setError('');
    setSaved(false);
    const { error: updateError } = await supabase
      .from('volunteer_applications')
      .update({ meet_link: trimmed || null })
      .eq('id', volunteerId);
    setSaving(false);
    if (updateError) {
      setError('Your Meet link could not be saved. Please try again.');
      return;
    }
    onSaved(trimmed);
    setSaved(true);
  };

  return (
    <div className="mb-10 border border-secondary/30 rounded-sm p-6 bg-secondary/5">
      <div className="flex items-start gap-4">
        <Video className="w-6 h-6 text-secondary shrink-0" strokeWidth={1.5} />
        <div className="flex-1">
          <h3 className="font-display text-xl tracking-tight">Your Google Meet room</h3>
          <p className="mt-1 text-sm text-foreground/60">
            Add your reusable Meet link once. Start session buttons will open it for every matched student.
          </p>
          <form onSubmit={save} className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="https://meet.google.com/abc-mnop-xyz"
              className="flex-1 px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-sm hover:bg-secondary/90 transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save link'}
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          {saved && <p className="mt-2 text-sm text-accent-foreground">Meet link saved. Your Start session buttons are ready.</p>}
        </div>
      </div>
    </div>
  );
}

function StartSessionButton({ meetLink, compact = false }: { meetLink: string; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => window.open(meetLink, '_blank', 'noopener,noreferrer')}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-sm transition-colors ${compact ? 'px-3 py-1.5 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'px-3.5 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90'}`}
    >
      <Video className="w-4 h-4" /> Start session
    </button>
  );
}

function SessionLogForm({ students, volunteerId, onLogged }: {
  students: StudentProgress[];
  volunteerId?: string;
  onLogged: () => void;
}) {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerId || !enrollmentId) {
      setError('Select a student first.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('session_logs').insert({
      volunteer_id: volunteerId,
      enrollment_id: enrollmentId,
      session_date: sessionDate,
      duration_minutes: Number(duration) || 30,
      notes,
      confirmed: false,
    });
    setSaving(false);
    if (insertError) {
      setError('Could not log session. Please try again.');
      return;
    }
    setNotes('');
    setDuration(30);
    onLogged();
  };

  if (students.length === 0) return null;

  return (
    <form onSubmit={submit} className="border border-border rounded-sm p-5 bg-card/40 space-y-4">
      <h4 className="font-display text-lg tracking-tight flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" strokeWidth={1.5} />
        Log a session
      </h4>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-foreground/60">Student</label>
          <select value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)} required className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select student...</option>
            {students.map((s) => (
              <option key={s.enrollment_id} value={s.enrollment_id}>{s.student_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground/60">Date</label>
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground/60">Duration (minutes)</label>
          <input type="number" min="5" max="180" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground/60">Notes (optional)</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you work on?" className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? 'Logging...' : 'Log session'}
      </button>
    </form>
  );
}

function VolunteerChatTab({ students, userEmail, unreadMatches, onRead }: {
  students: StudentProgress[];
  userEmail: string;
  unreadMatches: Set<string>;
  onRead: (matchId: string) => void;
}) {
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const activeStudent = students.find((s) => s.matchId === activeMatchId) ?? students[0] ?? null;

  return (
    <div className="mb-8">
      <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
        <MessageCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
        Chat
      </h3>
      <p className="text-sm text-foreground/60 mb-5">Message your matched students directly.</p>

      {students.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm p-12 text-center">
          <MessageCircle className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
          <p className="mt-4 text-foreground/60 max-w-md mx-auto">
            You'll be able to chat here once you're matched with a student.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          {students.length > 1 && (
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
              {students.map((student) => {
                const active = activeStudent?.matchId === student.matchId;
                return (
                  <button
                    key={student.matchId}
                    type="button"
                    onClick={() => setActiveMatchId(student.matchId)}
                    className={`shrink-0 text-left px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    <p className="flex items-center gap-1.5">
                      {student.student_name}
                      {unreadMatches.has(student.matchId) && (
                        <UnreadDot className={active ? 'bg-primary-foreground' : ''} />
                      )}
                    </p>
                    <p className={`text-xs ${active ? 'text-primary-foreground/70' : 'text-foreground/50'}`}>
                      {student.instrument}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
          {activeStudent && (
            <ChatBox
              matchId={activeStudent.matchId}
              currentRole="volunteer"
              currentEmail={userEmail}
              counterpartName={activeStudent.student_name}
              counterpartSubtitle={activeStudent.instrument}
              unread={unreadMatches.has(activeStudent.matchId)}
              onRead={() => onRead(activeStudent.matchId)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function VolunteerCalendarTab({ userEmail, application, slots, requests, onReload }: {
  userEmail: string;
  application: VolunteerApp | null;
  slots: AvailabilitySlot[];
  requests: SlotRequest[];
  onReload: () => void;
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState('');

  const respondToRequest = async (id: string, status: 'Accepted' | 'Declined') => {
    setRespondingId(id);
    setRequestError('');
    const { error: updateError } = await supabase.from('slot_requests').update({ status }).eq('id', id);
    setRespondingId(null);
    if (updateError) {
      setRequestError('This request could not be updated. Please try again.');
    } else {
      onReload();
    }
  };

  const slotsByDay = days.reduce<Record<string, AvailabilitySlot[]>>((grouped, day) => {
    grouped[day] = slots.filter((s) => s.day_of_week === day);
    return grouped;
  }, {});

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || startTime >= endTime) {
      setError('Choose a start time before the end time.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    const { error: insertError } = await supabase.from('volunteer_availability').insert({
      volunteer_name: application.full_name,
      volunteer_email: userEmail,
      instrument_specialty: application.instrument_specialty,
      slot_type: 'recurring',
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
      notes,
      status: 'Open',
    });
    setSaving(false);
    if (insertError) {
      setError('This time could not be saved. Please try again.');
    } else {
      setNotes('');
      setSaved(true);
      onReload();
    }
  };

  const removeSlot = async (slot: AvailabilitySlot) => {
    setError('');
    const { error: deleteError } = await supabase.from('volunteer_availability').delete().eq('id', slot.id).eq('volunteer_email', userEmail);
    if (deleteError) {
      setError('This time could not be removed. Please try again.');
    } else {
      onReload();
    }
  };

  return (
    <div className="mb-8">
      <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
        <CalendarDays className="w-6 h-6 text-primary" strokeWidth={1.5} />
        My calendar
      </h3>
      <p className="text-sm text-foreground/60 mb-5">
        Add the recurring times you are available to teach. Families will see these open windows when they request a lesson.
        All times are Eastern (EST).
      </p>

      {requests.length > 0 && (
        <div className="mb-8 border border-border rounded-sm bg-card/40 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <ClipboardList className="w-5 h-5 text-secondary" strokeWidth={1.5} />
            <div>
              <h4 className="font-display text-xl tracking-tight">Pending lesson requests</h4>
              <p className="text-sm text-foreground/60">Accept or decline requests for your open times.</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {requests.map((req) => {
              const slot = slots.find((s) => s.id === req.slot_id);
              return (
                <div key={req.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold">{req.student_name}</p>
                    <p className="mt-0.5 text-sm text-foreground/60">
                      {slot ? `${slot.day_of_week} · ${formatTimeRange(slot.start_time, slot.end_time)}` : 'Requested time'}
                      {req.notes ? ` · ${req.notes}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => respondToRequest(req.id, 'Accepted')}
                      disabled={respondingId === req.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-sm hover:bg-secondary/90 transition-colors disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => respondToRequest(req.id, 'Declined')}
                      disabled={respondingId === req.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-input rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {requestError && <p className="px-5 pb-4 text-sm text-destructive">{requestError}</p>}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="border border-border rounded-sm bg-background overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <CalendarDays className="w-5 h-5 text-secondary" strokeWidth={1.5} />
            <div>
              <h4 className="font-display text-xl tracking-tight">Your weekly calendar</h4>
              <p className="text-sm text-foreground/60">Select a day to add an available window.</p>
            </div>
          </div>
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
        </div>

        <form onSubmit={addSlot} className="border border-border rounded-sm p-6 bg-card/40 lg:sticky lg:top-24 h-fit">
          <h4 className="font-display text-xl tracking-tight">Add availability</h4>
          <p className="mt-1 text-sm text-foreground/60">Recurring every week</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/70">Day</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                {days.map((day) => <option key={day}>{day}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground/70">Starts</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Ends</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70">Note <span className="font-normal text-foreground/50">(optional)</span></label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Best for beginner students" className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          {saved && <p className="mt-4 flex items-center gap-2 text-sm text-accent-foreground"><CheckCircle2 className="w-4 h-4" /> Availability saved.</p>}
          <button type="submit" disabled={saving} className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-secondary-foreground font-semibold rounded-sm hover:bg-secondary/90 transition-colors disabled:opacity-40">
            <Plus className="w-4 h-4" /> {saving ? 'Saving...' : 'Add to calendar'}
          </button>
        </form>
      </div>

      {slots.length > 0 && (
        <div className="mt-8 border border-border rounded-sm p-6">
          <h4 className="font-display text-xl tracking-tight">All available windows</h4>
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
      )}
    </div>
  );
}

interface LessonPlan {
  id: string;
  title: string;
  student_name: string | null;
  lessons: LessonEntry[];
  created_at: string;
  updated_at: string;
}

interface LessonEntry {
  date: string;
  objective: string;
  activities: string;
  notes: string;
}

function VolunteerResourcesTab({ volunteerId, students }: {
  volunteerId: string;
  students: StudentProgress[];
}) {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState('All');

  const loadPlans = async () => {
    if (!volunteerId) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('volunteer_lesson_plans')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .order('updated_at', { ascending: false });
    setPlans((data || []) as LessonPlan[]);
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, [volunteerId]);

  const startNewPlan = () => {
    setEditingPlan(null);
    setShowEditor(true);
  };

  const startEditPlan = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setShowEditor(true);
  };

  const deletePlan = async (id: string) => {
    await supabase.from('volunteer_lesson_plans').delete().eq('id', id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const onSaved = () => {
    setShowEditor(false);
    setEditingPlan(null);
    loadPlans();
  };

  const families = Object.keys(courseData);
  const visibleFamilies = courseFilter === 'All' ? families : families.filter((f) => f === courseFilter);

  return (
    <div className="mb-8">
      <h3 className="font-display text-2xl tracking-tight flex items-center gap-2 mb-1">
        <FolderOpen className="w-6 h-6 text-primary" strokeWidth={1.5} />
        Resources
      </h3>
      <p className="text-sm text-foreground/60 mb-8">
        Plan lessons in advance and track your students' course progress.
      </p>

      {/* LESSON PLANS SECTION */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-display text-xl tracking-tight flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-secondary" strokeWidth={1.5} />
            Lesson plans
          </h4>
          <button
            onClick={startNewPlan}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New plan
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm p-10 text-center">
            <StickyNote className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
            <p className="mt-4 text-foreground/60 max-w-md mx-auto">
              No lesson plans yet. Create one to map out multiple lessons in advance — you can come back and edit it anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-border rounded-sm p-5 bg-background">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="font-display text-lg tracking-tight">{plan.title}</h5>
                    {plan.student_name && (
                      <p className="text-sm text-foreground/60 mt-0.5">For: {plan.student_name}</p>
                    )}
                    <p className="text-xs text-foreground/40 mt-1">
                      {plan.lessons.length} lesson{plan.lessons.length !== 1 ? 's' : ''} &middot;
                      Updated {new Date(plan.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEditPlan(plan)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-sm font-medium rounded-sm text-foreground/50 hover:text-destructive hover:border-destructive/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
                {plan.lessons.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {plan.lessons.map((lesson, i) => (
                      <div key={i} className="flex gap-3 text-sm border-l-2 border-primary/20 pl-3">
                        <div>
                          <p className="font-medium">
                            {lesson.date || `Lesson ${i + 1}`}
                          </p>
                          {lesson.objective && (
                            <p className="text-foreground/60 mt-0.5">{lesson.objective}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COURSES SECTION */}
      <div>
        <h4 className="font-display text-xl tracking-tight flex items-center gap-2 mb-5">
          <BookOpenCheck className="w-5 h-5 text-secondary" strokeWidth={1.5} />
          Courses &amp; student progress
        </h4>

        <div className="flex flex-wrap gap-2 mb-6">
          {instrumentFamilies.map((f) => (
            <button
              key={f}
              onClick={() => setCourseFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm border transition-colors ${
                courseFilter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {visibleFamilies.map((family) => {
            const movements = courseData[family];
            const isExpanded = expandedCourse === family;
            const enrolledStudents = students.filter(
              (s) => s.progress.some((p) => p.instrument_family === family)
            );
            return (
              <div key={family} className="border border-border rounded-sm bg-background overflow-hidden">
                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : family)}
                  className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-foreground/40 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-secondary">{family}</p>
                      <h5 className="font-display text-lg tracking-tight mt-0.5">{courseTitles[family]}</h5>
                      <p className="text-sm text-foreground/60 mt-1">{courseDescriptions[family]}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{movements.length} movements</p>
                    <p className="text-xs text-foreground/50">
                      {enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''} enrolled
                    </p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-5 bg-card/30">
                    {/* Movement list */}
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-[0.12em] text-foreground/50 mb-3">Movements</p>
                      <div className="space-y-2">
                        {movements.map((m, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <span className="font-display text-lg text-primary/30 w-6 shrink-0">{i + 1}</span>
                            <div>
                              <p className="font-medium">{m.name}</p>
                              <p className="text-foreground/60">{m.objective}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Student progress */}
                    {enrolledStudents.length > 0 ? (
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-foreground/50 mb-3">Student progress</p>
                        <div className="space-y-3">
                          {enrolledStudents.map((student) => {
                            const completedCount = student.progress.filter((p) => p.instrument_family === family).length;
                            const pct = movements.length > 0 ? Math.round((completedCount / movements.length) * 100) : 0;
                            return (
                              <div key={student.enrollment_id}>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{student.student_name}</span>
                                  <span className="text-foreground/60">{completedCount} of {movements.length} completed</span>
                                </div>
                                <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/50">
                        No students enrolled in this course yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showEditor && (
        <LessonPlanEditor
          volunteerId={volunteerId}
          existingPlan={editingPlan}
          students={students}
          onClose={() => { setShowEditor(false); setEditingPlan(null); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

function LessonPlanEditor({ volunteerId, existingPlan, students, onClose, onSaved }: {
  volunteerId: string;
  existingPlan: LessonPlan | null;
  students: StudentProgress[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(existingPlan?.title || '');
  const [studentName, setStudentName] = useState(existingPlan?.student_name || '');
  const [lessons, setLessons] = useState<LessonEntry[]>(
    existingPlan?.lessons?.length
      ? existingPlan.lessons
      : [{ date: '', objective: '', activities: '', notes: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateLesson = (index: number, field: keyof LessonEntry, value: string) => {
    setLessons((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const addLesson = () => {
    setLessons((prev) => [...prev, { date: '', objective: '', activities: '', notes: '' }]);
  };

  const removeLesson = (index: number) => {
    setLessons((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give your plan a title.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      volunteer_id: volunteerId,
      title: title.trim(),
      student_name: studentName.trim() || null,
      lessons: lessons.filter((l) => l.date || l.objective || l.activities || l.notes),
    };
    let result;
    if (existingPlan) {
      result = await supabase.from('volunteer_lesson_plans').update(payload).eq('id', existingPlan.id);
    } else {
      result = await supabase.from('volunteer_lesson_plans').insert(payload);
    }
    setSaving(false);
    if (result.error) {
      setError('Could not save the plan. Please try again.');
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto">
      <form onSubmit={save} className="relative w-full max-w-2xl bg-background border border-border rounded-sm shadow-lg my-8">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-sm">
          <h4 className="font-display text-xl tracking-tight">
            {existingPlan ? 'Edit lesson plan' : 'New lesson plan'}
          </h4>
          <button type="button" onClick={onClose} className="text-foreground/40 hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground/70">Plan title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Beginner violin — first month"
              className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/70">
              Student <span className="font-normal text-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              list="student-list"
              placeholder="Type or select a student"
              className="mt-1.5 w-full px-3 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <datalist id="student-list">
              {students.map((s) => (
                <option key={s.enrollment_id} value={s.student_name} />
              ))}
            </datalist>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground/70">Lessons</label>
              <button
                type="button"
                onClick={addLesson}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Add lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, i) => (
                <div key={i} className="border border-border rounded-sm p-4 bg-card/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/50">
                      Lesson {i + 1}
                    </span>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(i)}
                        className="text-foreground/40 hover:text-destructive transition-colors"
                        aria-label={`Remove lesson ${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground/60">Date</label>
                      <input
                        type="date"
                        value={lesson.date}
                        onChange={(e) => updateLesson(i, 'date', e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/60">Objective</label>
                      <input
                        type="text"
                        value={lesson.objective}
                        onChange={(e) => updateLesson(i, 'objective', e.target.value)}
                        placeholder="What should the student learn?"
                        className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/60">Activities</label>
                      <textarea
                        rows={2}
                        value={lesson.activities}
                        onChange={(e) => updateLesson(i, 'activities', e.target.value)}
                        placeholder="What will you do during the lesson?"
                        className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/60">Notes</label>
                      <textarea
                        rows={2}
                        value={lesson.notes}
                        onChange={(e) => updateLesson(i, 'notes', e.target.value)}
                        placeholder="Reminders, materials, follow-up..."
                        className="mt-1 w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-end gap-3 rounded-b-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save plan'}
          </button>
        </div>
      </form>
    </div>
  );
}

function isVolunteerReady(app: VolunteerApp): boolean {
  const hasProfile = Boolean(
    app.profile_bio || app.profile_image_url || app.profile_hobbies || app.profile_teaching_methods
  );
  return Boolean(app.training_completed && hasProfile);
}

function AdminPortal() {
  const [tab, setTab] = useState<'new' | 'volunteers' | 'matching' | 'schedule' | 'directory'>('new');
  const [detailRecord, setDetailRecord] = useState<{ type: 'child' | 'volunteer'; data: Enrollment | VolunteerApp } | null>(null);
  const [applications, setApplications] = useState<VolunteerApp[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<Slot[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<SlotRequest[]>([]);
  const [pendingSessions, setPendingSessions] = useState<SlotRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchVolunteer, setMatchVolunteer] = useState<string>('');
  const [matchEnrollment, setMatchEnrollment] = useState<string>('');
  const [matchError, setMatchError] = useState('');

  const loadData = () => {
    Promise.all([
      supabase.from('volunteer_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('lesson_enrollments').select('*').order('created_at', { ascending: false }),
      supabase.from('matches').select('*').order('created_at', { ascending: false }),
      supabase.from('volunteer_availability').select('*').order('volunteer_name').order('day_of_week').order('start_time'),
      supabase.from('slot_requests').select('*').in('status', ['Accepted', 'Pending']).order('created_at', { ascending: false }),
    ]).then(([appRes, enrollRes, matchRes, slotsRes, sessionsRes]) => {
      setApplications(appRes.data || []);
      setEnrollments(enrollRes.data || []);
      setMatches(matchRes.data || []);
      setAvailabilitySlots(slotsRes.data || []);
      setScheduledSessions((sessionsRes.data || []).filter((s) => s.status === 'Accepted'));
      setPendingSessions((sessionsRes.data || []).filter((s) => s.status === 'Pending'));
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateAppStatus = async (id: string, status: string) => {
    await supabase.from('volunteer_applications').update({ status }).eq('id', id);
    loadData();
  };

  const updateEnrollmentStatus = async (id: string, status: string) => {
    await supabase.from('lesson_enrollments').update({ status }).eq('id', id);
    loadData();
  };

  const updateTrainingStatus = async (id: string, trainingCompleted: boolean) => {
    await supabase.from('volunteer_applications').update({
      training_completed: trainingCompleted,
      training_completed_at: trainingCompleted ? new Date().toISOString() : null,
    }).eq('id', id);
    loadData();
  };

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchVolunteer || !matchEnrollment) return;
    setMatchError('');

    const alreadyMatched = matches.some(
      (m) => m.volunteer_id === matchVolunteer && m.enrollment_id === matchEnrollment
    );
    if (alreadyMatched) {
      setMatchError('This volunteer is already matched with this student.');
      return;
    }

    const { data: matchData, error: matchInsertError } = await supabase.from('matches').insert({
      volunteer_id: matchVolunteer,
      enrollment_id: matchEnrollment,
      status: 'Matched',
    }).select('id').single();

    if (matchInsertError || !matchData) {
      setMatchError('This match could not be created. Please try again.');
      return;
    }

    await supabase.from('lesson_enrollments').update({ status: 'Matched' }).eq('id', matchEnrollment);

    const volunteer = applications.find((a) => a.id === matchVolunteer);
    const enrollment = enrollments.find((e2) => e2.id === matchEnrollment);
    if (volunteer && enrollment) {
      await supabase.from('volunteer_messages').insert({
        volunteer_id: matchVolunteer,
        match_id: matchData.id,
        title: `New student matched: ${enrollment.child_name}`,
        body: `You've been matched with ${enrollment.child_name} (age ${enrollment.child_age}). Instrument interest: ${enrollment.instrument_interest || 'Not specified'}. Parent: ${enrollment.parent_name} (${enrollment.parent_email}).${enrollment.notes ? ` Notes: ${enrollment.notes}` : ''}`,
        read: false,
      });
    }

    setMatchVolunteer('');
    setMatchEnrollment('');
    loadData();
  };

  const removeMatch = async (id: string) => {
    const { data } = await supabase.from('matches').delete().eq('id', id).select('enrollment_id').single();
    if (data?.enrollment_id) {
      const { count } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('enrollment_id', data.enrollment_id);
      // Only revert the student to "Accepted" once their last remaining match is removed —
      // a student with 2 teachers (e.g. piano + violin) should stay "Matched" after losing one.
      if (!count) {
        await supabase.from('lesson_enrollments').update({ status: 'Accepted' }).eq('id', data.enrollment_id);
      }
    }
    loadData();
  };

  const pendingApps = applications.filter((a) => a.status === 'Pending');
  const approvedVolunteers = applications.filter((a) => a.status === 'Approved' && isVolunteerReady(a));
  const newEnrollments = enrollments.filter((e) => e.status === 'Pending');
  const matchedEnrollmentIds = matches.map((m) => m.enrollment_id);
  const matchableEnrollments = enrollments.filter(
    (e) => e.status !== 'Rejected' && !matchedEnrollmentIds.includes(e.id)
  );

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-10 md:pt-40">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Admin Dashboard</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl text-balance">
              Manage your team.
            </h1>
            <p className="mt-5 max-w-xl text-foreground/70 leading-relaxed">
              Review volunteer applications, approve or deny them, and match approved volunteers
              with enrolled students.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal>
          <div className="flex gap-2 mb-10">
            <button
              onClick={() => setTab('new')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                tab === 'new'
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <Sparkles className="w-4 h-4" /> New people
              {(pendingApps.length + newEnrollments.length) > 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  {pendingApps.length + newEnrollments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('volunteers')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                tab === 'volunteers'
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <UserCog className="w-4 h-4" /> Volunteers
              {pendingApps.length > 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  {pendingApps.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('matching')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                tab === 'matching'
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <Handshake className="w-4 h-4" /> Matching
              {matchableEnrollments.length > 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  {matchableEnrollments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('schedule')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                tab === 'schedule'
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Schedule
            </button>
            <button
              onClick={() => setTab('directory')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                tab === 'directory'
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              <Table className="w-4 h-4" /> Directory
            </button>
          </div>
        </Reveal>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : tab === 'new' ? (
          <AdminNewPeople
            enrollments={newEnrollments}
            applications={pendingApps}
            onSelectRecord={setDetailRecord}
            updateEnrollmentStatus={updateEnrollmentStatus}
          />
        ) : tab === 'volunteers' ? (
          <AdminVolunteers applications={applications} updateAppStatus={updateAppStatus} updateTrainingStatus={updateTrainingStatus} />
        ) : tab === 'matching' ? (
          <AdminMatching
            approvedVolunteers={approvedVolunteers}
            enrollments={enrollments}
            matches={matches}
            matchedEnrollmentIds={matchedEnrollmentIds}
            matchVolunteer={matchVolunteer}
            matchEnrollment={matchEnrollment}
            setMatchVolunteer={setMatchVolunteer}
            setMatchEnrollment={setMatchEnrollment}
            createMatch={createMatch}
            removeMatch={removeMatch}
            matchError={matchError}
          />
        ) : tab === 'schedule' ? (
          <AdminSchedule slots={availabilitySlots} sessions={scheduledSessions} pendingSessions={pendingSessions} />
        ) : (
          <AdminDirectory
            enrollments={enrollments}
            applications={applications}
            matches={matches}
            onSelectRecord={setDetailRecord}
          />
        )}

        {detailRecord && (
          <DetailDrawer record={detailRecord} onClose={() => setDetailRecord(null)} />
        )}
      </section>
    </>
  );
}

function AdminNewPeople({
  enrollments,
  applications,
  onSelectRecord,
  updateEnrollmentStatus,
}: {
  enrollments: Enrollment[];
  applications: VolunteerApp[];
  onSelectRecord: (record: { type: 'child' | 'volunteer'; data: Enrollment | VolunteerApp }) => void;
  updateEnrollmentStatus: (id: string, status: string) => void;
}) {
  const people = [
    ...enrollments.map((data) => ({ type: 'child' as const, data })),
    ...applications.map((data) => ({ type: 'volunteer' as const, data })),
  ].sort((a, b) => new Date(b.data.created_at || 0).getTime() - new Date(a.data.created_at || 0).getTime());

  if (people.length === 0) {
    return (
      <Reveal>
        <div className="border border-dashed border-border rounded-sm p-12 text-center">
          <Sparkles className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
          <p className="mt-4 text-foreground/60">There are no new students or volunteers right now.</p>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="space-y-3">
      {people.map((person, i) => {
        const isStudent = person.type === 'child';
        const name = isStudent ? person.data.child_name : person.data.full_name;
        const contact = isStudent ? person.data.parent_email : person.data.email;
        const detail = isStudent
          ? `Student · Age ${person.data.child_age} · ${person.data.instrument_interest || 'Instrument not specified'}`
          : `Volunteer · ${person.data.instrument_specialty} · ${person.data.experience_years} yrs experience`;

        return (
          <Reveal key={`${person.type}-${person.data.id}`} delay={i * 0.04}>
            <div className="border border-border rounded-sm p-5 bg-background hover:border-primary/40 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectRecord({ type: person.type, data: person.data })}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    {isStudent ? <Music className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4 text-primary" />}
                    <h3 className="font-display text-lg tracking-tight">{name}</h3>
                    <StatusBadge status={person.data.status} />
                  </div>
                  <p className="mt-1 text-sm text-foreground/60">{detail}</p>
                  <p className="mt-1 text-xs text-foreground/40">{contact}</p>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  {isStudent && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateEnrollmentStatus(person.data.id, 'Accepted')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-foreground text-white text-sm font-semibold rounded-sm hover:bg-accent-foreground/90 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEnrollmentStatus(person.data.id, 'Rejected')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-destructive/40 text-destructive text-sm font-semibold rounded-sm hover:bg-destructive/10 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectRecord({ type: person.type, data: person.data })}
                    className="text-sm font-medium text-primary whitespace-nowrap"
                  >
                    View details <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

function AdminVolunteers({
  applications,
  updateAppStatus,
  updateTrainingStatus,
}: {
  applications: VolunteerApp[];
  updateAppStatus: (id: string, status: string) => void;
  updateTrainingStatus: (id: string, trainingCompleted: boolean) => void;
}) {
  if (applications.length === 0) {
    return (
      <Reveal>
        <div className="border border-dashed border-border rounded-sm p-12 text-center">
          <Users className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
          <p className="mt-4 text-foreground/60 max-w-md mx-auto">
            No volunteer applications yet. When musicians apply, their applications will appear
            here for review.
          </p>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app, i) => (
        <Reveal key={app.id} delay={i * 0.05}>
          <div className="border border-border rounded-sm p-5 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-lg tracking-tight">{app.full_name}</h3>
                  {app.status === 'Pending' && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-sm">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                  {app.status === 'Approved' && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-accent/20 text-accent-foreground rounded-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  {app.status === 'Denied' && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-destructive/10 text-destructive rounded-sm">
                      <XCircle className="w-3.5 h-3.5" /> Denied
                    </span>
                  )}
                  {isVolunteerReady(app) ? (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-sm">
                      <GraduationCap className="w-3.5 h-3.5" /> Ready for matching
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-sm">
                      <Clock className="w-3.5 h-3.5" /> Training or profile incomplete
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-foreground/60">
                  {app.instrument_specialty} &middot; {app.experience_years} yrs experience
                </p>
                <p className="text-xs text-foreground/40 mt-1">{app.email}{app.phone ? ` · ${app.phone}` : ''}</p>
                {app.teaching_experience && (
                  <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                    <span className="font-medium">Teaching experience: </span>{app.teaching_experience}
                  </p>
                )}
                {app.bio && (
                  <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                    <span className="font-medium">Bio: </span>{app.bio}
                  </p>
                )}
                {app.availability && (
                  <p className="mt-2 text-xs text-foreground/50">Available: {app.availability}</p>
                )}
              </div>

              {app.status === 'Pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => updateAppStatus(app.id, 'Approved')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-foreground text-white text-sm font-semibold rounded-sm hover:bg-accent-foreground/90 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => updateAppStatus(app.id, 'Denied')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-destructive/40 text-destructive text-sm font-semibold rounded-sm hover:bg-destructive/10 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Deny
                  </button>
                </div>
              )}
              {app.status === 'Approved' && (
                <div className="flex flex-col items-stretch gap-2 shrink-0">
                  <button
                    onClick={() => updateTrainingStatus(app.id, !app.training_completed)}
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${
                      app.training_completed
                        ? 'border border-border hover:bg-muted'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    {app.training_completed ? 'Mark training incomplete' : 'Mark training complete'}
                  </button>
                  <button
                    onClick={() => updateAppStatus(app.id, 'Pending')}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border text-sm font-medium rounded-sm hover:bg-muted transition-colors"
                  >
                    Move to pending
                  </button>
                </div>
              )}
              {app.status === 'Denied' && (
                <button
                  onClick={() => updateAppStatus(app.id, 'Approved')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-foreground text-white text-sm font-semibold rounded-sm hover:bg-accent-foreground/90 transition-colors shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function AdminMatching({
  approvedVolunteers,
  enrollments,
  matches,
  matchedEnrollmentIds,
  matchVolunteer,
  matchEnrollment,
  setMatchVolunteer,
  setMatchEnrollment,
  createMatch,
  removeMatch,
  matchError,
}: {
  approvedVolunteers: VolunteerApp[];
  enrollments: Enrollment[];
  matches: Match[];
  matchedEnrollmentIds: string[];
  matchVolunteer: string;
  matchEnrollment: string;
  setMatchVolunteer: (v: string) => void;
  setMatchEnrollment: (v: string) => void;
  createMatch: (e: React.FormEvent) => void;
  removeMatch: (id: string) => void;
  matchError: string;
}) {
  // Non-rejected students stay selectable even after a match, so a student
  // can be matched with more than one teacher (e.g. one for piano, one for violin).
  const matchCountByEnrollment = matchedEnrollmentIds.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  const matchable = enrollments.filter((e) => e.status !== 'Rejected');

  return (
    <div className="space-y-8">
      {/* Create match */}
      <Reveal>
        <div className="border border-border rounded-sm p-6 bg-card/40">
          <div className="flex items-center gap-2 mb-4">
            <Handshake className="w-5 h-5 text-secondary" strokeWidth={1.5} />
            <h3 className="font-display text-lg tracking-tight">Create a new match</h3>
          </div>
          {approvedVolunteers.length === 0 || matchable.length === 0 ? (
            <div className="flex items-start gap-2 text-sm text-foreground/60">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                {approvedVolunteers.length === 0
                  ? 'No approved volunteers are ready yet. Volunteers must complete training and create a profile before matching.'
                  : 'No enrolled students yet. New enrollments will appear here.'}
              </p>
            </div>
          ) : (
            <form onSubmit={createMatch} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground/70">Volunteer</label>
                <select
                  value={matchVolunteer}
                  onChange={(e) => setMatchVolunteer(e.target.value)}
                  required
                  className="mt-1.5 w-full px-4 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a volunteer...</option>
                  {approvedVolunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.full_name} — {v.instrument_specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Student</label>
                <select
                  value={matchEnrollment}
                  onChange={(e) => setMatchEnrollment(e.target.value)}
                  required
                  className="mt-1.5 w-full px-4 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a student...</option>
                  {matchable.map((e) => {
                    const count = matchCountByEnrollment[e.id] || 0;
                    return (
                      <option key={e.id} value={e.id}>
                        {e.child_name} (age {e.child_age}) — {e.instrument_interest || 'Any'} — {e.parent_name}
                        {count > 0 ? ` — already matched with ${count} teacher${count > 1 ? 's' : ''}` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              {matchError && (
                <div className="sm:col-span-2 flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{matchError}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-sm hover:bg-secondary/90 transition-colors"
                >
                  <Handshake className="w-4 h-4" /> Create match
                </button>
              </div>
            </form>
          )}
        </div>
      </Reveal>

      {/* Existing matches */}
      <div>
        <Reveal>
          <h3 className="font-display text-xl tracking-tight mb-4">Current matches</h3>
        </Reveal>
        {matches.length === 0 ? (
          <Reveal>
            <div className="border border-dashed border-border rounded-sm p-8 text-center">
              <p className="text-foreground/60">No matches created yet.</p>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-3">
            {matches.map((m, i) => {
              const volunteer = approvedVolunteers.find((v) => v.id === m.volunteer_id);
              const enrollment = enrollments.find((e) => e.id === m.enrollment_id);
              return (
                <Reveal key={m.id} delay={i * 0.05}>
                  <div className="border border-border rounded-sm p-5 bg-background flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-base tracking-tight">
                        {volunteer?.full_name || 'Unknown volunteer'}{' '}
                        <span className="text-foreground/40">&harr;</span>{' '}
                        {enrollment?.child_name || 'Unknown student'}
                      </p>
                      <p className="text-sm text-foreground/60 mt-0.5">
                        {volunteer?.instrument_specialty} &middot; {enrollment?.parent_name} ({enrollment?.parent_email})
                      </p>
                    </div>
                    <button
                      onClick={() => removeMatch(m.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium rounded-sm hover:bg-muted transition-colors shrink-0"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Unmatch
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentDetailDrawer({ student, meetLink, onClose }: { student: StudentProgress; meetLink: string; onClose: () => void }) {
  const profileData: StudentProfileView = {
    kind: 'student',
    child_name: student.student_name,
    child_age: student.child_age,
    instrument_interest: student.instrument,
    parent_name: student.parent_name,
    parent_email: student.parent_email,
    notes: student.notes,
    profile_image_url: student.profile_image_url,
    profile_hobbies: student.profile_hobbies,
    profile_learning_style: student.profile_learning_style,
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-lg tracking-tight">Student profile</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-sm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <ProfileCard profile={profileData} />
          {meetLink && (
            <div className="mt-5">
              <StartSessionButton meetLink={meetLink} />
            </div>
          )}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-2">
              <BookOpenCheck className="w-3.5 h-3.5" /> Course progress
            </p>
            {student.progress.length > 0 ? (
              <div className="space-y-3">
                {instrumentFamilies.filter((f) => f !== 'All' && student.progress.some((p) => p.instrument_family === f)).map((family) => {
                  const totalMovements = courseData[family]?.length || 0;
                  const completedCount = student.progress.filter((p) => p.instrument_family === family).length;
                  const pct = totalMovements > 0 ? Math.round((completedCount / totalMovements) * 100) : 0;
                  return (
                    <div key={family}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{family}</span>
                        <span className="text-foreground/60">{completedCount} of {totalMovements} movements</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-foreground/50">No course progress yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function AdminSchedule({ slots, sessions, pendingSessions }: {
  slots: Slot[];
  sessions: SlotRequest[];
  pendingSessions: SlotRequest[];
}) {
  const slotById: Record<string, Slot> = {};
  slots.forEach((s) => {
    slotById[s.id] = s;
  });

  const slotsByVolunteer: Record<string, Slot[]> = {};
  slots.forEach((s) => {
    if (!slotsByVolunteer[s.volunteer_email]) slotsByVolunteer[s.volunteer_email] = [];
    slotsByVolunteer[s.volunteer_email].push(s);
  });

  const formatSlotTime = (slot?: Slot) => {
    if (!slot) return 'Time no longer available';
    return slot.slot_type === 'recurring'
      ? `${slot.day_of_week} ${formatTimeRange(slot.start_time, slot.end_time)}`
      : `One-off ${formatTimeRange(slot.start_time, slot.end_time)}`;
  };

  return (
    <div>
      <p className="text-sm text-foreground/50 mb-8">All times are Eastern (EST).</p>
      <div className="space-y-10">
      <div>
        <h3 className="font-display text-xl tracking-tight mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-secondary" strokeWidth={1.5} /> Scheduled sessions
          {sessions.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{sessions.length}</span>
          )}
        </h3>
        {sessions.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm p-8 text-center">
            <p className="text-foreground/60">No sessions have been scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const slot = slotById[session.slot_id];
              return (
                <div key={session.id} className="border border-border rounded-sm p-5 bg-background flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-base tracking-tight">
                      {session.student_name}{' '}
                      <span className="text-foreground/40">&harr;</span>{' '}
                      {slot?.volunteer_name || 'Unknown volunteer'}
                    </p>
                    <p className="text-sm text-foreground/60 mt-0.5">
                      {formatSlotTime(slot)}
                      {slot?.instrument_specialty ? ` · ${slot.instrument_specialty}` : ''}
                    </p>
                    {session.notes && <p className="text-xs text-foreground/50 mt-1">{session.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl tracking-tight mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-secondary" strokeWidth={1.5} /> Requested, not yet accepted
          {pendingSessions.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{pendingSessions.length}</span>
          )}
        </h3>
        {pendingSessions.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm p-8 text-center">
            <p className="text-foreground/60">No lesson time requests are waiting on a teacher's response.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSessions.map((session) => {
              const slot = slotById[session.slot_id];
              return (
                <div key={session.id} className="border border-border rounded-sm p-5 bg-background flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-base tracking-tight">
                      {session.student_name}{' '}
                      <span className="text-foreground/40">&harr;</span>{' '}
                      {slot?.volunteer_name || 'Unknown volunteer'}
                    </p>
                    <p className="text-sm text-foreground/60 mt-0.5">
                      {formatSlotTime(slot)}
                      {slot?.instrument_specialty ? ` · ${slot.instrument_specialty}` : ''}
                    </p>
                    {session.notes && <p className="text-xs text-foreground/50 mt-1">{session.notes}</p>}
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-sm">
                    <Clock className="w-3.5 h-3.5" /> Awaiting response
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl tracking-tight mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary" strokeWidth={1.5} /> Volunteer availability
        </h3>
        {Object.keys(slotsByVolunteer).length === 0 ? (
          <div className="border border-dashed border-border rounded-sm p-8 text-center">
            <p className="text-foreground/60">No volunteers have added availability yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(slotsByVolunteer).map(([email, vSlots]) => (
              <div key={email} className="border border-border rounded-sm p-5 bg-background">
                <p className="font-display text-base tracking-tight">{vSlots[0].volunteer_name}</p>
                <p className="text-xs text-foreground/40 mb-3">{email}</p>
                <div className="space-y-1.5">
                  {vSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between gap-3 text-sm">
                      <span>
                        {formatSlotTime(slot)}
                        {slot.instrument_specialty ? ` · ${slot.instrument_specialty}` : ''}
                      </span>
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded-sm ${
                          slot.status === 'Open' ? 'bg-accent/20 text-accent-foreground' : 'bg-muted text-foreground/60'
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function AdminDirectory({
  enrollments,
  applications,
  matches,
  onSelectRecord,
}: {
  enrollments: Enrollment[];
  applications: VolunteerApp[];
  matches: Match[];
  onSelectRecord: (record: { type: 'child' | 'volunteer'; data: Enrollment | VolunteerApp }) => void;
}) {
  const [section, setSection] = useState<'children' | 'volunteers'>('children');
  const [query, setQuery] = useState('');

  const matchedEnrollmentIds = matches.map((m) => m.enrollment_id);

  const filteredChildren = enrollments.filter((e) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      e.child_name.toLowerCase().includes(q) ||
      e.parent_name.toLowerCase().includes(q) ||
      e.parent_email.toLowerCase().includes(q) ||
      (e.instrument_interest || '').toLowerCase().includes(q)
    );
  });

  const filteredVolunteers = applications.filter((a) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      a.full_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q) ||
      a.instrument_specialty.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="inline-flex rounded-sm border border-border overflow-hidden">
            <button
              onClick={() => setSection('children')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                section === 'children' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              }`}
            >
              <Music className="w-4 h-4" /> Children ({enrollments.length})
            </button>
            <button
              onClick={() => setSection('volunteers')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                section === 'volunteers' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              }`}
            >
              <Users className="w-4 h-4" /> Volunteers ({applications.length})
            </button>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, instrument…"
            className="px-4 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-72"
          />
        </div>
      </Reveal>

      {section === 'children' ? (
        filteredChildren.length === 0 ? (
          <Reveal>
            <div className="border border-dashed border-border rounded-sm p-12 text-center">
              <Music className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
              <p className="mt-4 text-foreground/60">
                {enrollments.length === 0
                  ? 'No children have signed up yet.'
                  : 'No children match your search.'}
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="overflow-x-auto border border-border rounded-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left text-xs uppercase tracking-wider text-foreground/60">
                    <th className="px-4 py-3 font-semibold">Child</th>
                    <th className="px-4 py-3 font-semibold">Age</th>
                    <th className="px-4 py-3 font-semibold">Instrument</th>
                    <th className="px-4 py-3 font-semibold">Parent</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Matched?</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((e, i) => (
                    <tr
                      key={e.id}
                      onClick={() => onSelectRecord({ type: 'child', data: e })}
                      className={`border-t border-border cursor-pointer hover:bg-muted/40 transition-colors ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-primary hover:underline">{e.child_name}</td>
                      <td className="px-4 py-3 text-foreground/70">{e.child_age}</td>
                      <td className="px-4 py-3 text-foreground/70">{e.instrument_interest || '—'}</td>
                      <td className="px-4 py-3 text-foreground/70">{e.parent_name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="px-4 py-3">
                        {matchedEnrollmentIds.includes(e.id) ? (
                          <span className="inline-flex items-center gap-1 text-xs text-accent-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="text-xs text-foreground/40">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )
      ) : filteredVolunteers.length === 0 ? (
        <Reveal>
          <div className="border border-dashed border-border rounded-sm p-12 text-center">
            <Users className="w-10 h-10 text-foreground/30 mx-auto" strokeWidth={1} />
            <p className="mt-4 text-foreground/60">
              {applications.length === 0
                ? 'No volunteers have applied yet.'
                : 'No volunteers match your search.'}
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="overflow-x-auto border border-border rounded-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-xs uppercase tracking-wider text-foreground/60">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Specialty</th>
                  <th className="px-4 py-3 font-semibold">Experience</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Students</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((a, i) => {
                  const studentCount = matches.filter((m) => m.volunteer_id === a.id).length;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => onSelectRecord({ type: 'volunteer', data: a })}
                      className={`border-t border-border cursor-pointer hover:bg-muted/40 transition-colors ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-primary hover:underline">{a.full_name}</td>
                      <td className="px-4 py-3 text-foreground/70">{a.instrument_specialty}</td>
                      <td className="px-4 py-3 text-foreground/70">{a.experience_years} yrs</td>
                      <td className="px-4 py-3 text-foreground/70">{a.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-foreground/70">{studentCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-sm">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }
  if (status === 'Approved' || status === 'Accepted' || status === 'Matched' || status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 bg-accent/20 text-accent-foreground rounded-sm">
        <CheckCircle2 className="w-3 h-3" /> {status}
      </span>
    );
  }
  if (status === 'Denied' || status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-sm">
        <XCircle className="w-3 h-3" /> {status}
      </span>
    );
  }
  return <span className="text-xs text-foreground/50">{status || '—'}</span>;
}

function DetailDrawer({
  record,
  onClose,
}: {
  record: { type: 'child' | 'volunteer'; data: Enrollment | VolunteerApp };
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-lg tracking-tight">
            {record.type === 'child' ? 'Child enrollment' : 'Volunteer application'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {record.type === 'child' ? (
          <ChildDetail data={record.data as Enrollment} />
        ) : (
          <VolunteerDetail data={record.data as VolunteerApp} />
        )}
      </div>
    </>
  );
}

function ChildDetail({ data }: { data: Enrollment }) {
  const hasProfile = data.profile_image_url || data.profile_hobbies || data.profile_learning_style;
  return (
    <div className="px-6 py-5 space-y-5">
      <div className="flex items-center gap-4">
        {data.profile_image_url ? (
          <img
            src={data.profile_image_url}
            alt={data.child_name}
            className="w-16 h-16 rounded-full object-cover border-2 border-border shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border shrink-0">
            <Users className="w-7 h-7 text-foreground/40" strokeWidth={1.5} />
          </div>
        )}
        <div>
          <h4 className="font-display text-2xl tracking-tight text-primary">{data.child_name}</h4>
          <p className="text-sm text-foreground/60 mt-1">Age {data.child_age}</p>
        </div>
      </div>

      <div className="space-y-3">
        <DetailRow icon={<Music className="w-4 h-4" />} label="Instrument interest" value={data.instrument_interest || 'Not specified'} />
        <DetailRow icon={<Users className="w-4 h-4" />} label="Parent / guardian" value={data.parent_name} />
        <DetailRow icon={<Mail className="w-4 h-4" />} label="Parent email" value={data.parent_email} />
        <DetailRow icon={<CheckCircle2 className="w-4 h-4" />} label="Status" value={data.status} />
      </div>

      {data.notes && (
        <div>
          <p className="text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-1.5">
            <StickyNote className="w-3.5 h-3.5" /> Notes from parent
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.notes}</p>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <p className="text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-3">
          <UserCircle className="w-3.5 h-3.5" /> Profile (visible to teacher)
        </p>
        {hasProfile ? (
          <div className="space-y-3">
            {data.profile_hobbies && (
              <div>
                <p className="text-xs text-foreground/50 mb-1">What they like to do</p>
                <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.profile_hobbies}</p>
              </div>
            )}
            {data.profile_learning_style && (
              <div>
                <p className="text-xs text-foreground/50 mb-1">How they learn best</p>
                <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.profile_learning_style}</p>
              </div>
            )}
            {!data.profile_hobbies && !data.profile_learning_style && (
              <p className="text-sm text-foreground/40 italic">Only a photo has been added.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-foreground/40 italic">No profile filled out yet.</p>
        )}
      </div>
    </div>
  );
}

function VolunteerDetail({ data }: { data: VolunteerApp }) {
  const hasProfile = data.profile_image_url || data.profile_bio || data.profile_hobbies || data.profile_teaching_methods;
  return (
    <div className="px-6 py-5 space-y-5">
      <div className="flex items-center gap-4">
        {data.profile_image_url ? (
          <img
            src={data.profile_image_url}
            alt={data.full_name}
            className="w-16 h-16 rounded-full object-cover border-2 border-border shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border shrink-0">
            <Users className="w-7 h-7 text-foreground/40" strokeWidth={1.5} />
          </div>
        )}
        <div>
          <h4 className="font-display text-2xl tracking-tight text-primary">{data.full_name}</h4>
          <p className="text-sm text-foreground/60 mt-1">{data.instrument_specialty}</p>
        </div>
      </div>

      <div className="space-y-3">
        <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={data.email} />
        {data.phone && <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={data.phone} />}
        <DetailRow icon={<Music className="w-4 h-4" />} label="Specialty" value={data.instrument_specialty} />
        <DetailRow icon={<Clock className="w-4 h-4" />} label="Experience" value={`${data.experience_years} years`} />
        <DetailRow icon={<Calendar className="w-4 h-4" />} label="Availability" value={data.availability || 'Flexible'} />
        <DetailRow icon={<CheckCircle2 className="w-4 h-4" />} label="Status" value={data.status} />
      </div>

      {data.teaching_experience && (
        <div>
          <p className="text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Teaching experience
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.teaching_experience}</p>
        </div>
      )}

      {data.bio && (
        <div>
          <p className="text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-1.5">
            <StickyNote className="w-3.5 h-3.5" /> Bio
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.bio}</p>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <p className="text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-3">
          <UserCircle className="w-3.5 h-3.5" /> Profile (visible to students)
        </p>
        {hasProfile ? (
          <div className="space-y-3">
            {data.profile_bio && (
              <div>
                <p className="text-xs text-foreground/50 mb-1">About</p>
                <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.profile_bio}</p>
              </div>
            )}
            {data.profile_hobbies && (
              <div>
                <p className="text-xs text-foreground/50 mb-1">What they like to do</p>
                <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.profile_hobbies}</p>
              </div>
            )}
            {data.profile_teaching_methods && (
              <div>
                <p className="text-xs text-foreground/50 mb-1">Teaching methods</p>
                <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{data.profile_teaching_methods}</p>
              </div>
            )}
            {!data.profile_bio && !data.profile_hobbies && !data.profile_teaching_methods && (
              <p className="text-sm text-foreground/40 italic">Only a photo has been added.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-foreground/40 italic">No profile filled out yet.</p>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-foreground/40 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-foreground/50">{label}</p>
        <p className="text-sm font-medium text-foreground/90">{value}</p>
      </div>
    </div>
  );
}
