'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Trash2, ClipboardList, Download, ArrowUp, ArrowDown, Send, Loader2, Receipt } from 'lucide-react';
import Header from '@/components/layout/Header';
import { OrderStatusBadge, LongTermBadge } from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { exportToCsv } from '@/lib/csv';
import { useStore } from '@/store';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import type { Order, OrderStatus, Machine, Customer, InvoicePeriod } from '@/lib/types';

const DAYS_THRESHOLD = 30;

function daysSinceLastInvoice(order: Order): number {
  const periods = order.invoicePeriods ?? [];
  const referenceDate = periods.length > 0
    ? periods.reduce((latest, p) => p.endDate > latest ? p.endDate : latest, periods[0].endDate)
    : order.startDate;
  return Math.floor((Date.now() - new Date(referenceDate).getTime()) / 86400000);
}

function needsPartialInvoice(order: Order): boolean {
  if (order.status !== 'aktiv' || order.isLongTerm) return false;
  return daysSinceLastInvoice(order) >= DAYS_THRESHOLD;
}
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 50;

function SortHeader<K extends string>({ label, column, activeKey, dir, onSort, className = '' }: {
  label: string; column: K; activeKey: K | null; dir: 'asc' | 'desc'; onSort: (col: K) => void; className?: string;
}) {
  const active = activeKey === column;
  return (
    <th
      onClick={() => onSort(column)}
      className={`text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors ${active ? 'text-slate-700' : 'text-slate-400 hover:text-slate-600'} ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </span>
    </th>
  );
}

type StatusFilter = OrderStatus | 'all' | '30_dagar' | 'returning_soon' | 'avtalshyra';

const VALID_STATUSES: OrderStatus[] = ['aktiv', 'reserverad', 'forsenad', 'klar_for_fakturering', 'avslutad', 'annullerad'];

function isReturningSoon(order: Order): boolean {
  if (order.status !== 'aktiv') return false;
  const days = daysUntil(order.plannedReturnDate);
  return days >= 0 && days <= 7;
}

function ordersToCsvRows(list: Order[], machines: Machine[], customers: Customer[]) {
  return list.map((o) => ({
    Ordernummer: o.orderNumber,
    Kund: customers.find((c) => c.id === o.customerId)?.companyName ?? '',
    Maskin: machines.find((m) => m.id === o.machineId)?.name ?? '',
    Startdatum: o.startDate,
    'Planerad retur': o.plannedReturnDate,
    Belopp: o.totalPrice,
    Status: o.status,
  }));
}

function OrdersPageInner() {
  const searchParams = useSearchParams();
  const { orders, machines, customers, deleteOrder, markInvoicePeriodSent, updateOrder } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    if (searchParams.get('returningSoon') === '1') return 'returning_soon';
    const status = searchParams.get('status');
    if (status && VALID_STATUSES.includes(status as OrderStatus)) return status as OrderStatus;
    return 'all';
  });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; orderNumber: string; hasHistory: boolean } | null>(null);
  const [rentalTypeFilter, setRentalTypeFilter] = useState<'all' | 'avtalshyra' | 'vanlig'>('all');

  const hasActiveFilters = statusFilter !== 'all' || !!search;
  const clearAllFilters = () => { setStatusFilter('all'); setSearch(''); };

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
        const matchesStatus =
          statusFilter === 'all' ? true :
          statusFilter === '30_dagar' ? needsPartialInvoice(o) :
          statusFilter === 'returning_soon' ? isReturningSoon(o) :
          o.status === statusFilter;
        const matchesRentalType =
          statusFilter !== 'aktiv' || rentalTypeFilter === 'all' ? true :
          rentalTypeFilter === 'avtalshyra' ? !!o.isLongTerm :
          !o.isLongTerm;
        return matchesSearch && matchesStatus && matchesRentalType;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, machines, customers, search, statusFilter, rentalTypeFilter]);

  useEffect(() => { setPage(1); }, [search, statusFilter, rentalTypeFilter]);
  useEffect(() => { if (statusFilter !== 'aktiv') setRentalTypeFilter('all'); }, [statusFilter]);

  type SortKey = 'orderNumber' | 'startDate' | 'plannedReturnDate' | 'totalPrice';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? ''), 'sv') * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  useEffect(() => { setSelected(new Set()); }, [page, filtered]);

  const selectedOrders = orders.filter((o) => selected.has(o.id));
  const allVisibleSelected = paginated.length > 0 && paginated.every((o) => selected.has(o.id));

  function toggleSelectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) paginated.forEach((o) => next.delete(o.id));
      else paginated.forEach((o) => next.add(o.id));
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function bulkDelete() {
    selected.forEach((id) => deleteOrder(id));
    setSelected(new Set());
    setBulkDeleteConfirm(false);
  }

  // Pending "delfakturor" from contract-billed (avtalshyra) orders, awaiting review + send to Fortnox
  const pendingContractInvoices = useMemo(() => {
    return orders
      .filter((o) => o.isLongTerm)
      .flatMap((o) =>
        (o.invoicePeriods ?? [])
          .filter((p) => !p.sentToAccounting)
          .map((p) => ({ order: o, period: p }))
      )
      .sort((a, b) => a.period.startDate.localeCompare(b.period.startDate));
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    counts['30_dagar'] = orders.filter(needsPartialInvoice).length;
    counts['avtalshyra'] = pendingContractInvoices.length;
    return counts;
  }, [orders, pendingContractInvoices]);

  const statusLabels: Record<string, string> = {
    all: 'Alla', aktiv: 'Aktiva', reserverad: 'Reserverade',
    forsenad: 'Försenade', '30_dagar': '30 dagar',
    avtalshyra: 'Avtalshyra',
    klar_for_fakturering: 'Klar för fakturering',
    avslutad: 'Avslutade', annullerad: 'Annullerade',
  };

  const [selectedPeriods, setSelectedPeriods] = useState<Set<string>>(new Set());
  const [sendingContractInvoices, setSendingContractInvoices] = useState(false);
  const [contractInvoiceErrors, setContractInvoiceErrors] = useState<string[]>([]);
  const [sendingSinglePeriodId, setSendingSinglePeriodId] = useState<string | null>(null);

  const allContractInvoicesSelected = pendingContractInvoices.length > 0 &&
    pendingContractInvoices.every(({ period }) => selectedPeriods.has(period.id));

  function toggleSelectAllContractInvoices() {
    setSelectedPeriods((prev) => {
      const next = new Set(prev);
      if (allContractInvoicesSelected) pendingContractInvoices.forEach(({ period }) => next.delete(period.id));
      else pendingContractInvoices.forEach(({ period }) => next.add(period.id));
      return next;
    });
  }

  function toggleSelectPeriod(id: string) {
    setSelectedPeriods((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const [generatingContractInvoices, setGeneratingContractInvoices] = useState(false);
  const [generateResultMsg, setGenerateResultMsg] = useState<string | null>(null);

  async function generateContractInvoicesNow() {
    setGeneratingContractInvoices(true);
    setGenerateResultMsg(null);
    setContractInvoiceErrors([]);
    try {
      const res = await fetch('/api/orders/generate-contract-invoices', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setContractInvoiceErrors([data.error ?? 'Okänt fel']);
        return;
      }
      (data.updatedOrders as { id: string; invoicePeriods: InvoicePeriod[] }[]).forEach(({ id, invoicePeriods }) => {
        updateOrder(id, { invoicePeriods });
      });
      setGenerateResultMsg(
        data.generated > 0
          ? `${data.generated} ny${data.generated !== 1 ? 'a' : ''} delfaktura${data.generated !== 1 ? 'or' : ''} genererad${data.generated !== 1 ? 'e' : ''}.`
          : 'Inga nya delfakturor att generera just nu — allt redan fakturerat fram till idag.'
      );
      if (data.errors?.length > 0) setContractInvoiceErrors(data.errors);
    } catch (e) {
      setContractInvoiceErrors([e instanceof Error ? e.message : 'Okänt fel']);
    } finally {
      setGeneratingContractInvoices(false);
    }
  }

  async function sendPeriodToFortnox(orderId: string, periodId: string): Promise<string | null> {
    try {
      const res = await fetch('/api/fortnox/create-partial-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, periodId }),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? 'Okänt fel';
      markInvoicePeriodSent(orderId, periodId, data.fortnoxOrderNumber);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Okänt fel';
    }
  }

  async function sendSinglePeriod(orderId: string, periodId: string, orderNumber: string) {
    setSendingSinglePeriodId(periodId);
    setContractInvoiceErrors([]);
    const err = await sendPeriodToFortnox(orderId, periodId);
    if (err) setContractInvoiceErrors([`${orderNumber}: ${err}`]);
    setSendingSinglePeriodId(null);
  }

  async function sendSelectedContractInvoices() {
    setSendingContractInvoices(true);
    setContractInvoiceErrors([]);
    const errs: string[] = [];
    const targets = pendingContractInvoices.filter(({ period }) => selectedPeriods.has(period.id));
    for (const { order, period } of targets) {
      const err = await sendPeriodToFortnox(order.id, period.id);
      if (err) errs.push(`${order.orderNumber}: ${err}`);
    }
    setContractInvoiceErrors(errs);
    setSelectedPeriods(new Set());
    setSendingContractInvoices(false);
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header
        title="Uthyrningsorder"
        subtitle={`${orders.length} order totalt`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportToCsv('ordrar.csv', ordersToCsvRows(filtered, machines, customers))}
              className="flex items-center gap-1.5 px-3.5 py-[7px] bg-white text-slate-700 border border-slate-200 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exportera CSV
            </button>
            <Link
              href="/orders/new"
              className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Ny order
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-3 sm:p-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'aktiv', 'reserverad', 'forsenad', '30_dagar', 'avtalshyra', 'klar_for_fakturering', 'avslutad', 'annullerad'] as const).map((s) => {
            const count = statusCounts[s] ?? 0;
            const isThirty = s === '30_dagar';
            const isAvtalshyra = s === 'avtalshyra';
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? isThirty ? 'bg-orange-500 text-white' : isAvtalshyra ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                    : isThirty && count > 0
                      ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                      : isAvtalshyra && count > 0
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {statusLabels[s]}
                <span className={`ml-1.5 text-[11px] ${isActive ? 'text-white/60' : isThirty && count > 0 ? 'text-orange-500 font-semibold' : isAvtalshyra && count > 0 ? 'text-blue-500 font-semibold' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {statusFilter === 'avtalshyra' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[13px] text-slate-500">
              Väntande delfakturor från avtalshyra-ordrar. Nya delfakturor genereras automatiskt i slutet av varje månad — granska och skicka in dem till Fortnox här.
            </p>
            <button
              onClick={generateContractInvoicesNow}
              disabled={generatingContractInvoices}
              className="flex items-center gap-1.5 px-3.5 py-[7px] bg-white text-slate-700 border border-slate-200 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 shrink-0"
            >
              {generatingContractInvoices ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
              Generera nu
            </button>
          </div>

          {generateResultMsg && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-[12.5px] text-blue-700">{generateResultMsg}</p>
            </div>
          )}

          {contractInvoiceErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
              {contractInvoiceErrors.map((e, i) => (
                <p key={i} className="text-[12.5px] text-red-700">{e}</p>
              ))}
            </div>
          )}

          {selectedPeriods.size > 0 && (
            <div className="flex items-center gap-3 flex-wrap bg-slate-900 text-white rounded-xl px-4 py-2.5">
              <span className="text-[12.5px] font-medium">{selectedPeriods.size} valda</span>
              <button onClick={() => setSelectedPeriods(new Set())} className="text-[12px] text-slate-300 hover:text-white cursor-pointer">
                Avmarkera
              </button>
              <button
                onClick={sendSelectedContractInvoices}
                disabled={sendingContractInvoices}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {sendingContractInvoices ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Skicka valda till Fortnox
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" checked={allContractInvoicesSelected} onChange={toggleSelectAllContractInvoices} className="cursor-pointer" />
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kund</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maskin</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Period</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Belopp</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingContractInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState icon={Receipt} title="Inga väntande delfakturor" description="Delfakturor för avtalshyra-ordrar dyker upp här när de genereras i slutet av månaden." />
                    </td>
                  </tr>
                )}
                {pendingContractInvoices.map(({ order, period }: { order: Order; period: InvoicePeriod }) => {
                  const machine = machines.find((m) => m.id === order.machineId);
                  const customer = customers.find((c) => c.id === order.customerId);
                  return (
                    <tr key={period.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-3.5">
                        <input type="checkbox" checked={selectedPeriods.has(period.id)} onChange={() => toggleSelectPeriod(period.id)} className="cursor-pointer" />
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/orders/${order.id}`} className="text-[13px] font-medium text-blue-600 hover:underline">{order.orderNumber}</Link>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-700">{customer?.companyName ?? '–'}</td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-500">{machine?.name ?? '–'}</td>
                      <td className="px-4 py-3.5 text-[13px] text-slate-500">{formatDate(period.startDate)} – {formatDate(period.endDate)}</td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-slate-700">{formatCurrency(period.amount)}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => sendSinglePeriod(order.id, period.id, order.orderNumber)}
                          disabled={sendingSinglePeriodId === period.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {sendingSinglePeriodId === period.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Skicka
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
        ) : (
        <>
        {/* Search + rental type filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Sök ordernr, kund, maskin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
            />
          </div>
          {statusFilter === 'aktiv' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {(['all', 'avtalshyra', 'vanlig'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setRentalTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                    rentalTypeFilter === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t === 'all' ? 'Alla' : t === 'avtalshyra' ? 'Avtalshyra' : 'Vanlig hyra'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk actions toolbar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 flex-wrap bg-slate-900 text-white rounded-xl px-4 py-2.5">
            <span className="text-[12.5px] font-medium">{selected.size} valda</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-slate-300 hover:text-white cursor-pointer">
              Avmarkera
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => exportToCsv('ordrar.csv', ordersToCsvRows(selectedOrders, machines, customers))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exportera
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ta bort
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} className="cursor-pointer" />
                </th>
                <SortHeader label="Ordernr" column="orderNumber" activeKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-5" />
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kund</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maskin</th>
                <SortHeader label="Start" column="startDate" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Retur" column="plannedReturnDate" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Belopp" column="totalPrice" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    {hasActiveFilters ? (
                      <EmptyState icon={Search} title="Inga träffar" description="Inga ordrar matchar sökningen eller filtret." actionLabel="Rensa filter" onAction={clearAllFilters} />
                    ) : (
                      <EmptyState icon={ClipboardList} title="Inga ordrar ännu" description="Skapa din första uthyrningsorder för att komma igång." actionLabel="Skapa order" actionHref="/orders/new" />
                    )}
                  </td>
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
                    <td className="px-3 py-3.5">
                      <input type="checkbox" checked={selected.has(order.id)} onChange={() => toggleSelect(order.id)} className="cursor-pointer" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-slate-800">{order.orderNumber}</span>
                        {order.isLongTerm && <LongTermBadge />}
                      </div>
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
                            const hasHistory = !!order.actualReturnDate || !!order.sentToAccounting || (order.invoicePeriods?.length ?? 0) > 0;
                            setDeleteTarget({ id: order.id, orderNumber: order.orderNumber, hasHistory });
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
        </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Radera order"
        message={
          deleteTarget?.hasHistory
            ? `Order ${deleteTarget?.orderNumber} har återlämnings-/faktureringshistorik. Om du raderar den nollställs maskinens och kundens totaler bakåt. Detta går inte att ångra.`
            : `Är du säker på att du vill radera order ${deleteTarget?.orderNumber}? Åtgärden kan inte ångras.`
        }
        onConfirm={() => { if (deleteTarget) deleteOrder(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={bulkDeleteConfirm}
        title="Radera ordrar"
        message={`Är du säker på att du vill radera ${selected.size} order${selected.size !== 1 ? 'er' : ''}? Åtgärden kan inte ångras.`}
        onConfirm={bulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 text-slate-400">Laddar...</div>}>
      <OrdersPageInner />
    </Suspense>
  );
}
