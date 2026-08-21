'use client';
import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useMobileNav } from '@/components/layout/MobileNav';
import NotificationPanel, { useNotifications } from '@/components/layout/NotificationPanel';
import ReportBug from '@/components/layout/ReportBug';
import GlobalSearch from '@/components/layout/GlobalSearch';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { open } = useMobileNav();
  const [showNotifs, setShowNotifs] = useState(false);
  const { notifications, dismiss } = useNotifications();
  const alertCount = notifications.length;

  return (
    <header className="flex flex-col bg-white border-b border-slate-100 shrink-0">
      <div className="flex items-center justify-between px-4 md:px-6 h-[56px] gap-2 md:gap-3">
        <div className="flex items-center gap-3 min-w-0 shrink-0">
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
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0"><GlobalSearch /></div>
          <div className="relative shrink-0">
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
            {showNotifs && (
              <NotificationPanel notifications={notifications} onDismiss={dismiss} onClose={() => setShowNotifs(false)} />
            )}
          </div>
          <div className="shrink-0"><ReportBug /></div>
          {actions && (
            <div className="hidden md:block min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-2">{actions}</div>
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div className="md:hidden px-4 pb-3 -mt-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 w-max">{actions}</div>
        </div>
      )}
    </header>
  );
}
