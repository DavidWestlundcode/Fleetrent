'use client';
import { useState, useMemo } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useStore } from '@/store';
import { useMobileNav } from '@/components/layout/MobileNav';
import NotificationPanel from '@/components/layout/NotificationPanel';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { orders, machines, customers } = useStore();
  const { open } = useMobileNav();
  const [showNotifs, setShowNotifs] = useState(false);

  const alertCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in3days = new Date(today);
    in3days.setDate(in3days.getDate() + 3);

    let count = 0;

    orders.forEach((o) => {
      if (o.status === 'aktiv' && o.plannedReturnDate) {
        const ret = new Date(o.plannedReturnDate);
        ret.setHours(0, 0, 0, 0);
        if (ret <= in3days) count++;
      }
      if (o.status === 'reserverad' && o.startDate) {
        const start = new Date(o.startDate);
        start.setHours(0, 0, 0, 0);
        const diff = Math.round((start.getTime() - today.getTime()) / 86400000);
        if (diff <= 1) count++;
      }
      if (o.status === 'klar_for_fakturering' && !o.sentToAccounting) count++;
    });

    machines.forEach((m) => {
      if (m.status === 'service' || m.status === 'skadad') count++;
    });

    return count;
  }, [orders, machines]);

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-[56px] bg-white border-b border-slate-100 shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={open}
          className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Öppna meny"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-400 leading-tight mt-px truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Sök..."
            className="pl-8 pr-3 py-1.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-44 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-3.5 h-3.5 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>
          {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
        </div>
        {actions}
      </div>
    </header>
  );
}
