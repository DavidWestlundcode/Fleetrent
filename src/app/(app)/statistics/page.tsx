'use client';
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Truck, DollarSign, BarChart2, Activity } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, calculateROI, calculateRecoveryPercent, getMonthlyRevenueData } from '@/lib/utils';
import { CATEGORY_LABELS, type MachineCategory } from '@/lib/types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

export default function StatisticsPage() {
  const { machines, orders, customers } = useStore();

  const stats = useMemo(() => {
    const totalRevenue = orders.filter((o) => o.status === 'avslutad' || o.status === 'aktiv').reduce((s, o) => s + o.totalPrice, 0);
    const totalMachineCosts = machines.reduce((s, m) => s + m.purchasePrice + m.totalServiceCost + (m.financingCost + m.insuranceCost + m.otherCosts) * 12, 0);
    const netResult = totalRevenue - totalMachineCosts;
    const avgOccupancy = machines.length > 0 ? Math.round((machines.filter((m) => m.status === 'uthyrd' || m.status === 'reserverad').length / machines.length) * 100) : 0;
    const totalRentals = orders.filter((o) => o.status === 'avslutad').length;
    return { totalRevenue, totalMachineCosts, netResult, avgOccupancy, totalRentals };
  }, [machines, orders]);

  const revenueByMonth = useMemo(() => getMonthlyRevenueData(orders), [orders]);

  const revenueByCategory = useMemo(() => {
    const byCategory: Record<string, number> = {};
    machines.forEach((m) => {
      const label = CATEGORY_LABELS[m.category];
      byCategory[label] = (byCategory[label] ?? 0) + m.totalRevenue;
    });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
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

  const idleMachines = useMemo(() =>
    machines.filter((m) => m.status === 'i_lager' && m.totalRentals > 0)
      .sort((a, b) => (a.totalRentalDays / a.totalRentals) - (b.totalRentalDays / b.totalRentals)).slice(0, 5),
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

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Statistik & Lönsamhet" subtitle="Fullständig analys av flottan och intäkter" />

      <div className="flex-1 p-6 space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total intäkt', value: formatCurrency(stats.totalRevenue), icon: DollarSign, trend: '+12%', positive: true },
            { label: 'Total kostnad', value: formatCurrency(stats.totalMachineCosts), icon: TrendingDown, trend: '-3%', positive: true },
            { label: 'Nettoresultat', value: formatCurrency(stats.netResult), icon: TrendingUp, trend: stats.netResult > 0 ? '+8%' : '-', positive: stats.netResult > 0 },
            { label: 'Beläggningsgrad', value: `${stats.avgOccupancy}%`, icon: Activity, trend: '', positive: true },
          ].map(({ label, value, icon: Icon, trend, positive }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
                  {trend && (
                    <p className={`text-xs mt-1 font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{trend} vs föregående år</p>
                  )}
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Revenue + Category breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Intäkter per månad</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueByMonth} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Intäkt']} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Intäkt per kategori</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {revenueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 10, color: '#64748B' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine ROI bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Intäkt vs Kostnad per maskin</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={machineROIData} margin={{ top: 0, right: 0, left: -10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} angle={-35} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend />
              <Bar dataKey="intäkt" name="Intäkt" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="kostnad" name="Kostnad" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Customer */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Intäkt per kund (top 8)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCustomer} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Total intäkt']} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="value" name="Intäkt" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Machines Table */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Maskinlönsamhet – detaljvy</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Maskin', 'Uthyrningar', 'Dagar', 'Total intäkt', 'Inköpspris', 'Återbetalt', 'ROI'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topMachines.map((machine, i) => {
                const totalCosts = machine.purchasePrice + machine.totalServiceCost + (machine.financingCost + machine.insuranceCost + machine.otherCosts) * 12;
                const roi = calculateROI(machine.totalRevenue, totalCosts);
                const recovery = calculateRecoveryPercent(machine.totalRevenue, machine.purchasePrice);
                return (
                  <tr key={machine.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-100 rounded-full">{i + 1}</span>
                        <div>
                          <p className="font-medium text-slate-800">{machine.name}</p>
                          <p className="text-xs text-slate-500">{machine.brand} · {machine.internalCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{machine.totalRentals}</td>
                    <td className="px-4 py-3 text-slate-600">{machine.totalRentalDays}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(machine.totalRevenue)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(machine.purchasePrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-16">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(100, recovery)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{recovery}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{roi}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
