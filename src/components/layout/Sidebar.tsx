'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Truck, Users, FileText, Tag, Package, BarChart3, Settings, LogOut, Zap, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useMobileNav } from '@/components/layout/MobileNav';
import type { User } from '@supabase/supabase-js';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/machines', icon: Truck, label: 'Maskinflotta' },
  { href: '/orders', icon: FileText, label: 'Uthyrningsorder' },
  { href: '/customers', icon: Users, label: 'Kunder' },
  { href: '/templates', icon: Tag, label: 'Prismallar' },
  { href: '/articles', icon: Package, label: 'Artikelregister' },
  { href: '/statistics', icon: BarChart3, label: 'Statistik' },
  { href: '/settings', icon: Settings, label: 'Inställningar' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { isOpen, close } = useMobileNav();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? '';
  const initials = displayName.charAt(0).toUpperCase() || '?';

  return (
    <aside className={`
      flex flex-col w-[232px] bg-[#0B1120] border-r border-white/[0.06] shrink-0
      fixed inset-y-0 left-0 z-50 h-full
      transition-transform duration-200 ease-in-out
      md:static md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo + mobile close */}
      <div className="flex items-center justify-between px-5 h-[56px] border-b border-white/[0.06] shrink-0">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[14px] font-semibold text-white tracking-tight">FleetRent</span>
        </Link>
        <button
          onClick={close}
          className="md:hidden p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Stäng meny"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-px overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer group ${
                isActive
                  ? 'text-white bg-white/[0.09]'
                  : 'text-[#8B95A8] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-blue-500 rounded-r-full" />
              )}
              <Icon
                className={`w-[15px] h-[15px] shrink-0 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-[#4B5568] group-hover:text-[#8B95A8]'
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.06] p-2.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-white truncate leading-[1.3]">{displayName}</p>
            <p className="text-[11px] text-[#4B5568] leading-[1.3]">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-[#4B5568] hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <LogOut className="w-[15px] h-[15px]" />
          Logga ut
        </button>
      </div>
    </aside>
  );
}
