'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Building2, Phone, Mail, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';

export default function CustomersPage() {
  const { customers, orders } = useStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => customers.filter(
      (c) =>
        !search ||
        c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        c.orgNumber.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    ),
    [customers, search]
  );

  const getActiveOrders = (customerId: string) =>
    orders.filter((o) => o.customerId === customerId && (o.status === 'aktiv' || o.status === 'reserverad')).length;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header
        title="Kundregister"
        subtitle={`${customers.length} kunder registrerade`}
        actions={
          <Link
            href="/customers/new"
            className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Ny kund
          </Link>
        }
      />

      <div className="flex-1 p-3 sm:p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Sök kund, kontaktperson, org.nr..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer) => {
            const activeOrders = getActiveOrders(customer.id);
            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200/80 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{customer.companyName}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Org.nr {customer.orgNumber}</p>
                  </div>
                  {activeOrders > 0 && (
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
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 py-14 text-center text-[13px] text-slate-400">Inga kunder hittades</div>
          )}
        </div>
      </div>
    </div>
  );
}
