import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/map', label: 'Campus Map' },
  { to: '/navigate', label: 'Navigate' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }) =>
    `text-xs uppercase tracking-label pb-1.5 border-b transition ${isActive ? 'border-ink text-ink' : 'border-transparent text-ink/70 hover:text-ink'}`;

  return (
    <header className="relative z-40 border-b border-sand bg-cream">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-[72px]">
        <Link to="/" className="font-display text-2xl tracking-[0.12em] text-ink" aria-label="UniPath home">
          UNIPATH
        </Link>
        <nav className="hidden items-center gap-11 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/navigate" className="hidden bg-ink px-7 py-4 text-xs uppercase tracking-label text-cream transition hover:bg-bark md:inline-block">
          Start navigating
        </Link>
        <button type="button" className="rounded-lg p-2 text-ink md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>
      {open && (
        <nav className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-sand bg-cream px-4 pb-5 md:hidden" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `py-3 text-xs uppercase tracking-label ${isActive ? 'text-ink' : 'text-ink/70'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
