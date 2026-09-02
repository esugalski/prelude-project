import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Target,
  Heart,
  AlertCircle,
  MessageCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { trainingModules } from '@/data/training';
import { supabase } from '@/lib/supabase';

export function TrainingPage() {
  const [completed] = useState<boolean[]>(() => {
    try {
      const stored = localStorage.getItem('prelude-training-progress-v2');
      return stored ? JSON.parse(stored) : new Array(trainingModules.length).fill(false);
    } catch {
      return new Array(trainingModules.length).fill(false);
    }
  });

  const completedCount = completed.filter(Boolean).length;
  const allDone = completedCount === trainingModules.length;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-10 md:pt-40">
          <Reveal>
            <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Portal
            </Link>
            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-secondary">Volunteer Training</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl text-balance">
              Connecting with children.
            </h1>
            <p className="mt-5 max-w-xl text-foreground/70 leading-relaxed">
              A short training on how to build trust, communicate effectively, and create a safe
              learning space for the children you'll teach. Complete all six modules before your
              first lesson.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {trainingModules.map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1 rounded-full transition-colors ${completed[i] ? 'bg-secondary' : 'bg-border'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground/60">{completedCount} of {trainingModules.length} complete</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        {allDone && (
          <Reveal>
            <div className="mb-6 border border-secondary/40 rounded-sm p-6 bg-secondary/5 flex items-start gap-4">
              <Trophy className="w-8 h-8 text-secondary shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <h2 className="font-display text-2xl tracking-tight">Congratulations — training complete!</h2>
                <p className="mt-2 text-foreground/70 leading-relaxed">
                  You've finished all six modules. You're ready to start teaching. Thank you for
                  taking the time to prepare — the children you teach will feel the difference.
                </p>
                <Link
                  to="/portal"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground text-sm font-semibold rounded-sm hover:bg-secondary/90 transition-colors"
                >
                  <Heart className="w-4 h-4" /> Back to Portal
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        <div className="space-y-3">
          {trainingModules.map((m, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <Link
                to={`/portal/training/${i}`}
                className={`block w-full text-left flex items-center gap-4 p-5 border rounded-sm bg-background transition-colors group ${
                  completed[i]
                    ? 'border-secondary/40 bg-secondary/5'
                    : 'border-border hover:border-secondary/40 hover:bg-muted/40'
                }`}
              >
                {completed[i] ? (
                  <CheckCircle2 className="w-8 h-8 text-secondary shrink-0" strokeWidth={1.5} />
                ) : (
                  <span className="font-display text-3xl text-secondary/30 group-hover:text-secondary/50 transition-colors">
                    {i + 1}
                  </span>
                )}
                <div className="flex-1">
                  <h3 className="font-display text-xl tracking-tight">{m.title}</h3>
                  <p className="mt-1 text-sm text-foreground/60">{m.objective}</p>
                </div>
                {completed[i] ? (
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Done</span>
                ) : (
                  <ArrowRight className="w-5 h-5 text-foreground/30 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function TrainingModulePage() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<boolean[]>(() => {
    try {
      const stored = localStorage.getItem('prelude-training-progress-v2');
      return stored ? JSON.parse(stored) : new Array(trainingModules.length).fill(false);
    } catch {
      return new Array(trainingModules.length).fill(false);
    }
  });
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizAttempted, setQuizAttempted] = useState(false);

  const idx = parseInt(index || '0', 10);

  useEffect(() => {
    setAnswers([]);
    setQuizAttempted(false);
  }, [idx]);

  if (isNaN(idx) || idx < 0 || idx >= trainingModules.length) {
    return (
      <section className="mx-auto max-w-2xl px-6 pt-40 pb-24 text-center">
        <h1 className="font-display text-3xl tracking-tight">Module not found.</h1>
        <Link to="/portal/training" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to training
        </Link>
      </section>
    );
  }

  const mod = trainingModules[idx];
  const isLast = idx === trainingModules.length - 1;
  const allDone = completed.every(Boolean);
  const allAnswered = answers.length === mod.questions.length;
  const quizPassed = mod.questions.every((q, qi) => answers[qi] === q.correctIndex);

  const markComplete = () => {
    const updated = [...completed];
    updated[idx] = true;
    setCompleted(updated);
    localStorage.setItem('prelude-training-progress-v2', JSON.stringify(updated));
    if (updated.every(Boolean)) {
      supabase.rpc('complete_volunteer_training').catch(() => {});
    }
  };

  const handleCheck = () => {
    setQuizAttempted(true);
    if (allAnswered && quizPassed) markComplete();
  };

  const handleNext = () => {
    if (completed[idx]) navigate(`/portal/training/${idx + 1}`);
  };

  return (
    <section className="mx-auto max-w-2xl px-6 pt-32 pb-24 md:pt-40">
      <Link
        to="/portal/training"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-secondary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All training modules
      </Link>

      {/* Progress bar */}
      <div className="mt-6 flex items-center gap-1.5">
        {trainingModules.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              completed[i] ? 'bg-secondary' : i === idx ? 'bg-secondary/40' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <span className="font-display text-5xl text-secondary/30">{idx + 1}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-secondary">
            Module {idx + 1} of {trainingModules.length}
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl tracking-tight">{mod.title}</h1>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Target className="w-5 h-5 text-secondary shrink-0 mt-1" strokeWidth={1.5} />
        <p className="text-lg text-foreground/80 leading-relaxed font-display">{mod.objective}</p>
      </div>

      {/* Explanation */}
      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-[0.15em] text-foreground/50">The Foundation</h2>
        <p className="mt-3 text-foreground/70 leading-relaxed">{mod.explanation}</p>
      </div>

      {/* Key Points */}
      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-[0.15em] text-foreground/50">Key Principles</h2>
        <ul className="mt-4 space-y-3">
          {mod.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-foreground/80 leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Do / Don't */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 p-5 bg-accent/20 border border-accent/50 rounded-sm">
          <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Do</p>
            <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{mod.doDont.do}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-5 bg-destructive/10 border border-destructive/30 rounded-sm">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-destructive">Avoid</p>
            <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{mod.doDont.dont}</p>
          </div>
        </div>
      </div>

      {/* Scenario */}
      <div className="mt-8 border border-border rounded-sm p-6 bg-card/40">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-secondary" strokeWidth={1.5} />
          <h2 className="text-xs uppercase tracking-[0.15em] text-secondary">Real-World Scenario</h2>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/50">Situation</p>
            <p className="mt-1 text-foreground/80 leading-relaxed">{mod.scenario.situation}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/50">How to Respond</p>
            <p className="mt-1 text-foreground/80 leading-relaxed">{mod.scenario.response}</p>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div className="mt-8 flex items-start gap-3 p-5 bg-accent/30 rounded-sm border border-accent">
        <Sparkles className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">Reflect</p>
          <p className="mt-1 text-accent-foreground leading-relaxed">{mod.reflection}</p>
        </div>
      </div>

      {/* Quiz */}
      <div className="mt-10 border border-secondary/40 rounded-sm p-6 bg-secondary/5">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-secondary" strokeWidth={1.5} />
          <h2 className="font-display text-xl tracking-tight">Check your understanding</h2>
        </div>
        <p className="text-sm text-foreground/60 mb-6">
          Answer all questions correctly to complete this module and move on to the next.
        </p>

        <div className="space-y-6">
          {mod.questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium text-foreground/90">{qi + 1}. {q.question}</p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const isCorrect = oi === q.correctIndex;
                  const showResult = quizAttempted && selected;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => {
                        const next = [...answers];
                        next[qi] = oi;
                        setAnswers(next);
                        setQuizAttempted(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-sm border transition-colors ${
                        showResult && isCorrect
                          ? 'border-accent-foreground/50 bg-accent/20 text-accent-foreground'
                          : showResult && !isCorrect
                          ? 'border-destructive/50 bg-destructive/10 text-destructive'
                          : selected
                          ? 'border-secondary bg-secondary/10'
                          : 'border-border bg-background hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {quizAttempted && !quizPassed && (
          <p className="mt-5 text-sm text-destructive">
            Some answers are incorrect. Review the section above and try again.
          </p>
        )}
        {completed[idx] && (
          <p className="mt-5 flex items-center gap-2 text-sm text-accent-foreground">
            <CheckCircle2 className="w-4 h-4" /> All correct — module complete!
          </p>
        )}

        {!completed[idx] && (
          <button
            onClick={handleCheck}
            disabled={!allAnswered}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary text-secondary-foreground font-semibold rounded-sm hover:bg-secondary/90 transition-colors disabled:opacity-40"
          >
            <CheckCircle2 className="w-5 h-5" /> Check answers
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        {idx > 0 ? (
          <button
            onClick={() => navigate(`/portal/training/${idx - 1}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-sm text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
        ) : (
          <span />
        )}

        {isLast ? (
          <div className="flex items-center gap-3">
            {allDone ? (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-sm text-sm font-medium">
                <Trophy className="w-4 h-4" /> Training complete!
              </div>
            ) : null}
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta text-cta-foreground rounded-sm text-sm font-semibold hover:bg-cta/90 transition-colors"
            >
              <Heart className="w-4 h-4" /> Back to Portal
            </Link>
          </div>
        ) : (
          <button
            onClick={handleNext}
            disabled={!completed[idx]}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-sm text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next module <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
}
