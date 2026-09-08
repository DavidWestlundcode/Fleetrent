'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import PublicMobileNav from '@/components/public/PublicMobileNav';
import CustomersNavDropdown from '@/components/public/CustomersNavDropdown';

const NAV_ITEMS = [
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Hur det fungerar', href: '/#how-it-works' },
  { label: 'Integrationer', href: '/#integrations' },
  { label: 'Priser', href: '/priser' },
  { label: 'Kunder', href: '/kunder' },
];

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PublicMobileNav items={NAV_ITEMS} />
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">FleetOS</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center justify-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_ITEMS.map(({ label, href }) =>
            label === 'Kunder' ? (
              <CustomersNavDropdown key={label} />
            ) : (
              <a key={label} href={href} className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium">
                {label}
              </a>
            )
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-[13px] font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            Logga in
          </Link>
          <Link
            href="/kom-igang"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-slate-900 hover:bg-slate-700 active:scale-[0.97] text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm"
          >
            Boka demo
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
