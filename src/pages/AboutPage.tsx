import { Sparkles, Users, BookOpen, Heart } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { CTASection } from '@/components/CTASection';

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

const values = [
  'Free, forever — no child is ever turned away for cost',
  'Volunteer-led — experienced musicians giving their craft forward',
  'Instrument-first — tangible tools, not just theory',
];

export function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-16 md:pt-40 md:pb-20">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/50">About The Prelude Project</p>
            <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-3xl text-balance">
              We turn a child's potential into the masterpiece.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-3xl px-6 pb-20 md:pb-28">
        <Reveal delay={0.1}>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">Our Story</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
            Music carried me. Now I want to hand it forward.
          </h2>
          <div className="mt-5 space-y-4 text-foreground/70 leading-relaxed">
            <p>
              For as long as I can remember, music has been my constant. I've spent years singing,
              playing instruments, and listening — and through every season of challenge, sadness,
              and uncertainty, music was the thing that held me together. When words ran out, a
              melody always said enough.
            </p>
            <p>
              That's what sparked The Prelude Project. I realized the lifeline that music had been
              for me wasn't available to every child — that there were kids with the same ache to
              play, the same need for an outlet, but no instrument, no teacher, no open door. I
              couldn't sit with that knowing what music could do for them. So I decided to build the
              door myself.
            </p>
            <p>
              Today we pair volunteer musicians with children who have the desire but not the means —
              placing real instruments in waiting hands and walking with them, movement by movement,
              from silence to their first performance.
            </p>
          </div>
        </Reveal>
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
                  <p.icon className="mt-1 w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
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

      {/* Core Values */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-foreground/50">What guides us</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">
            Three notes that tune everything we do.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="border border-border rounded-sm p-8 bg-background h-full">
                <Heart className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <p className="mt-4 font-display text-lg leading-snug">{value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection
        title="Ready to write the next movement?"
        subtitle="Whether you're a musician who can teach, a family with a child who wants to learn, or someone who can put an instrument in waiting hands — there's a part for you."
      />
    </>
  );
}
