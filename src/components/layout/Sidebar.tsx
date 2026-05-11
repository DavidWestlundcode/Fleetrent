'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Tag,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/machines', icon: Truck, label: 'Maskinflotta' },
  { href: '/orders', icon: FileText, label: 'Uthyrningsorder' },
  { href: '/customers', icon: Users, label: 'Kunder' },
  { href: '/templates', icon: Tag, label: 'Prismallar' },
  { href: '/service', icon: Wrench, label: 'Service & Underhåll' },
  { href: '/statistics', icon: BarChart3, label: 'Statistik & Lönsamhet' },
  { href: '/settings', icon: Settings, label: 'Inställningar' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

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
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-6 py-5 border-b border-slate-700 hover:bg-slate-800 transition-colors">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight">FleetRent</span>
          <p className="text-xs text-slate-400 leading-none mt-0.5">Maskinuthyrning</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">Administratör</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logga ut
        </button>
      </div>
    </aside>
  );
}
