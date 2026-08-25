import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  title: string;
  subtitle: string;
}

export function CTASection({ title, subtitle }: CTASectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="relative overflow-hidden rounded-sm border border-border">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/10222305/pexels-photo-10222305.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/80" />
        </div>
        <div className="relative px-8 py-16 md:px-16 md:py-24 text-background text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl tracking-tight text-balance">{title}</h2>
          <p className="mt-5 text-background/70 leading-relaxed">{subtitle}</p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/volunteer"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cta text-cta-foreground font-semibold rounded-sm hover:bg-cta/90 transition-colors"
            >
              Volunteer to teach
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/lessons"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-background/30 text-background font-semibold rounded-sm hover:bg-background/10 transition-colors"
            >
              Sign up for lessons
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
