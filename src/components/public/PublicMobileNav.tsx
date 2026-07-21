'use client';
import { useEffect, useRef, useState } from 'react';
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
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Stäng meny' : 'Öppna meny'}
        className="p-2 -mr-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[min(14rem,calc(100vw-2rem))] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 py-2 z-50">
          {items.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
