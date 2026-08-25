import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Trophy, X } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { courseData, courseTitles, courseDescriptions, instrumentFamilies } from '@/data/courses';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function CoursesPage() {
  const [filter, setFilter] = useState('All');
  const families = Object.keys(courseData);
  const visible = filter === 'All' ? families : families.filter((f) => f === filter);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-16 md:pt-40 md:pb-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">The Studio</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl text-balance">
              Free courses, open to every enrolled student.
            </h1>
            <p className="mt-5 max-w-xl text-foreground/70 leading-relaxed">
              Modular courses structured as "movements." Move through each one at your own pace —
              learn, practice, and test your understanding before advancing to the next movement.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex flex-wrap gap-2 mb-10">
          {instrumentFamilies.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-sm border transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((family, i) => (
            <Reveal key={family} delay={i * 0.05}>
              <Link
                to={`/courses/${family.toLowerCase()}`}
                className="group block border border-border rounded-sm overflow-hidden bg-background hover:border-primary/40 transition-colors"
              >
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-secondary">{family}</p>
                  <h3 className="mt-3 font-display text-2xl tracking-tight">{courseTitles[family]}</h3>
                  <p className="mt-3 text-sm text-foreground/60 leading-relaxed">
                    {courseDescriptions[family]}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                    {courseData[family].length} movements
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function CourseDetailPage() {
  const { family } = useParams<{ family: string }>();
  const navigate = useNavigate();
  const familyKey = family
    ? family.charAt(0).toUpperCase() + family.slice(1).toLowerCase()
    : '';

  const movements = courseData[familyKey];

  if (!movements) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-40 pb-24 text-center">
        <h1 className="font-display text-3xl tracking-tight">Course not found.</h1>
        <Link to="/courses" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold">
          <ArrowLeft className="w-4 h-4" /> Browse courses
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-10 md:pt-40">
          <Reveal>
            <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> All courses
            </Link>
            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-secondary">{familyKey}</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-tight">{courseTitles[familyKey]}</h1>
            <p className="mt-4 max-w-xl text-foreground/70 leading-relaxed">{courseDescriptions[familyKey]}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="space-y-3">
          {movements.map((m, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <button
                onClick={() => navigate(`/courses/${family}/movements/${i}`)}
                className="w-full text-left flex items-center gap-4 p-5 border border-border rounded-sm bg-background hover:border-primary/40 hover:bg-muted/40 transition-colors group"
              >
                <span className="font-display text-3xl text-primary/30 group-hover:text-primary/50 transition-colors">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-xl tracking-tight">{m.name}</h3>
                  <p className="mt-1 text-sm text-foreground/60">{m.objective}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function MovementPage() {
  const { family, index } = useParams<{ family: string; index: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const familyKey = family
    ? family.charAt(0).toUpperCase() + family.slice(1).toLowerCase()
    : '';
  const movements = courseData[familyKey];
  const idx = parseInt(index || '0', 10);
  const [completedMovements, setCompletedMovements] = useState<Set<number>>(new Set());
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('lesson_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEnrollmentId(data.id);
      });
  }, [user]);

  useEffect(() => {
    if (!enrollmentId || !familyKey) return;
    supabase
      .from('course_progress')
      .select('movement_index')
      .eq('enrollment_id', enrollmentId)
      .eq('instrument_family', familyKey)
      .then(({ data }) => {
        if (data) setCompletedMovements(new Set(data.map((d) => d.movement_index)));
      });
  }, [enrollmentId, familyKey]);

  const saveProgress = async (movementIdx: number) => {
    if (!enrollmentId || !familyKey) return;
    await supabase.from('course_progress').upsert({
      enrollment_id: enrollmentId,
      instrument_family: familyKey,
      movement_index: movementIdx,
      passed: true,
    }, { onConflict: 'enrollment_id,instrument_family,movement_index' });
    setCompletedMovements((prev) => new Set([...prev, movementIdx]));
  };

  if (!movements || isNaN(idx) || idx < 0 || idx >= movements.length) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-40 pb-24 text-center">
        <h1 className="font-display text-3xl tracking-tight">Movement not found.</h1>
        <Link to="/courses" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold">
          <ArrowLeft className="w-4 h-4" /> Browse courses
        </Link>
      </section>
    );
  }

  const movement = movements[idx];
  const isLast = idx === movements.length - 1;

  return (
    <section className="mx-auto max-w-2xl px-6 pt-32 pb-24 md:pt-40">
      <Link
        to={`/courses/${family}`}
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {courseTitles[familyKey]}
      </Link>

      <div className="mt-8 flex items-center gap-3">
        <span className="font-display text-5xl text-primary/30">{idx + 1}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-secondary">
            Movement {idx + 1} of {movements.length}
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl tracking-tight">{movement.name}</h1>
        </div>
      </div>

      <p className="mt-6 text-lg text-foreground/80 leading-relaxed font-display">{movement.objective}</p>

      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-[0.15em] text-foreground/50">Why this matters</h2>
        <p className="mt-3 text-foreground/70 leading-relaxed">{movement.explanation}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-[0.15em] text-foreground/50">Steps</h2>
        <ol className="mt-4 space-y-3">
          {movement.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-foreground/80 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {completedMovements.has(idx) && (
        <div className="mt-6 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" /> Movement completed
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 p-5 bg-accent/30 rounded-sm border border-accent">
        <Lightbulb className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-accent-foreground leading-relaxed">{movement.tip}</p>
      </div>

      <QuizView movement={movement} onCorrect={() => saveProgress(idx)} />

      <div className="mt-10 flex items-center justify-between">
        {idx > 0 ? (
          <button
            onClick={() => navigate(`/courses/${family}/movements/${idx - 1}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-sm text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
        ) : (
          <span />
        )}

        {isLast ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-sm text-sm font-medium">
            <Trophy className="w-4 h-4" /> Course complete!
          </div>
        ) : (
          <button
            onClick={() => navigate(`/courses/${family}/movements/${idx + 1}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-sm text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}

function QuizView({ movement, onCorrect }: { movement: typeof courseData['Strings'][0]; onCorrect: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setAnswered(true);
    if (selected === movement.quiz.answer) {
      onCorrect();
    }
  };

  const reset = () => {
    setSelected(null);
    setAnswered(false);
  };

  return (
    <div className="mt-10 border border-border rounded-sm p-6 bg-card/40">
      <h2 className="text-xs uppercase tracking-[0.15em] text-secondary">Quick Check</h2>
      <p className="mt-3 font-display text-lg">{movement.quiz.question}</p>

      <div className="mt-4 space-y-2">
        {movement.quiz.options.map((opt, i) => {
          const isCorrect = i === movement.quiz.answer;
          const isSelected = selected === i;
          let style = 'border-border bg-background hover:bg-muted/40';
          if (answered && isCorrect) style = 'border-green-500 bg-green-50';
          else if (answered && isSelected && !isCorrect) style = 'border-destructive bg-destructive/5';
          else if (answered) style = 'border-border bg-background opacity-60';

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`w-full text-left p-3.5 border rounded-sm transition-colors flex items-center justify-between ${style}`}
            >
              <span className="text-sm">{opt}</span>
              {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {answered && isSelected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
            </button>
          );
        })}
      </div>

      {!answered ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit answer
        </button>
      ) : (
        <div className="mt-4">
          <p className={`text-sm font-medium ${selected === movement.quiz.answer ? 'text-green-700' : 'text-destructive'}`}>
            {selected === movement.quiz.answer ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="mt-1 text-sm text-foreground/60">{movement.quiz.explanation}</p>
          <button
            onClick={reset}
            className="mt-3 text-sm text-primary font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
