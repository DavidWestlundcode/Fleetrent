'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import PublicMobileNav from '@/components/public/PublicMobileNav';

const NAV_ITEMS = [
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Branscher', href: '/#branscher' },
  { label: 'Integrationer', href: '/integrationer' },
  { label: 'Priser', href: '/priser' },
  { label: 'Kunder', href: '/kunder' },
];

// Floating, single-line bar. The same component is used on every public page.
export default function PublicHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => !href.startsWith('/#') && (pathname === href || pathname.startsWith(href + '/'));

  return (
    <header className="fixed top-3 inset-x-3 sm:top-4 sm:inset-x-6 z-50">
      <div className="header-bar relative max-w-6xl mx-auto h-14 pl-3 pr-2 sm:pl-5 flex items-center justify-between rounded-2xl bg-white/85 backdrop-blur-xl ring-1 ring-slate-900/[0.06]">
        <div className="flex items-center gap-1.5">
          <PublicMobileNav items={NAV_ITEMS} />
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            <Logo size={24} priority decorative />
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">FleetOS</span>
          </Link>
        </div>

        <nav aria-label="Huvudmeny" className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`px-3 py-1.5 text-[13.5px] font-medium rounded-lg transition-colors duration-150 ${
                isActive(href) ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/login" className="hidden sm:inline-block text-[13.5px] font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors">
            Logga in
          </Link>
          <Link
            href="/kom-igang"
            className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[13.5px] font-semibold rounded-xl transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.97]"
          >
            Boka demo
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5">
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
