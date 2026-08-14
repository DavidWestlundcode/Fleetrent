'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ArrowLeft, ChevronLeft, ChevronRight, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, getYearlyRevenueComparison, getOrderYearRange } from '@/lib/utils';

export default function RevenueHistoryPage() {
  const { orders } = useStore();
  const yearRange = useMemo(() => getOrderYearRange(orders), [orders]);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const data = useMemo(() => getYearlyRevenueComparison(orders, selectedYear), [orders, selectedYear]);

  const totalCurrent = data.reduce((s, m) => s + m.current, 0);
  const totalPrevious = data.reduce((s, m) => s + m.previous, 0);
  const changePct = totalPrevious > 0 ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100) : null;

  const tooltipStyle = {
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    fontSize: 12,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header title="Intäkter per månad" subtitle="Historik och årsjämförelse" />

      <div className="flex-1 p-6 space-y-5">
        <Link href="/statistics" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Tillbaka till statistik
        </Link>

        {/* Year navigator */}
        <div className="flex items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            disabled={selectedYear <= yearRange.min}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[18px] font-bold text-slate-900 w-20 text-center tabular-nums">{selectedYear}</span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            disabled={selectedYear >= yearRange.max}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Intäkt {selectedYear}</p>
            <p className="text-[22px] font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(totalCurrent)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Intäkt {selectedYear - 1}</p>
            <p className="text-[22px] font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(totalPrevious)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Förändring</p>
            <p className={`text-[22px] font-bold mt-1.5 tracking-tight flex items-center gap-2 ${changePct === null ? 'text-slate-400' : changePct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {changePct === null ? '–' : (
                <>
                  {changePct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {changePct >= 0 ? `+${changePct}` : changePct}%
                </>
              )}
            </p>
          </div>
        </div>

        {/* Comparison chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <h2 className="text-[14px] font-semibold text-slate-900">{selectedYear} jämfört med {selectedYear - 1}</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: '#F8FAFC' }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="previous" name={`${selectedYear - 1}`} fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name={`${selectedYear}`} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly breakdown table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-slate-900">Månad för månad</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Månad</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{selectedYear}</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{selectedYear - 1}</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Förändring</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((m) => {
                  const pct = m.previous > 0 ? Math.round(((m.current - m.previous) / m.previous) * 100) : null;
                  return (
                    <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 text-[13px] font-medium text-slate-800">{m.month}</td>
                      <td className="px-5 py-3 text-[13px] text-right text-slate-700">{formatCurrency(m.current)}</td>
                      <td className="px-5 py-3 text-[13px] text-right text-slate-500">{formatCurrency(m.previous)}</td>
                      <td className={`px-5 py-3 text-[13px] text-right font-medium ${pct === null ? 'text-slate-300' : pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pct === null ? '–' : `${pct >= 0 ? '+' : ''}${pct}%`}
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
