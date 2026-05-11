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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Kundregister"
        subtitle={`${customers.length} kunder registrerade`}
        actions={
          <Link
            href="/customers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ny kund
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Sök kund, kontaktperson, org.nr..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer) => {
            const activeOrders = getActiveOrders(customer.id);
            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{customer.companyName}</h3>
                    <p className="text-xs text-slate-500">Org.nr {customer.orgNumber}</p>
                  </div>
                  {activeOrders > 0 && (
                    <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {activeOrders} aktiv{activeOrders !== 1 ? 'a' : ''}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {customer.email}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Kontaktperson</p>
                    <p className="text-sm font-medium text-slate-700">{customer.contactPerson}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total hyresintäkt</p>
                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 py-12 text-center text-slate-400">Inga kunder hittades</div>
          )}
        </div>
      </div>
    </div>
  );
}
