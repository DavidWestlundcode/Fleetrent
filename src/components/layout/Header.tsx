'use client';
import { Bell, Search } from 'lucide-react';
import { useStore } from '@/store';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { orders, machines } = useStore();

  const overdueCount = orders.filter(
    (o) => o.status === 'aktiv' && new Date(o.plannedReturnDate) < new Date()
  ).length;

  const serviceCount = machines.filter((m) => m.status === 'service').length;
  const alertCount = overdueCount + serviceCount;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Sök..."
            className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
          />
        </div>
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {alertCount}
            </span>
          )}
        </button>
        {actions}
      </div>
    </header>
  );
}
