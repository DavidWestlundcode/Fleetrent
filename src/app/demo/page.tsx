'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, LayoutDashboard, Truck, Users, FileText,
  TrendingUp, Clock, Activity, Package,
} from 'lucide-react';

type MachineStatus = 'i_lager' | 'uthyrd' | 'reserverad' | 'service' | 'skadad';
type OrderStatus = 'aktiv' | 'avslutad' | 'forsenad' | 'klar_for_fakturering' | 'reserverad';
type Tab = 'dashboard' | 'maskiner' | 'kunder' | 'order';

const MACHINE_BADGE: Record<MachineStatus, { bg: string; dot: string; label: string }> = {
  i_lager:    { bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80', dot: 'bg-emerald-500', label: 'I lager' },
  uthyrd:     { bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',          dot: 'bg-blue-500',    label: 'Uthyrd' },
  reserverad: { bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',       dot: 'bg-amber-400',   label: 'Reserverad' },
  service:    { bg: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/80',    dot: 'bg-orange-500',  label: 'Service' },
  skadad:     { bg: 'bg-red-50 text-red-700 ring-1 ring-red-200/80',             dot: 'bg-red-500',     label: 'Skadad' },
};

const ORDER_BADGE: Record<OrderStatus, { bg: string; dot: string; label: string }> = {
  aktiv:                { bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',          dot: 'bg-blue-500',    label: 'Aktiv' },
  reserverad:           { bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',       dot: 'bg-amber-400',   label: 'Reserverad' },
  forsenad:             { bg: 'bg-red-50 text-red-700 ring-1 ring-red-200/80',             dot: 'bg-red-500',     label: 'Försenad' },
  klar_for_fakturering: { bg: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80',    dot: 'bg-violet-500',  label: 'Klar för fakturering' },
  avslutad:             { bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80', dot: 'bg-emerald-500', label: 'Avslutad' },
};

function MachineBadge({ status }: { status: MachineStatus }) {
  const s = MACHINE_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function OrderBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

const MACHINES: { id: string; name: string; brand: string; model: string; internalCode: string; category: string; status: MachineStatus }[] = [
  { id: 'm1', name: 'Toyota 8FBN25',       brand: 'Toyota',      model: '8FBN25',  internalCode: 'TRK-001', category: 'Motviktstruck',    status: 'uthyrd' },
  { id: 'm2', name: 'Toyota 8FBE20',       brand: 'Toyota',      model: '8FBE20',  internalCode: 'TRK-002', category: 'Motviktstruck',    status: 'i_lager' },
  { id: 'm3', name: 'Volvo L60H',          brand: 'Volvo',       model: 'L60H',    internalCode: 'HJL-001', category: 'Hjullastare',      status: 'uthyrd' },
  { id: 'm4', name: 'CAT 308CR',           brand: 'Caterpillar', model: '308CR',   internalCode: 'GRV-001', category: 'Grävmaskin',       status: 'service' },
  { id: 'm5', name: 'Manitou MLT845',      brand: 'Manitou',     model: 'MLT845',  internalCode: 'TEL-001', category: 'Teleskoplastare',  status: 'i_lager' },
  { id: 'm6', name: 'Jungheinrich ETV216', brand: 'Jungheinrich',model: 'ETV216',  internalCode: 'SKJ-001', category: 'Skjutstativtruck', status: 'reserverad' },
  { id: 'm7', name: 'BT Reflex RRE160',    brand: 'BT',          model: 'RRE160',  internalCode: 'SKJ-002', category: 'Skjutstativtruck', status: 'i_lager' },
  { id: 'm8', name: 'Bobcat E35',          brand: 'Bobcat',      model: 'E35',     internalCode: 'GRV-002', category: 'Grävmaskin',       status: 'skadad' },
];

const CUSTOMERS = [
  { id: 'c1', companyName: 'Lindström Bygg AB',         orgNumber: '556712-3489', customerNumber: '1042' },
  { id: 'c2', companyName: 'Björk & Söner Anläggning',  orgNumber: '556843-7712', customerNumber: '1098' },
  { id: 'c3', companyName: 'NordMark Hyrmaskiner AB',    orgNumber: '556601-2234', customerNumber: '1031' },
  { id: 'c4', companyName: 'Svensson Entreprenad HB',    orgNumber: '556934-5501', customerNumber: '1207' },
  { id: 'c5', companyName: 'Eriksson Lager & Logistik',  orgNumber: '556488-9023', customerNumber: '1055' },
  { id: 'c6', companyName: 'Karlberg Transport AB',      orgNumber: '556777-1198', customerNumber: '1178' },
];

const ORDERS: { id: string; orderNumber: string; customerId: string; machineId: string; startDate: string; returnDate: string; amount: number; status: OrderStatus }[] = [
  { id: 'o1', orderNumber: 'FR-202605-4421', customerId: 'c1', machineId: 'm1', startDate: '2026-05-10', returnDate: '2026-06-10', amount: 18600, status: 'aktiv' },
  { id: 'o2', orderNumber: 'FR-202605-3817', customerId: 'c2', machineId: 'm3', startDate: '2026-05-15', returnDate: '2026-06-05', amount: 22400, status: 'forsenad' },
  { id: 'o3', orderNumber: 'FR-202604-2990', customerId: 'c3', machineId: 'm7', startDate: '2026-04-20', returnDate: '2026-05-20', amount: 15200, status: 'klar_for_fakturering' },
  { id: 'o4', orderNumber: 'FR-202606-0112', customerId: 'c4', machineId: 'm6', startDate: '2026-06-01', returnDate: '2026-06-30', amount: 19800, status: 'reserverad' },
  { id: 'o5', orderNumber: 'FR-202603-7744', customerId: 'c5', machineId: 'm2', startDate: '2026-03-01', returnDate: '2026-04-01', amount: 17500, status: 'avslutad' },
  { id: 'o6', orderNumber: 'FR-202604-5539', customerId: 'c6', machineId: 'm5', startDate: '2026-04-05', returnDate: '2026-05-05', amount: 28900, status: 'avslutad' },
  { id: 'o7', orderNumber: 'FR-202605-6680', customerId: 'c2', machineId: 'm2', startDate: '2026-05-20', returnDate: '2026-06-20', amount: 16200, status: 'aktiv' },
  { id: 'o8', orderNumber: 'FR-202606-0287', customerId: 'c1', machineId: 'm5', startDate: '2026-06-02', returnDate: '2026-07-02', amount: 31000, status: 'aktiv' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(n);

const machineById = Object.fromEntries(MACHINES.map((m) => [m.id, m]));
const customerById = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));

function StatCard({ title, value, subtitle, icon: Icon, accent, iconBg, iconColor }: {
  title: string; value: string; subtitle: string;
  icon: React.ElementType; accent: string; iconBg: string; iconColor: string;
}) {
  return (
    <div className={`relative bg-white rounded-2xl border border-slate-200/80 p-5 overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${accent}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-[26px] font-bold text-slate-900 mt-1 tracking-tight leading-none">{value}</p>
          <p className="text-[12px] text-slate-400 mt-1.5">{subtitle}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function DashboardTab() {
  const activeOrders = ORDERS.filter((o) => o.status === 'aktiv' || o.status === 'forsenad');
  const utilization = Math.round((MACHINES.filter((m) => m.status === 'uthyrd' || m.status === 'reserverad').length / MACHINES.length) * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Aktiva order"    value={String(activeOrders.length)}  subtitle="varav 1 försenad"   icon={Clock}      accent="bg-amber-400"   iconBg="bg-amber-50"   iconColor="text-amber-600" />
        <StatCard title="Maskiner"        value={String(MACHINES.length)}       subtitle="3 uthyrda just nu"  icon={Truck}      accent="bg-blue-500"    iconBg="bg-blue-50"    iconColor="text-blue-600" />
        <StatCard title="Månadsintäkt"    value="126 900 kr"                    subtitle="Innevarande månad"  icon={TrendingUp} accent="bg-emerald-500" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Beläggningsgrad" value={`${utilization}%`}            subtitle="Uthyrda + reserv."  icon={Activity}   accent="bg-violet-500"  iconBg="bg-violet-50"  iconColor="text-violet-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">Senaste order</h2>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Demo-data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Ordernr', 'Kund', 'Maskin', 'Belopp', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ORDERS.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-slate-800">{o.orderNumber}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-600">{customerById[o.customerId]?.companyName ?? '–'}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-500">{machineById[o.machineId]?.name ?? '–'}</td>
                  <td className="px-5 py-3 text-[13px] font-medium text-slate-700">{fmt(o.amount)}</td>
                  <td className="px-5 py-3"><OrderBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MaskinerTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-[14px] font-semibold text-slate-900">Maskinflotta</h2>
        <p className="text-[12px] text-slate-400 mt-0.5">{MACHINES.length} maskiner registrerade</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Maskin', 'Märke', 'Kategori', 'Int.kod', 'Status'].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MACHINES.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-[13px] font-medium text-slate-800">{m.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.model}</p>
                </td>
                <td className="px-5 py-3 text-[13px] text-slate-600">{m.brand}</td>
                <td className="px-5 py-3 text-[13px] text-slate-500">{m.category}</td>
                <td className="px-5 py-3 text-[12px] font-mono text-slate-400">{m.internalCode}</td>
                <td className="px-5 py-3"><MachineBadge status={m.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KunderTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-[14px] font-semibold text-slate-900">Kundregister</h2>
        <p className="text-[12px] text-slate-400 mt-0.5">{CUSTOMERS.length} kunder registrerade</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Företag', 'Org.nummer', 'Kundnummer'].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {CUSTOMERS.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-800">{c.companyName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[13px] font-mono text-slate-400">{c.orgNumber}</td>
                <td className="px-5 py-3 text-[13px] text-slate-500">{c.customerNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-[14px] font-semibold text-slate-900">Uthyrningsorder</h2>
        <p className="text-[12px] text-slate-400 mt-0.5">{ORDERS.length} order totalt</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Ordernr', 'Kund', 'Maskin', 'Period', 'Belopp', 'Status'].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ORDERS.map((o) => (
              <tr key={o.id} className={`hover:bg-slate-50/80 transition-colors ${o.status === 'forsenad' ? 'bg-red-50/30' : ''}`}>
                <td className="px-5 py-3 text-[13px] font-medium text-slate-800">{o.orderNumber}</td>
                <td className="px-5 py-3 text-[13px] text-slate-600">{customerById[o.customerId]?.companyName ?? '–'}</td>
                <td className="px-5 py-3 text-[13px] text-slate-500">{machineById[o.machineId]?.name ?? '–'}</td>
                <td className="px-5 py-3 text-[12px] text-slate-400">{o.startDate} – {o.returnDate}</td>
                <td className="px-5 py-3 text-[13px] font-medium text-slate-700">{fmt(o.amount)}</td>
                <td className="px-5 py-3"><OrderBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'maskiner',  label: 'Maskiner',  icon: Truck },
    { id: 'kunder',    label: 'Kunder',    icon: Users },
    { id: 'order',     label: 'Order',     icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tillbaka</span>
          </Link>

          <div className="flex items-center gap-2 mx-auto">
            <span className="text-[16px] font-bold text-slate-900 tracking-tight">
              Fleet<span className="text-blue-600">OS</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/80 rounded-full uppercase tracking-wide">Demo</span>
          </div>

          <Link
            href="/kom-igang"
            className="shrink-0 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Skapa konto
          </Link>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-0.5 border-t border-slate-100 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Demo banner */}
      <div className="bg-blue-600/5 border-b border-blue-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <p className="text-[12px] text-blue-700">
            Du ser en interaktiv demo med exempeldata. Inga riktiga uppgifter visas.{' '}
            <Link href="/kom-igang" className="font-semibold underline underline-offset-2 hover:text-blue-900">
              Skapa ditt konto gratis →
            </Link>
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'maskiner'  && <MaskinerTab />}
        {activeTab === 'kunder'    && <KunderTab />}
        {activeTab === 'order'     && <OrderTab />}
      </main>
    </div>
  );
}
