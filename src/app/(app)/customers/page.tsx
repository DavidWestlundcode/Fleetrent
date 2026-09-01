'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Building2, Phone, Mail, TrendingUp, Ban, Download, Check } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, getCustomerTotalSpent } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { exportToCsv } from '@/lib/csv';
import type { Customer } from '@/lib/types';

const PAGE_SIZE = 48;

function customersToCsvRows(list: Customer[], spentMap: Map<string, number>) {
  return list.map((c) => ({
    Företagsnamn: c.companyName,
    'Org.nr': c.orgNumber,
    Kontaktperson: c.contactPerson,
    Telefon: c.phone,
    'E-post': c.email,
    'Aktiva order': c.activeOrders,
    'Totalt spenderat': spentMap.get(c.id) ?? 0,
  }));
}

export default function CustomersPage() {
  const { customers, orders, updateCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);

  const customerSpentMap = useMemo(() => {
    const map = new Map<string, number>();
    customers.forEach((c) => map.set(c.id, getCustomerTotalSpent(orders, c.id)));
    return map;
  }, [customers, orders]);

  const hasActiveFilters = !!search;
  const clearAllFilters = () => setSearch('');

  const filtered = useMemo(
    () => customers.filter((c) => {
      if (!showInactive && c.isActive === false) return false;
      return (
        !search ||
        c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        c.orgNumber.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }),
    [customers, search, showInactive]
  );

  useEffect(() => { setPage(1); }, [search, showInactive]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeactivateConfirm, setBulkDeactivateConfirm] = useState(false);
  useEffect(() => { setSelected(new Set()); }, [page, filtered]);

  const selectedCustomers = customers.filter((c) => selected.has(c.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function bulkDeactivate() {
    selected.forEach((id) => updateCustomer(id, { isActive: false }));
    setSelected(new Set());
    setBulkDeactivateConfirm(false);
  }

  const inactiveCount = customers.filter((c) => c.isActive === false).length;

  const getActiveOrders = (customerId: string) =>
    orders.filter((o) => o.customerId === customerId && (o.status === 'aktiv' || o.status === 'reserverad')).length;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header
        title="Kundregister"
        subtitle={`${customers.length} kunder registrerade`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportToCsv('kunder.csv', customersToCsvRows(filtered, customerSpentMap))}
              className="flex items-center gap-1.5 px-3.5 py-[7px] bg-white text-slate-700 border border-slate-200 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exportera CSV
            </button>
            <Link
              href="/customers/new"
              className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Ny kund
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-3 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Sök kund, kontaktperson, org.nr..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
            />
          </div>
          {inactiveCount > 0 && (
            <button
              onClick={() => setShowInactive((v) => !v)}
              className={`shrink-0 px-3 py-2 text-[13px] font-medium rounded-xl border transition-colors cursor-pointer ${
                showInactive
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {showInactive ? 'Dölj inaktiva' : `Visa inaktiva (${inactiveCount})`}
            </button>
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
                onClick={() => exportToCsv('kunder.csv', customersToCsvRows(selectedCustomers, customerSpentMap))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exportera
              </button>
              <button
                onClick={() => setBulkDeactivateConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                Inaktivera
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((customer) => {
            const activeOrders = getActiveOrders(customer.id);
            const inactive = customer.isActive === false;
            const isSelected = selected.has(customer.id);
            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className={`relative bg-white rounded-2xl border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
                  isSelected ? 'border-blue-400 ring-2 ring-blue-100' :
                  inactive ? 'border-amber-200/80 opacity-60 hover:border-amber-300' : 'border-slate-200/80 hover:border-blue-200/80'
                }`}
              >
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelect(customer.id); }}
                  className={`absolute top-3 left-3 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer z-10 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex items-start gap-3 pl-6">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${inactive ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-600'}`}>
                    {inactive ? <Ban className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{customer.companyName}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Org.nr {customer.orgNumber}</p>
                  </div>
                  {inactive ? (
                    <span className="shrink-0 px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 rounded-full">Inaktiv</span>
                  ) : activeOrders > 0 && (
                    <span className="shrink-0 px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full">
                      {activeOrders} aktiv{activeOrders !== 1 ? 'a' : ''}
                    </span>
                  )}
                </div>

                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] text-slate-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-slate-400 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {customer.email}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Kontaktperson</p>
                    <p className="text-[13px] font-medium text-slate-700 mt-0.5">{customer.contactPerson}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total intäkt</p>
                    <p className="text-[13px] font-semibold text-emerald-600 flex items-center gap-1 justify-end mt-0.5">
                      <TrendingUp className="w-3 h-3" />
                      {formatCurrency(customerSpentMap.get(customer.id) ?? 0)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3">
              {hasActiveFilters ? (
                <EmptyState icon={Search} title="Inga träffar" description="Inga kunder matchar sökningen." actionLabel="Rensa sökning" onAction={clearAllFilters} />
              ) : (
                <EmptyState icon={Building2} title="Inga kunder ännu" description="Lägg till din första kund för att komma igång." actionLabel="Lägg till kund" actionHref="/customers/new" />
              )}
            </div>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={bulkDeactivateConfirm}
        title="Inaktivera kunder"
        message={`Inaktivera ${selected.size} kund${selected.size !== 1 ? 'er' : ''}? De döljs från kundlistan men kan återaktiveras senare.`}
        confirmLabel="Inaktivera"
        onConfirm={bulkDeactivate}
        onCancel={() => setBulkDeactivateConfirm(false)}
      />
    </div>
  );
}
