'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 50;

export default function OrdersPage() {
  const { orders, machines, customers, deleteOrder } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);

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

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return counts;
  }, [orders]);

  const statusLabels: Record<string, string> = {
    all: 'Alla', aktiv: 'Aktiva', reserverad: 'Reserverade',
    forsenad: 'Försenade', klar_for_fakturering: 'Klar för fakturering',
    avslutad: 'Avslutade', annullerad: 'Annullerade',
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header
        title="Uthyrningsorder"
        subtitle={`${orders.length} order totalt`}
        actions={
          <Link
            href="/orders/new"
            className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Ny order
          </Link>
        }
      />

      <div className="flex-1 p-3 sm:p-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'aktiv', 'reserverad', 'forsenad', 'klar_for_fakturering', 'avslutad', 'annullerad'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {statusLabels[s]}
              <span className={`ml-1.5 text-[11px] ${statusFilter === s ? 'text-white/60' : 'text-slate-400'}`}>
                {statusCounts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Sök ordernr, kund, maskin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ordernr</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kund</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maskin</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Start</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Retur</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Belopp</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-[13px] text-slate-400">Inga order hittades</td>
                </tr>
              )}
              {paginated.map((order) => {
                const machine = machines.find((m) => m.id === order.machineId);
                const customer = customers.find((c) => c.id === order.customerId);
                const isOverdue = order.status === 'aktiv' && !!order.plannedReturnDate && new Date(order.plannedReturnDate) < new Date();
                const daysRemaining = order.plannedReturnDate ? daysUntil(order.plannedReturnDate) : null;
                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${isOverdue ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-slate-800">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-700">{customer?.companyName ?? '–'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-500">{machine?.name ?? '–'}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-500">{formatDate(order.startDate)}</td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="text-[13px] text-slate-500">
                          {order.plannedReturnDate ? formatDate(order.plannedReturnDate) : 'Löpande'}
                        </span>
                        {order.status === 'aktiv' && daysRemaining !== null && (
                          <p className={`text-[11px] mt-0.5 font-medium ${isOverdue ? 'text-red-600' : daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {isOverdue ? `${Math.abs(daysRemaining)} dagar sen` : `${daysRemaining} dagar kvar`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-slate-700">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-4 py-3.5"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-[12px] font-medium text-blue-600 hover:text-blue-700"
                        >
                          Visa →
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Radera order ${order.orderNumber}?`)) deleteOrder(order.id);
                          }}
                          className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <div className="px-5 py-3">
            <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
