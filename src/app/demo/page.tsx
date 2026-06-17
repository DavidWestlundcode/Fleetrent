'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import {
  LayoutDashboard, Truck, Users, FileText, Tag, Package, BarChart3, Settings,
  AlertTriangle, TrendingUp, Clock, Wrench, CheckCircle2, ArrowRight, Plus,
  Bell, Search, Phone, Mail,
  Shield, Building2, Globe, Link2, Check,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

type Tab = 'dashboard' | 'maskiner' | 'kunder' | 'order' | 'mallar' | 'artiklar' | 'statistik' | 'installningar';
type MachineStatus = 'i_lager' | 'uthyrd' | 'reserverad' | 'service' | 'skadad';
type OrderStatus = 'aktiv' | 'avslutad' | 'forsenad' | 'klar_for_fakturering' | 'reserverad' | 'annullerad';

/* ── Fake data ─────────────────────────────────────────────────────── */
const MACHINES: { id: string; name: string; brand: string; model: string; internalCode: string; category: string; status: MachineStatus; capacity: number; location: string; totalRevenue: number; totalRentals: number; totalRentalDays: number }[] = [
  { id: 'm1', name: 'Toyota 8FBN25',       brand: 'Toyota',       model: '8FBN25',  internalCode: 'TRK-001', category: 'Motviktstruck',    status: 'uthyrd',     capacity: 2500, location: 'Lager A', totalRevenue: 84000,  totalRentals: 12, totalRentalDays: 198 },
  { id: 'm2', name: 'Toyota 8FBE20',       brand: 'Toyota',       model: '8FBE20',  internalCode: 'TRK-002', category: 'Motviktstruck',    status: 'i_lager',    capacity: 2000, location: 'Lager A', totalRevenue: 62000,  totalRentals: 9,  totalRentalDays: 154 },
  { id: 'm3', name: 'Volvo L60H',          brand: 'Volvo',        model: 'L60H',    internalCode: 'HJL-001', category: 'Hjullastare',      status: 'uthyrd',     capacity: 6000, location: 'Lager B', totalRevenue: 112000, totalRentals: 7,  totalRentalDays: 210 },
  { id: 'm4', name: 'CAT 308CR',           brand: 'Caterpillar',  model: '308CR',   internalCode: 'GRV-001', category: 'Grävmaskin',       status: 'service',    capacity: 8000, location: 'Verkstad', totalRevenue: 48000,  totalRentals: 5,  totalRentalDays: 90 },
  { id: 'm5', name: 'Manitou MLT845',      brand: 'Manitou',      model: 'MLT845',  internalCode: 'TEL-001', category: 'Teleskoplastare',  status: 'i_lager',    capacity: 4500, location: 'Lager B', totalRevenue: 97000,  totalRentals: 8,  totalRentalDays: 176 },
  { id: 'm6', name: 'Jungheinrich ETV216', brand: 'Jungheinrich', model: 'ETV216',  internalCode: 'SKJ-001', category: 'Skjutstativtruck', status: 'reserverad', capacity: 1600, location: 'Lager A', totalRevenue: 55000,  totalRentals: 11, totalRentalDays: 165 },
  { id: 'm7', name: 'BT Reflex RRE160',   brand: 'BT',           model: 'RRE160',  internalCode: 'SKJ-002', category: 'Skjutstativtruck', status: 'i_lager',    capacity: 1600, location: 'Lager A', totalRevenue: 41000,  totalRentals: 8,  totalRentalDays: 112 },
  { id: 'm8', name: 'Bobcat E35',          brand: 'Bobcat',       model: 'E35',     internalCode: 'GRV-002', category: 'Grävmaskin',       status: 'skadad',     capacity: 3500, location: 'Verkstad', totalRevenue: 28000,  totalRentals: 4,  totalRentalDays: 66 },
];

const CUSTOMERS = [
  { id: 'c1', companyName: 'Lindström Bygg AB',        orgNumber: '556712-3489', contactPerson: 'Erik Lindström', phone: '070-123 45 67', email: 'faktura@lindstrombygg.se', fortnoxCustomerNumber: '1042', activeOrders: 2, totalSpent: 115000 },
  { id: 'c2', companyName: 'Björk & Söner Anläggning', orgNumber: '556843-7712', contactPerson: 'Anna Björk',     phone: '073-987 65 43', email: 'anna@bjorksoneranlgg.se', fortnoxCustomerNumber: '1098', activeOrders: 1, totalSpent: 87500 },
  { id: 'c3', companyName: 'NordMark Hyrmaskiner AB',   orgNumber: '556601-2234', contactPerson: 'Patrik Nordmark', phone: '076-555 44 33', email: 'info@nordmarkhyr.se',     fortnoxCustomerNumber: '1031', activeOrders: 0, totalSpent: 210000 },
  { id: 'c4', companyName: 'Svensson Entreprenad HB',   orgNumber: '556934-5501', contactPerson: 'Maria Svensson', phone: '070-222 33 44', email: 'ekonomi@svenssonent.se',  fortnoxCustomerNumber: '1207', activeOrders: 1, totalSpent: 64000 },
  { id: 'c5', companyName: 'Eriksson Lager & Logistik', orgNumber: '556488-9023', contactPerson: 'Johan Eriksson', phone: '072-666 77 88', email: 'johane@erikssonlager.se', fortnoxCustomerNumber: '1055', activeOrders: 0, totalSpent: 178000 },
  { id: 'c6', companyName: 'Karlberg Transport AB',     orgNumber: '556777-1198', contactPerson: 'Sara Karlberg',  phone: '070-444 55 66', email: 'sara@karlbergtrans.se',   fortnoxCustomerNumber: '1178', activeOrders: 1, totalSpent: 93000 },
];

const ORDERS: { id: string; orderNumber: string; customerId: string; machineId: string; startDate: string; plannedReturnDate: string; totalPrice: number; status: OrderStatus; orderReference: string; createdAt: string }[] = [
  { id: 'o1', orderNumber: 'FR-202605-4421', customerId: 'c1', machineId: 'm1', startDate: '2026-05-10', plannedReturnDate: '2026-06-10', totalPrice: 18600, status: 'aktiv',                createdAt: '2026-05-09', orderReference: 'PO-4421' },
  { id: 'o2', orderNumber: 'FR-202605-3817', customerId: 'c2', machineId: 'm3', startDate: '2026-05-15', plannedReturnDate: '2026-05-30', totalPrice: 22400, status: 'forsenad',             createdAt: '2026-05-14', orderReference: '' },
  { id: 'o3', orderNumber: 'FR-202604-2990', customerId: 'c3', machineId: 'm7', startDate: '2026-04-20', plannedReturnDate: '2026-05-20', totalPrice: 15200, status: 'klar_for_fakturering', createdAt: '2026-04-19', orderReference: 'REF-881' },
  { id: 'o4', orderNumber: 'FR-202606-0112', customerId: 'c4', machineId: 'm6', startDate: '2026-06-01', plannedReturnDate: '2026-06-30', totalPrice: 19800, status: 'reserverad',           createdAt: '2026-05-28', orderReference: '' },
  { id: 'o5', orderNumber: 'FR-202603-7744', customerId: 'c5', machineId: 'm2', startDate: '2026-03-01', plannedReturnDate: '2026-04-01', totalPrice: 17500, status: 'avslutad',             createdAt: '2026-02-28', orderReference: 'PO-7744' },
  { id: 'o6', orderNumber: 'FR-202604-5539', customerId: 'c6', machineId: 'm5', startDate: '2026-04-05', plannedReturnDate: '2026-05-05', totalPrice: 28900, status: 'avslutad',             createdAt: '2026-04-04', orderReference: '' },
  { id: 'o7', orderNumber: 'FR-202605-6680', customerId: 'c2', machineId: 'm2', startDate: '2026-05-20', plannedReturnDate: '2026-06-20', totalPrice: 16200, status: 'aktiv',                createdAt: '2026-05-19', orderReference: 'REF-6680' },
  { id: 'o8', orderNumber: 'FR-202606-0287', customerId: 'c1', machineId: 'm5', startDate: '2026-06-02', plannedReturnDate: '2026-07-02', totalPrice: 31000, status: 'aktiv',                createdAt: '2026-06-01', orderReference: '' },
];

const REVENUE_DATA = [
  { month: 'jul', revenue: 42000 }, { month: 'aug', revenue: 58000 },
  { month: 'sep', revenue: 51000 }, { month: 'okt', revenue: 67000 },
  { month: 'nov', revenue: 49000 }, { month: 'dec', revenue: 38000 },
  { month: 'jan', revenue: 44000 }, { month: 'feb', revenue: 61000 },
  { month: 'mar', revenue: 72000 }, { month: 'apr', revenue: 85000 },
  { month: 'maj', revenue: 91000 }, { month: 'jun', revenue: 69500 },
];

const TEMPLATES = [
  { id: 't1', name: 'Motviktstruck 1–2.5 ton', category: 'Motviktstruck', dailyPrice: 850,  weeklyPrice: 4200,  monthlyPrice: 12500, hasLongTerm: true,  hasInsurance: true,  insurancePrice: 95,  customerCount: 4 },
  { id: 't2', name: 'Hjullastare 4–6 ton',      category: 'Hjullastare',  dailyPrice: 1800, weeklyPrice: 9500,  monthlyPrice: 28000, hasLongTerm: true,  hasInsurance: true,  insurancePrice: 180, customerCount: 2 },
  { id: 't3', name: 'Grävmaskin 6–10 ton',      category: 'Grävmaskin',   dailyPrice: 2200, weeklyPrice: 11000, monthlyPrice: 32000, hasLongTerm: true,  hasInsurance: true,  insurancePrice: 220, customerCount: 3 },
  { id: 't4', name: 'Skjutstativtruck',         category: 'Skjutstativtruck', dailyPrice: 650, weeklyPrice: 3200, monthlyPrice: 9500, hasLongTerm: false, hasInsurance: true,  insurancePrice: 70,  customerCount: 5 },
  { id: 't5', name: 'Teleskoplastare',          category: 'Teleskoplastare',  dailyPrice: 1450, weeklyPrice: 7600, monthlyPrice: 22000, hasLongTerm: true, hasInsurance: false, insurancePrice: 0,   customerCount: 1 },
];

const ARTICLES = [
  { id: 'a1', articleNumber: '1001', name: 'Maskinuthyrning – dag',  type: 'Hyra',        unit: 'dag', defaultPrice: 850,  accountNumber: '3041', vatRate: 25, isActive: true },
  { id: 'a2', articleNumber: '1002', name: 'Maskinförsäkring',       type: 'Försäkring',  unit: 'dag', defaultPrice: 95,   accountNumber: '3042', vatRate: 25, isActive: true },
  { id: 'a3', articleNumber: '1003', name: 'Transport till/från',    type: 'Transport',   unit: 'st',  defaultPrice: 1200, accountNumber: '3043', vatRate: 25, isActive: true },
  { id: 'a4', articleNumber: '1004', name: 'Deposition',             type: 'Deposition',  unit: 'st',  defaultPrice: 5000, accountNumber: '2440', vatRate: 0,  isActive: true },
  { id: 'a5', articleNumber: '1005', name: 'Bränsletillägg',         type: 'Tillägg',     unit: 'st',  defaultPrice: 350,  accountNumber: '3044', vatRate: 25, isActive: true },
  { id: 'a6', articleNumber: '1006', name: 'Sanering vid retur',     type: 'Tillägg',     unit: 'st',  defaultPrice: 1500, accountNumber: '3045', vatRate: 25, isActive: false },
];

const machineById = Object.fromEntries(MACHINES.map((m) => [m.id, m]));
const customerById = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));

const fmt = (n: number) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(n);

/* ── Badges ─────────────────────────────────────────────────────────── */
const MBADGE: Record<MachineStatus, { bg: string; dot: string; label: string }> = {
  i_lager:    { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'I lager' },
  uthyrd:     { bg: 'bg-blue-100 text-blue-800',       dot: 'bg-blue-500',    label: 'Uthyrd' },
  reserverad: { bg: 'bg-amber-100 text-amber-800',     dot: 'bg-amber-500',   label: 'Reserverad' },
  service:    { bg: 'bg-orange-100 text-orange-800',   dot: 'bg-orange-500',  label: 'Service' },
  skadad:     { bg: 'bg-red-100 text-red-800',         dot: 'bg-red-500',     label: 'Skadad' },
};
const OBADGE: Record<OrderStatus, { bg: string; dot: string; label: string }> = {
  aktiv:                { bg: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500',    label: 'Aktiv' },
  reserverad:           { bg: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-500',   label: 'Reserverad' },
  forsenad:             { bg: 'bg-red-100 text-red-800',       dot: 'bg-red-500',     label: 'Försenad' },
  klar_for_fakturering: { bg: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500',  label: 'Klar för fakturering' },
  avslutad:             { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', label: 'Avslutad' },
  annullerad:           { bg: 'bg-slate-200 text-slate-600',    dot: 'bg-slate-400',   label: 'Annullerad' },
};

function MBadge({ s }: { s: MachineStatus }) {
  const b = MBADGE[s];
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${b.bg}`}><span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />{b.label}</span>;
}
function OBadge({ s }: { s: OrderStatus }) {
  const b = OBADGE[s];
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${b.bg}`}><span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />{b.label}</span>;
}

/* ── StatCard ──────────────────────────────────────────────────────── */
const COLOR_MAP = {
  blue:   { accent: 'bg-blue-500',    iconBg: 'bg-blue-50',    iconText: 'text-blue-600' },
  green:  { accent: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
  amber:  { accent: 'bg-amber-400',   iconBg: 'bg-amber-50',   iconText: 'text-amber-600' },
  red:    { accent: 'bg-red-500',     iconBg: 'bg-red-50',     iconText: 'text-red-600' },
  purple: { accent: 'bg-violet-500',  iconBg: 'bg-violet-50',  iconText: 'text-violet-600' },
};
function SC({ title, value, subtitle, icon: Icon, color = 'blue' }: { title: string; value: string | number; subtitle?: string; icon: React.ElementType; color?: keyof typeof COLOR_MAP }) {
  const c = COLOR_MAP[color];
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${c.accent}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-[26px] font-bold text-slate-900 mt-1 tracking-tight leading-none">{value}</p>
          {subtitle && <p className="text-[12px] text-slate-400 mt-1.5">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${c.iconBg} shrink-0`}>
          <Icon className={`w-[18px] h-[18px] ${c.iconText}`} />
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────────── */
const NAV: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'maskiner',      icon: Truck,           label: 'Maskinflotta' },
  { id: 'order',         icon: FileText,        label: 'Uthyrningsorder' },
  { id: 'kunder',        icon: Users,           label: 'Kunder' },
  { id: 'mallar',        icon: Tag,             label: 'Prismallar' },
  { id: 'artiklar',      icon: Package,         label: 'Artikelregister' },
  { id: 'statistik',     icon: BarChart3,       label: 'Statistik' },
  { id: 'installningar', icon: Settings,        label: 'Inställningar' },
];

function DemoSidebar({ active, onNav }: { active: Tab; onNav: (t: Tab) => void }) {
  return (
    <aside className="flex flex-col w-[232px] bg-[#0B1120] border-r border-white/[0.06] shrink-0 hidden md:flex">
      <div className="flex items-center px-5 h-[56px] border-b border-white/[0.06] shrink-0">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Logo size={28} />
          <span className="text-[14px] font-semibold text-white tracking-tight">FleetOS</span>
        </Link>
      </div>
      <nav className="flex-1 py-3 px-2.5 space-y-px overflow-y-auto">
        {NAV.map(({ id, icon: Icon, label }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`relative flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 w-full text-left cursor-pointer group ${
                isActive ? 'text-white bg-white/[0.09]' : 'text-[#8B95A8] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-blue-500 rounded-r-full" />}
              <Icon className={`w-[15px] h-[15px] shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-[#4B5568] group-hover:text-[#8B95A8]'}`} />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.06] p-2.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[11px] font-bold shrink-0">D</div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-white truncate leading-[1.3]">David Westlund</p>
            <p className="text-[11px] text-[#4B5568] leading-[1.3]">Admin</p>
          </div>
        </div>
        <Link href="/kom-igang" className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-blue-400 hover:text-white hover:bg-white/[0.05] transition-all mt-1">
          <Plus className="w-[15px] h-[15px]" />
          Skapa riktigt konto
        </Link>
      </div>
    </aside>
  );
}

/* ── Header ────────────────────────────────────────────────────────── */
function DemoHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between px-6 h-[56px] bg-white border-b border-slate-100 shrink-0 gap-3">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400 leading-tight mt-px truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input readOnly placeholder="Sök..." className="pl-8 pr-3 py-1.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg w-44 placeholder:text-slate-400 cursor-default" />
        </div>
        <button className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-3.5 h-3.5 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">1</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          Ny order
        </button>
      </div>
    </header>
  );
}

/* ── Dashboard tab ─────────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  'I lager': '#10B981', 'Uthyrd': '#3B82F6', 'Reserverad': '#F59E0B',
  'Service': '#F97316', 'Skadad': '#EF4444',
};
const fleetStatus = [
  { name: 'I lager', value: 3 }, { name: 'Uthyrd', value: 2 },
  { name: 'Reserverad', value: 1 }, { name: 'Service', value: 1 }, { name: 'Skadad', value: 1 },
];

function DashboardTab() {
  const topMachines = [...MACHINES].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
  const recentOrders = ORDERS.slice(0, 5);

  return (
    <div className="flex-1 p-3 sm:p-6 space-y-5 overflow-auto bg-slate-50/60">
      {/* Alert */}
      <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-red-800 text-[13px] font-semibold mb-2.5">
          <AlertTriangle className="w-4 h-4" /> Varningar som kräver åtgärd
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-[12px] font-medium rounded-lg">
            <Clock className="w-3.5 h-3.5" /> 1 försenad retur
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-[12px] font-medium rounded-lg">
            <Wrench className="w-3.5 h-3.5" /> 1 maskin på service
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-[12px] font-medium rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" /> 2 returer inom 7 dagar
          </span>
        </div>
      </div>

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SC title="Maskiner i lager"  value={3}  subtitle="av 8 totalt"         icon={Package}    color="green" />
        <SC title="Maskiner uthyrda"  value={2}  subtitle="38% beläggning"       icon={Truck}      color="blue" />
        <SC title="Aktiva order"      value={4}  subtitle="1 försenad"           icon={Clock}      color="red" />
        <SC title="Aktiva kunder"     value={6}                                  icon={Users}      color="purple" />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SC title="Månadsintäkt"        value="69 500 kr"  subtitle="Innevarande månad"  icon={TrendingUp} color="green" />
        <SC title="Total intäkt"        value="527 100 kr" subtitle="Alla order"          icon={TrendingUp} color="blue" />
        <SC title="Beläggningsgrad"     value="38%"        subtitle="Uthyrda + reserv."   icon={BarChart3}  color="purple" />
        <SC title="Returer inom 7 dagar" value={2}                                        icon={CheckCircle2} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[14px] font-semibold text-slate-900">Intäkter per månad</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Senaste 12 månader</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [fmt(Number(v)), 'Intäkt']} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-1">Flottans status</h2>
          <p className="text-[11px] text-slate-400 mb-3">Fördelning just nu</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={fleetStatus} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {fleetStatus.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#94A3B8'} />)}
              </Pie>
              <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-slate-900">Senaste order</h2>
            <span className="flex items-center gap-1 text-[12px] text-blue-600 font-medium cursor-pointer">Visa alla <ArrowRight className="w-3 h-3" /></span>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer">
                <div>
                  <p className="text-[13px] font-medium text-slate-800">{o.orderNumber}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{customerById[o.customerId]?.companyName} · {machineById[o.machineId]?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-slate-700">{fmt(o.totalPrice)}</span>
                  <OBadge s={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-slate-900">Mest lönsamma maskiner</h2>
            <span className="flex items-center gap-1 text-[12px] text-blue-600 font-medium cursor-pointer">Se statistik <ArrowRight className="w-3 h-3" /></span>
          </div>
          <div className="divide-y divide-slate-50">
            {topMachines.map((m, i) => (
              <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer">
                <span className="flex items-center justify-center w-5 h-5 text-[11px] font-bold text-slate-400 bg-slate-100 rounded-full shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-800 truncate">{m.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.totalRentals} uthyrn. · {m.totalRentalDays} dagar</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-semibold text-slate-700">{fmt(m.totalRevenue)}</p>
                  <MBadge s={m.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Maskiner tab ──────────────────────────────────────────────────── */
function MaskinerTab() {
  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50/60">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MACHINES.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-slate-900">{m.name}</h3>
                <p className="text-[12px] text-slate-400 mt-0.5">{m.brand} {m.model}</p>
              </div>
              <MBadge s={m.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div><p className="text-slate-400">Kategori</p><p className="font-medium text-slate-700 mt-0.5">{m.category}</p></div>
              <div><p className="text-slate-400">Int.kod</p><p className="font-medium text-slate-700 mt-0.5 font-mono">{m.internalCode}</p></div>
              <div><p className="text-slate-400">Kapacitet</p><p className="font-medium text-slate-700 mt-0.5">{m.capacity.toLocaleString('sv-SE')} kg</p></div>
              <div><p className="text-slate-400">Placering</p><p className="font-medium text-slate-700 mt-0.5">{m.location}</p></div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">{m.totalRentals} uthyrningar</span>
              <span className="text-[13px] font-semibold text-slate-700">{fmt(m.totalRevenue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Kunder tab ────────────────────────────────────────────────────── */
function KunderTab() {
  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50/60">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CUSTOMERS.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-900">{c.companyName}</h3>
                <p className="text-[12px] text-slate-400">{c.orgNumber}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" />{c.phone}</div>
              <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" />{c.email}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Kundnr: {c.fortnoxCustomerNumber}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.activeOrders > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                {c.activeOrders > 0 ? `${c.activeOrders} aktiv order` : 'Inga aktiva'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Order tab ─────────────────────────────────────────────────────── */
const DAYS_THRESHOLD = 30;
function daysSinceStart(o: (typeof ORDERS)[number]): number {
  return Math.floor((Date.now() - new Date(o.startDate).getTime()) / 86400000);
}
function needsPartialInvoice(o: (typeof ORDERS)[number]): boolean {
  return o.status === 'aktiv' && daysSinceStart(o) >= DAYS_THRESHOLD;
}

type OrderFilter = OrderStatus | 'all' | '30_dagar';
const STATUS_LABELS: Record<OrderFilter, string> = {
  all: 'Alla', aktiv: 'Aktiva', reserverad: 'Reserverade',
  forsenad: 'Försenade', '30_dagar': '30 dagar',
  klar_for_fakturering: 'Klar för fakturering',
  avslutad: 'Avslutade', annullerad: 'Annullerade',
};
const ORDER_FILTERS: OrderFilter[] = ['all', 'aktiv', 'reserverad', 'forsenad', '30_dagar', 'klar_for_fakturering', 'avslutad', 'annullerad'];

function OrderTab() {
  const [filter, setFilter] = useState<OrderFilter>('all');

  const counts: Record<OrderFilter, number> = {
    all: ORDERS.length,
    aktiv: ORDERS.filter((o) => o.status === 'aktiv').length,
    reserverad: ORDERS.filter((o) => o.status === 'reserverad').length,
    forsenad: ORDERS.filter((o) => o.status === 'forsenad').length,
    '30_dagar': ORDERS.filter(needsPartialInvoice).length,
    klar_for_fakturering: ORDERS.filter((o) => o.status === 'klar_for_fakturering').length,
    avslutad: ORDERS.filter((o) => o.status === 'avslutad').length,
    annullerad: ORDERS.filter((o) => o.status === 'annullerad').length,
  };

  const filtered = ORDERS.filter((o) => {
    if (filter === 'all') return true;
    if (filter === '30_dagar') return needsPartialInvoice(o);
    return o.status === filter;
  });

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50/60">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ORDER_FILTERS.map((f) => {
          const isActive = filter === f;
          const isThirty = f === '30_dagar' && counts[f] > 0;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? isThirty ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                  : isThirty ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {STATUS_LABELS[f]}
              <span className={`text-[10px] font-semibold px-1.5 py-px rounded-full ${isActive ? 'bg-white/20' : isThirty ? 'bg-orange-200/70' : 'bg-slate-100'}`}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">{STATUS_LABELS[filter]}</h2>
          <span className="text-[12px] text-slate-400">{filtered.length} order</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-slate-400">Inga order matchar denna filtrering.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Order', 'Kund', 'Maskin', 'Period', 'Belopp', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((o) => (
                <tr key={o.id} className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${o.status === 'forsenad' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-slate-800">{o.orderNumber}</p>
                    {o.orderReference && <p className="text-[11px] text-slate-400 mt-0.5">{o.orderReference}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600">{customerById[o.customerId]?.companyName ?? '–'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-500">{machineById[o.machineId]?.name ?? '–'}</td>
                  <td className="px-5 py-3.5 text-[12px] text-slate-400">{o.startDate}<br />→ {o.plannedReturnDate}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-700">{fmt(o.totalPrice)}</td>
                  <td className="px-5 py-3.5"><OBadge s={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Prismallar tab ────────────────────────────────────────────────── */
function MallarTab() {
  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50/60">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-slate-900">{t.name}</h3>
                <p className="text-[12px] text-slate-400 mt-0.5">{t.category}</p>
              </div>
              <Tag className="w-4 h-4 text-slate-300 shrink-0" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-slate-50 rounded-lg py-2"><p className="text-[10px] text-slate-400">Dag</p><p className="text-[13px] font-semibold text-slate-700">{fmt(t.dailyPrice)}</p></div>
              <div className="bg-slate-50 rounded-lg py-2"><p className="text-[10px] text-slate-400">Vecka</p><p className="text-[13px] font-semibold text-slate-700">{fmt(t.weeklyPrice)}</p></div>
              <div className="bg-slate-50 rounded-lg py-2"><p className="text-[10px] text-slate-400">Månad</p><p className="text-[13px] font-semibold text-slate-700">{fmt(t.monthlyPrice)}</p></div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {t.hasLongTerm && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Långtid</span>}
              {t.hasInsurance && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Försäkring {fmt(t.insurancePrice)}/dag</span>}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t.customerCount} kunder</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Artikelregister tab ───────────────────────────────────────────── */
function ArtiklarTab() {
  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50/60">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900">Alla artiklar</h2>
          <span className="text-[12px] text-slate-400">{ARTICLES.length} artiklar</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Art.nr', 'Namn', 'Typ', 'Enhet', 'Pris', 'Konto', 'Moms', 'Status'].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ARTICLES.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                <td className="px-5 py-3.5 text-[13px] font-mono text-slate-500">{a.articleNumber}</td>
                <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800">{a.name}</td>
                <td className="px-5 py-3.5 text-[12px] text-slate-500">{a.type}</td>
                <td className="px-5 py-3.5 text-[12px] text-slate-500">{a.unit}</td>
                <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-700">{fmt(a.defaultPrice)}</td>
                <td className="px-5 py-3.5 text-[12px] font-mono text-slate-400">{a.accountNumber}</td>
                <td className="px-5 py-3.5 text-[12px] text-slate-400">{a.vatRate}%</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {a.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Statistik tab ─────────────────────────────────────────────────── */
const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

function StatistikTab() {
  const totalRevenue = MACHINES.reduce((s, m) => s + m.totalRevenue, 0);
  const totalCost = Math.round(totalRevenue * 0.42);
  const net = totalRevenue - totalCost;
  const occupancy = 38;

  const byCategory = Object.values(
    MACHINES.reduce<Record<string, { name: string; value: number }>>((acc, m) => {
      acc[m.category] ??= { name: m.category, value: 0 };
      acc[m.category].value += m.totalRevenue;
      return acc;
    }, {})
  );

  const byCustomer = [...CUSTOMERS].sort((a, b) => b.totalSpent - a.totalSpent).map((c) => ({ name: c.companyName.split(' ')[0], value: c.totalSpent }));

  const machineRoi = [...MACHINES].sort((a, b) => b.totalRevenue - a.totalRevenue).map((m) => ({ name: m.internalCode, intakt: m.totalRevenue, kostnad: Math.round(m.totalRevenue * 0.42) }));

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50/60 space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SC title="Total intäkt"     value={fmt(totalRevenue)} subtitle="Alla order" icon={TrendingUp} color="green" />
        <SC title="Total kostnad"    value={fmt(totalCost)}    subtitle="Uppskattad"  icon={Wrench}     color="red" />
        <SC title="Nettoresultat"    value={fmt(net)}          subtitle="Intäkt − kostnad" icon={BarChart3} color="blue" />
        <SC title="Beläggningsgrad"  value={`${occupancy}%`}   subtitle="Uthyrda + reserv." icon={CheckCircle2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-1">Intäkter per månad</h2>
          <p className="text-[11px] text-slate-400 mb-4">Senaste 12 månader</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [fmt(Number(v)), 'Intäkt']} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#revFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-1">Intäkt per kategori</h2>
          <p className="text-[11px] text-slate-400 mb-3">Fördelning</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {byCategory.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={7} formatter={(v) => <span style={{ fontSize: 10.5, color: '#64748B' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-1">Maskinlönsamhet</h2>
          <p className="text-[11px] text-slate-400 mb-4">Intäkt vs. kostnad</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={machineRoi} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="intakt" fill="#3B82F6" radius={[5, 5, 0, 0]} name="Intäkt" />
              <Bar dataKey="kostnad" fill="#F87171" radius={[5, 5, 0, 0]} name="Kostnad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-1">Intäkt per kund</h2>
          <p className="text-[11px] text-slate-400 mb-4">Topp kunder</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCustomer} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Inställningar tab ─────────────────────────────────────────────── */
function InstallningarTab() {
  const [active, setActive] = useState<'profil' | 'foretag' | 'anvandare' | 'integrationer'>('profil');
  const tabs = [
    { id: 'profil', label: 'Min profil', icon: Users },
    { id: 'foretag', label: 'Företagsinformation', icon: Building2 },
    { id: 'anvandare', label: 'Användare', icon: Shield },
    { id: 'integrationer', label: 'Integrationer', icon: Link2 },
  ] as const;

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50/60">
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              active === id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
        {active === 'profil' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[15px] font-bold">D</div>
              <div>
                <p className="text-[14px] font-semibold text-slate-900">David Westlund</p>
                <p className="text-[12px] text-slate-400">Admin</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div><p className="text-slate-400 mb-1">E-post</p><p className="font-medium text-slate-700">david@fleetos.se</p></div>
              <div><p className="text-slate-400 mb-1">Telefon</p><p className="font-medium text-slate-700">070-000 00 00</p></div>
            </div>
          </div>
        )}
        {active === 'foretag' && (
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div><p className="text-slate-400 mb-1">Företagsnamn</p><p className="font-medium text-slate-700">Demo Maskinuthyrning AB</p></div>
            <div><p className="text-slate-400 mb-1">Org.nummer</p><p className="font-medium text-slate-700">556000-0000</p></div>
            <div><p className="text-slate-400 mb-1">Adress</p><p className="font-medium text-slate-700">Exempelgatan 1, 123 45 Stockholm</p></div>
            <div><p className="text-slate-400 mb-1">Momsregistrering</p><p className="font-medium text-slate-700">SE556000000001</p></div>
          </div>
        )}
        {active === 'anvandare' && (
          <div className="divide-y divide-slate-50">
            {[{ n: 'David Westlund', r: 'Admin' }, { n: 'Anna Karlsson', r: 'Uthyrare' }, { n: 'Mikael Sten', r: 'Lager' }].map((u) => (
              <div key={u.n} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-[12px] font-bold">{u.n[0]}</div>
                  <p className="text-[13px] font-medium text-slate-800">{u.n}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{u.r}</span>
              </div>
            ))}
          </div>
        )}
        {active === 'integrationer' && (
          <div className="space-y-3">
            {[{ n: 'Fortnox', d: 'Bokföring & fakturering', c: true }, { n: 'Serviceprotokoll', d: 'Maskinservice & besiktning', c: true }, { n: 'Visma', d: 'Ekonomisystem', c: false }].map((i) => (
              <div key={i.n} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50"><Globe className="w-4 h-4 text-slate-400" /></div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-800">{i.n}</p>
                    <p className="text-[11px] text-slate-400">{i.d}</p>
                  </div>
                </div>
                {i.c ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700"><Check className="w-3 h-3" /> Ansluten</span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500">Ej ansluten</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */
const TITLES: Record<Tab, { title: string; subtitle: string }> = {
  dashboard:     { title: 'Dashboard', subtitle: 'onsdag 17 juni 2026' },
  maskiner:      { title: 'Maskinflotta', subtitle: '8 maskiner registrerade' },
  kunder:        { title: 'Kunder', subtitle: '6 aktiva kunder' },
  order:         { title: 'Uthyrningsorder', subtitle: '8 order totalt' },
  mallar:        { title: 'Prismallar', subtitle: `${TEMPLATES.length} mallar` },
  artiklar:      { title: 'Artikelregister', subtitle: `${ARTICLES.length} artiklar` },
  statistik:     { title: 'Statistik', subtitle: 'Lönsamhet & beläggning' },
  installningar: { title: 'Inställningar', subtitle: 'Konto, företag & integrationer' },
};

export default function DemoPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { title, subtitle } = TITLES[tab];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Demo banner — slim top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 px-4 py-1.5 flex items-center justify-between">
        <p className="text-[11px] text-blue-100 font-medium">
          🔍 Demoläge — exempeldata, ingen inloggning krävs
        </p>
        <Link href="/kom-igang" className="text-[11px] font-bold text-white underline underline-offset-2 hover:text-blue-200">
          Skapa konto gratis →
        </Link>
      </div>

      {/* Offset for banner */}
      <div className="flex flex-1 mt-[30px] overflow-hidden">
        <DemoSidebar active={tab} onNav={setTab} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DemoHeader title={title} subtitle={subtitle} />
          {tab === 'dashboard'     && <DashboardTab />}
          {tab === 'maskiner'      && <MaskinerTab />}
          {tab === 'kunder'        && <KunderTab />}
          {tab === 'order'         && <OrderTab />}
          {tab === 'mallar'        && <MallarTab />}
          {tab === 'artiklar'      && <ArtiklarTab />}
          {tab === 'statistik'     && <StatistikTab />}
          {tab === 'installningar' && <InstallningarTab />}
        </div>
      </div>
    </div>
  );
}
