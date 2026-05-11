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
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
  slate: { bg: 'bg-slate-50', icon: 'bg-slate-100 text-slate-600', text: 'text-slate-600' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
