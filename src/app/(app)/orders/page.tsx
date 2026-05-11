'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

export default function OrdersPage() {
  const { orders, machines, customers } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        const machine = machines.find((m) => m.id === o.machineId);
        const customer = customers.find((c) => c.id === o.customerId);
        const matchesSearch =
          !search ||
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          customer?.companyName.toLowerCase().includes(search.toLowerCase()) ||
          machine?.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, machines, customers, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return counts;
  }, [orders]);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Uthyrningsorder"
        subtitle={`${orders.length} order totalt`}
        actions={
          <Link
            href="/orders/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ny order
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'aktiv', 'reserverad', 'forsenad', 'avslutad', 'annullerad'] as const).map((s) => {
            const labels: Record<string, string> = {
              all: 'Alla', aktiv: 'Aktiva', reserverad: 'Reserverade', forsenad: 'Försenade',
              avslutad: 'Avslutade', annullerad: 'Annullerade',
            };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {labels[s]} <span className={`ml-1 text-xs ${statusFilter === s ? 'text-blue-200' : 'text-slate-400'}`}>{statusCounts[s] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Sök ordernr, kund, maskin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordernr</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kund</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Maskin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Startdatum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Retur (planerat)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Belopp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">Inga order hittades</td>
                </tr>
              )}
              {filtered.map((order) => {
                const machine = machines.find((m) => m.id === order.machineId);
                const customer = customers.find((c) => c.id === order.customerId);
                const isOverdue = order.status === 'aktiv' && new Date(order.plannedReturnDate) < new Date();
                const daysRemaining = daysUntil(order.plannedReturnDate);
                return (
                  <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-800">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{customer?.companyName ?? '–'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{machine?.name ?? '–'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(order.startDate)}</td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="text-slate-600">{formatDate(order.plannedReturnDate)}</span>
                        {order.status === 'aktiv' && (
                          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-600 font-medium' : daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {isOverdue ? `${Math.abs(daysRemaining)} dagar sen` : `${daysRemaining} dagar kvar`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-4 py-3.5"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3.5">
                      <Link href={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Visa</Link>
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
