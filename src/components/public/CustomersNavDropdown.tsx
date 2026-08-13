'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CUSTOMER_CASES } from '@/lib/customer-cases';

export default function CustomersNavDropdown() {
  const [open, setOpen] = useState(false);
  const cases = CUSTOMER_CASES.slice(0, 5);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/kunder"
        className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium inline-block"
      >
        Kunder
      </Link>

      {open && (
        <div className="absolute left-0 top-full pt-2 w-72 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 py-2 overflow-hidden">
            {cases.map((c) => (
              <Link
                key={c.slug}
                href={`/kunder/${c.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                  <img src={c.logo} alt={c.name} className="max-w-6 max-h-6 object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-slate-800 truncate">{c.name}</span>
                  <span className="block text-[11px] text-slate-400 truncate">{c.industry}</span>
                </span>
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <Link href="/kunder" className="block px-4 py-2 text-[12px] text-blue-600 font-medium hover:bg-slate-50 transition-colors">
                Se alla kundcase →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
