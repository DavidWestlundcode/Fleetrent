import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
}

const colorMap = {
  blue:   { accent: 'bg-blue-500',    iconBg: 'bg-blue-50',    iconText: 'text-blue-600' },
  green:  { accent: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
  amber:  { accent: 'bg-amber-400',   iconBg: 'bg-amber-50',   iconText: 'text-amber-600' },
  red:    { accent: 'bg-red-500',     iconBg: 'bg-red-50',     iconText: 'text-red-600' },
  purple: { accent: 'bg-violet-500',  iconBg: 'bg-violet-50',  iconText: 'text-violet-600' },
  slate:  { accent: 'bg-slate-400',   iconBg: 'bg-slate-100',  iconText: 'text-slate-600' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${c.accent}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-[26px] font-bold text-slate-900 mt-1 tracking-tight leading-none">{value}</p>
          {subtitle && <p className="text-[12px] text-slate-400 mt-1.5">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${c.iconBg} shrink-0`}>
          <Icon className={`w-[18px] h-[18px] ${c.iconText}`} />
        </div>
      </div>
    </div>
  );
}
