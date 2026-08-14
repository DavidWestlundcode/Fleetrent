'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Truck, DollarSign, BarChart2, Activity, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, calculateROI, calculateRecoveryPercent, getMonthlyRevenueData } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

export default function StatisticsPage() {
  const { machines, orders, customers } = useStore();

  const stats = useMemo(() => {
    const totalRevenue = orders.filter((o) => o.status === 'avslutad' || o.status === 'aktiv').reduce((s, o) => s + o.totalPrice, 0);
    const totalMachineCosts = machines.reduce((s, m) => s + m.purchasePrice + m.totalServiceCost + (m.financingCost + m.insuranceCost + m.otherCosts) * 12, 0);
    const netResult = totalRevenue - totalMachineCosts;
    const avgOccupancy = machines.length > 0
      ? Math.round((machines.filter((m) => m.status === 'uthyrd' || m.status === 'reserverad').length / machines.length) * 100) : 0;
    const totalRentals = orders.filter((o) => o.status === 'avslutad').length;

    // Year-over-year revenue comparison (exclude cancelled orders)
    const currentYear = new Date().getFullYear();
    const prevYear = currentYear - 1;
    const activeOrders = orders.filter((o) => o.status !== 'annullerad');
    const thisYearRevenue = activeOrders
      .filter((o) => new Date(o.startDate).getFullYear() === currentYear)
      .reduce((s, o) => s + o.totalPrice, 0);
    const prevYearRevenue = activeOrders
      .filter((o) => new Date(o.startDate).getFullYear() === prevYear)
      .reduce((s, o) => s + o.totalPrice, 0);
    const revenueTrendPct = prevYearRevenue > 0
      ? Math.round(((thisYearRevenue - prevYearRevenue) / prevYearRevenue) * 100)
      : null;

    return { totalRevenue, totalMachineCosts, netResult, avgOccupancy, totalRentals, revenueTrendPct };
  }, [machines, orders]);

  const revenueByMonth = useMemo(() => getMonthlyRevenueData(orders), [orders]);

  const revenueByCategory = useMemo(() => {
    const byCategory: Record<string, number> = {};
    machines.forEach((m) => {
      const label = CATEGORY_LABELS[m.category];
      byCategory[label] = (byCategory[label] ?? 0) + m.totalRevenue;
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [machines]);

  const revenueByCustomer = useMemo(() => {
    return [...customers]
      .filter((c) => c.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 8)
      .map((c) => ({ name: c.companyName.substring(0, 20), value: c.totalSpent }));
  }, [customers]);

  const topMachines = useMemo(() =>
    [...machines].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10),
    [machines]
  );

  const machineROIData = useMemo(() =>
    machines.map((m) => {
      const totalCosts = m.purchasePrice + m.totalServiceCost + (m.financingCost + m.insuranceCost + m.otherCosts) * 12;
      return {
        name: m.name.length > 20 ? m.name.substring(0, 18) + '...' : m.name,
        intäkt: m.totalRevenue,
        kostnad: totalCosts,
        netto: m.totalRevenue - totalCosts,
      };
    }).sort((a, b) => b.netto - a.netto),
    [machines]
  );

  const tooltipStyle = {
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    fontSize: 12,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header title="Statistik & Lönsamhet" subtitle="Fullständig analys av flottan och intäkter" />

      <div className="flex-1 p-6 space-y-5">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const revenueTrend = stats.revenueTrendPct !== null
              ? (stats.revenueTrendPct >= 0 ? `+${stats.revenueTrendPct}%` : `${stats.revenueTrendPct}%`)
              : null;
            const cards = [
              { label: 'Total intäkt', value: formatCurrency(stats.totalRevenue), icon: DollarSign, trend: revenueTrend, positive: (stats.revenueTrendPct ?? 0) >= 0 },
              { label: 'Total kostnad', value: formatCurrency(stats.totalMachineCosts), icon: TrendingDown, trend: null, positive: true },
              { label: 'Nettoresultat', value: formatCurrency(stats.netResult), icon: TrendingUp, trend: null, positive: stats.netResult >= 0 },
              { label: 'Beläggningsgrad', value: `${stats.avgOccupancy}%`, icon: Activity, trend: null, positive: true },
            ];
            return cards.map(({ label, value, icon: Icon, trend, positive }) => (
              <div key={label} className="relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-[22px] font-bold text-slate-900 mt-1.5 tracking-tight">{value}</p>
                    {trend && (
                      <p className={`text-[11px] mt-1 font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend} vs föregående år
                      </p>
                    )}
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Icon className="w-[18px] h-[18px] text-blue-600" />
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Monthly Revenue + Category */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Link
            href="/statistics/intakter"
            className="group lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Intäkter per månad</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Trendlinje för 12 månader</p>
              </div>
              <span className="flex items-center gap-1 text-[12px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Historik & jämförelse <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueByMonth} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Intäkt']} contentStyle={tooltipStyle} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#grad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-slate-900">Intäkt per kategori</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Fördelning per maskintyp</p>
            </div>
            <ResponsiveContainer width="100%" height={195}>
              <PieChart>
                <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={3} dataKey="value">
                  {revenueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 10, color: '#64748B' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine ROI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[14px] font-semibold text-slate-900">Intäkt vs Kostnad per maskin</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Jämförelse av lönsamhet</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={machineROIData} margin={{ top: 0, right: 0, left: -15, bottom: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} angle={-35} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="intäkt" name="Intäkt" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="kostnad" name="Kostnad" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Customer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[14px] font-semibold text-slate-900">Intäkt per kund (top 8)</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">De mest värdefulla kunderna</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCustomer} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Total intäkt']} contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Intäkt" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Machines Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-slate-900">Maskinlönsamhet – detaljvy</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Sorterat efter total intäkt</p>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100">
                {['Maskin', 'Uthyrningar', 'Dagar', 'Total intäkt', 'Inköpspris', 'Återbetalt', 'ROI'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topMachines.map((machine, i) => {
                const totalCosts = machine.purchasePrice + machine.totalServiceCost + (machine.financingCost + machine.insuranceCost + machine.otherCosts) * 12;
                const roi = calculateROI(machine.totalRevenue, totalCosts);
                const recovery = calculateRecoveryPercent(machine.totalRevenue, machine.purchasePrice);
                return (
                  <tr key={machine.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 flex items-center justify-center text-[11px] font-bold text-slate-400 bg-slate-100 rounded-full shrink-0">{i + 1}</span>
                        <div>
                          <p className="text-[13px] font-medium text-slate-800">{machine.name}</p>
                          <p className="text-[11px] text-slate-400">{machine.brand} · {machine.internalCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500">{machine.totalRentals}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500">{machine.totalRentalDays}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-emerald-600">{formatCurrency(machine.totalRevenue)}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500">{formatCurrency(machine.purchasePrice)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[60px]">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(100, recovery)}%` }} />
                        </div>
                        <span className="text-[12px] font-medium text-slate-600">{recovery}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] font-bold ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{roi}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
