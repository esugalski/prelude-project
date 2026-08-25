import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Music2, Menu, X, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'About', path: '/about' },
  { label: 'Lessons', path: '/lessons' },
  { label: 'Courses', path: '/courses' },
  { label: 'Volunteer', path: '/volunteer' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const portalLabel = isAdmin ? 'Admin' : 'Portal';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Music2 className="w-5 h-5 text-primary transition-transform group-hover:scale-110" strokeWidth={1.5} />
          <span className="font-display text-lg tracking-tight font-semibold">
            Prelude<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <div key={item.path} className="flex items-center">
                <Link
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    active ? 'text-primary' : ''
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -left-px top-1/2 -translate-y-1/2 h-4 w-px bg-primary/60" />
                  )}
                </Link>
              </div>
            );
          })}
          {user && (
            <Link
              to="/portal"
              className={`relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith('/portal') ? 'text-primary' : ''
              }`}
            >
              {portalLabel}
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-border text-sm font-semibold tracking-wide rounded-sm hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold tracking-wide rounded-sm hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Log in
            </Link>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path ? 'text-primary' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/portal"
                className={`py-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname.startsWith('/portal') ? 'text-primary' : ''
                }`}
              >
                {portalLabel}
              </Link>
            )}
            {user ? (
              <button
                onClick={signOut}
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-sm font-semibold rounded-sm"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-sm"
              >
                <LogIn className="w-4 h-4" /> Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
