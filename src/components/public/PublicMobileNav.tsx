'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

export default function PublicMobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Stäng meny' : 'Öppna meny'}
        aria-expanded={open}
        aria-haspopup="menu"
        className="p-2 -mr-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div role="menu" className="absolute -left-1 top-full mt-3 w-[min(16rem,calc(100vw-2rem))] bg-white rounded-2xl ring-1 ring-slate-900/[0.06] shadow-[0_16px_40px_-16px_rgba(15,23,42,0.3)] p-1.5 z-50 origin-top-left animate-menu-in">
          {[...items, { label: 'Logga in', href: '/login' }].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
