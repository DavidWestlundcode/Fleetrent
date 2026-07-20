'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Truck, ClipboardList, Building2 } from 'lucide-react';
import { useStore } from '@/store';

const MAX_PER_GROUP = 5;

export default function GlobalSearch() {
  const { machines, orders, customers } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const q = query.trim().toLowerCase();

  const matchedMachines = useMemo(() => {
    if (!q) return [];
    return machines
      .filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.internalCode.toLowerCase().includes(q) ||
        m.serialNumber.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_GROUP);
  }, [machines, q]);

  const matchedCustomers = useMemo(() => {
    if (!q) return [];
    return customers
      .filter((c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.orgNumber.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
      .slice(0, MAX_PER_GROUP);
  }, [customers, q]);

  const matchedOrders = useMemo(() => {
    if (!q) return [];
    return orders
      .filter((o) => {
        const customer = customers.find((c) => c.id === o.customerId);
        const machine = machines.find((m) => m.id === o.machineId);
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          customer?.companyName.toLowerCase().includes(q) ||
          machine?.name.toLowerCase().includes(q)
        );
      })
      .slice(0, MAX_PER_GROUP);
  }, [orders, machines, customers, q]);

  const hasResults = matchedMachines.length > 0 || matchedOrders.length > 0 || matchedCustomers.length > 0;

  return (
    <div ref={ref} className="relative hidden md:block">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Sök..."
        className="pl-8 pr-3 py-1.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-44 transition-all placeholder:text-slate-400"
      />

      {open && q && (
        <div className="absolute right-0 top-full mt-2 w-[320px] max-h-[420px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 z-50 flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1">
            {!hasResults ? (
              <p className="px-4 py-8 text-center text-[13px] text-slate-400">Inga träffar</p>
            ) : (
              <div className="p-2 space-y-3">
                {matchedMachines.length > 0 && (
                  <ResultGroup icon={<Truck className="w-3.5 h-3.5" />} label="Maskiner">
                    {matchedMachines.map((m) => (
                      <ResultLink key={m.id} href={`/machines/${m.id}`} onClick={() => setOpen(false)} title={m.name} subtitle={`${m.brand} ${m.model} · ${m.internalCode}`} />
                    ))}
                  </ResultGroup>
                )}
                {matchedOrders.length > 0 && (
                  <ResultGroup icon={<ClipboardList className="w-3.5 h-3.5" />} label="Ordrar">
                    {matchedOrders.map((o) => {
                      const customer = customers.find((c) => c.id === o.customerId);
                      return (
                        <ResultLink key={o.id} href={`/orders/${o.id}`} onClick={() => setOpen(false)} title={o.orderNumber} subtitle={customer?.companyName ?? ''} />
                      );
                    })}
                  </ResultGroup>
                )}
                {matchedCustomers.length > 0 && (
                  <ResultGroup icon={<Building2 className="w-3.5 h-3.5" />} label="Kunder">
                    {matchedCustomers.map((c) => (
                      <ResultLink key={c.id} href={`/customers/${c.id}`} onClick={() => setOpen(false)} title={c.companyName} subtitle={c.contactPerson} />
                    ))}
                  </ResultGroup>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
        {icon} {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ResultLink({ href, onClick, title, subtitle }: { href: string; onClick: () => void; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <span className="text-[12.5px] font-medium text-slate-800 truncate">{title}</span>
      {subtitle && <span className="text-[11.5px] text-slate-400 truncate">{subtitle}</span>}
    </Link>
  );
}
