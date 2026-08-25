import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import iconMark from '@/assets/brand/03_icon_mark_transparent.png';

const exploreLinks = [
  { label: 'About & Mission', path: '/about' },
  { label: 'Sign up for Lessons', path: '/lessons' },
  { label: 'Student Portal', path: '/portal' },
  { label: 'Volunteer to Teach', path: '/volunteer' },
];

export function Footer() {
  return (
    <footer className="relative bg-foreground text-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-12">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <img src={iconMark} alt="" className="w-9 h-9 object-contain" />
              <span className="font-display text-xl font-semibold">Melody Mission</span>
            </div>
            <p className="mt-5 max-w-sm text-background/70 text-base leading-relaxed">
              Turning a child's potential into a masterpiece. Free music lessons,
              free courses, and instruments placed directly in waiting hands.
            </p>
            <div className="mt-6 space-y-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:melodymission3@gmail.com" className="hover:text-primary transition-colors">
                  melodymission3@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 md:border-l md:border-background/15 md:pl-8">
            <h4 className="text-xs uppercase tracking-[0.2em] text-background/50">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-base">
              {exploreLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/80 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 md:border-l md:border-background/15 md:pl-8">
            <h4 className="text-xs uppercase tracking-[0.2em] text-background/50">Get Involved</h4>
            <p className="mt-4 text-background/70 leading-relaxed">
              Every hour, every instrument puts a child one note closer to their first
              performance.
            </p>
            <Link
              to="/volunteer"
              className="mt-6 inline-flex items-center gap-1.5 text-primary font-semibold hover:gap-2.5 transition-all"
            >
              Volunteer to teach
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-background/15 flex flex-col md:flex-row justify-between gap-3 text-xs text-background/50">
          <span>&copy; {new Date().getFullYear()} Melody Mission.</span>
          <div className="flex items-center gap-4">
            <span>Privacy &middot; Terms &middot; Built with care</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
