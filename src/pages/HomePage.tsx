import { Link } from 'react-router-dom';
import {
  Music2,
  Gift,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { CTASection } from '@/components/CTASection';

const whatWeDo = [
  {
    icon: Music2,
    title: 'Free lessons',
    body: 'One-on-one teaching from volunteer musicians, at no cost to the child or family — ever.',
  },
  {
    icon: Gift,
    title: 'Instruments placed',
    body: "Children who can't begin for lack of an instrument are matched with one to keep and practice on.",
  },
  {
    icon: Users,
    title: 'Mentorship',
    body: 'Each child is paired with a teacher and a learning plan that grows with them for years.',
  },
  {
    icon: BookOpen,
    title: 'Open courses',
    body: 'A free modular catalog children and teachers move through together, at their own pace.',
  },
];

const crescendoSteps = [
  {
    title: 'Children enroll',
    body: 'A family signs up. We match the child with a volunteer teacher and a learning plan — lessons happen online, at no cost.',
  },
  {
    title: 'Lessons & courses begin',
    body: 'Weekly one-on-one online lessons paired with free modular courses children and teachers move through together.',
  },
];

const principles = [
  {
    icon: Sparkles,
    title: 'Access over ability to pay',
    body: 'Talent is evenly distributed; opportunity is not. We remove the price barrier entirely — lessons, courses, and instruments are always free to the child.',
  },
  {
    icon: Users,
    title: 'Dignity in the craft',
    body: 'We treat children as real musicians from day one. Professional-grade teaching, real instruments, and a stage to perform on.',
  },
  {
    icon: BookOpen,
    title: 'A lifelong relationship',
    body: "We don't drop an instrument and leave. We pair each child with a mentor and a curriculum that grows with them for years.",
  },
];

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-16 md:pt-44 md:pb-24">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/50">Melody Mission</p>
            <h1 className="mt-5 font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight max-w-4xl text-balance">
              Every child deserves a first note.
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-foreground/70 leading-relaxed">
              Turning a child's potential into a masterpiece. Free music lessons,
              free courses, and instruments placed directly in waiting hands.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                to="/lessons"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-cta text-cta-foreground font-semibold rounded-sm hover:bg-cta/90 transition-colors"
              >
                Sign up for lessons
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/volunteer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-border bg-background font-semibold rounded-sm hover:bg-muted transition-colors"
              >
                Volunteer to teach
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What we do */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-background/50">What we do</p>
            <h2 className="mt-3 text-3xl md:text-4xl tracking-tight max-w-2xl text-balance text-background/90">
              Every child deserves a{' '}
              <span className="font-display italic text-pink-400">first note</span>.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-4">
            {whatWeDo.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1} className="border-l border-background/20 pl-6">
                <item.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-xl tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/65">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Crescendo */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-foreground/50">The Crescendo</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight max-w-2xl text-balance">
            From silence to a first performance — in two movements.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-px md:grid-cols-2 bg-border rounded-sm overflow-hidden border border-border">
          {crescendoSteps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1} className="bg-background p-8 md:p-12">
              <div className="flex items-center gap-3">
                <span className="font-display text-5xl text-primary/30">{i + 1}</span>
                <h3 className="font-display text-2xl tracking-tight">{step.title}</h3>
              </div>
              <p className="mt-4 text-foreground/70 leading-relaxed">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mission & Goals */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">Mission & Goals</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
              A future where the only audition is the desire to begin.
            </h2>
          </Reveal>
          <div className="mt-8 space-y-4">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <h3 className="font-display text-xl tracking-tight">{p.title}</h3>
                    <p className="mt-1 text-foreground/70 leading-relaxed">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Your time, your instrument, or your voice — every note counts."
        subtitle="Teach a child. Share the score. There's a part for everyone in this orchestra."
      />
    </>
  );
}
