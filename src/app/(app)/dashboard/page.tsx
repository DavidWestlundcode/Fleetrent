'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Truck, Package, AlertTriangle, TrendingUp, Users, Clock,
  Wrench, CheckCircle2, ArrowRight, Plus, BarChart3,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import StatCard from '@/components/ui/StatCard';
import { MachineStatusBadge, OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate, getMonthlyRevenueData, daysUntil } from '@/lib/utils';

const MACHINE_STATUS_COLORS: Record<string, string> = {
  'I lager': '#10B981',
  'Uthyrd': '#3B82F6',
  'Reserverad': '#F59E0B',
  'Service': '#F97316',
  'Skadad': '#EF4444',
  'Utfasad': '#94A3B8',
};

export default function DashboardPage() {
  const { machines, orders, customers } = useStore();

  const stats = useMemo(() => {
    const inStock = machines.filter((m) => m.status === 'i_lager').length;
    const rented = machines.filter((m) => m.status === 'uthyrd').length;
    const onService = machines.filter((m) => m.status === 'service').length;
    const damaged = machines.filter((m) => m.status === 'skadad').length;
    const reserved = machines.filter((m) => m.status === 'reserverad').length;

    const activeOrders = orders.filter((o) => o.status === 'aktiv' || o.status === 'forsenad');
    const overdueOrders = orders.filter(
      (o) => o.status === 'aktiv' && new Date(o.plannedReturnDate) < new Date()
    );
    const returningIn7Days = orders.filter((o) => {
      const days = daysUntil(o.plannedReturnDate);
      return o.status === 'aktiv' && days >= 0 && days <= 7;
    });

    const totalRevenue = orders
      .filter((o) => o.status === 'avslutad' || o.status === 'aktiv')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    const thisMonthRevenue = orders
      .filter((o) => {
        const d = new Date(o.startDate);
        const now = new Date();
        return (o.status === 'avslutad' || o.status === 'aktiv') &&
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const occupancyRate = machines.length > 0 ? Math.round(((rented + reserved) / machines.length) * 100) : 0;

    return {
      inStock, rented, onService, damaged, reserved,
      activeOrders: activeOrders.length,
      overdueOrders: overdueOrders.length,
      returningIn7Days: returningIn7Days.length,
      totalRevenue, thisMonthRevenue, occupancyRate,
      totalMachines: machines.length,
      totalCustomers: customers.length,
    };
  }, [machines, orders, customers]);

  const revenueData = useMemo(() => getMonthlyRevenueData(orders), [orders]);

  const fleetStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    machines.forEach((m) => {
      const label =
        m.status === 'i_lager' ? 'I lager' :
        m.status === 'uthyrd' ? 'Uthyrd' :
        m.status === 'reserverad' ? 'Reserverad' :
        m.status === 'service' ? 'Service' :
        m.status === 'skadad' ? 'Skadad' : 'Utfasad';
      statusMap[label] = (statusMap[label] ?? 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  }, [machines]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders]
  );

  const topMachines = useMemo(
    () => [...machines].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
    [machines]
  );

  const overdueOrders = useMemo(
    () => orders.filter((o) => o.status === 'aktiv' && new Date(o.plannedReturnDate) < new Date()),
    [orders]
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Dashboard"
        subtitle={`Välkommen tillbaka — ${new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
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

      <div className="flex-1 p-6 space-y-6">
        {/* Alerts */}
        {(stats.overdueOrders > 0 || stats.onService > 0 || stats.damaged > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
              <AlertTriangle className="w-4 h-4" />
              Varningar som kräver åtgärd
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.overdueOrders > 0 && (
                <Link href="/orders?status=aktiv" className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors">
                  <Clock className="w-3.5 h-3.5" />
                  {stats.overdueOrders} försenad{stats.overdueOrders !== 1 ? 'e' : ''} retur{stats.overdueOrders !== 1 ? 'er' : ''}
                </Link>
              )}
              {stats.onService > 0 && (
                <Link href="/machines?status=service" className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm rounded-lg hover:bg-orange-200 transition-colors">
                  <Wrench className="w-3.5 h-3.5" />
                  {stats.onService} maskin{stats.onService !== 1 ? 'er' : ''} på service
                </Link>
              )}
              {stats.damaged > 0 && (
                <Link href="/machines?status=skadad" className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stats.damaged} skadad maskin
                </Link>
              )}
              {stats.returningIn7Days > 0 && (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {stats.returningIn7Days} return inom 7 dagar
                </span>
              )}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Maskiner i lager"
            value={stats.inStock}
            subtitle={`av ${stats.totalMachines} totalt`}
            icon={Package}
            color="green"
          />
          <StatCard
            title="Maskiner uthyrda"
            value={stats.rented}
            subtitle={`${stats.occupancyRate}% beläggning`}
            icon={Truck}
            color="blue"
          />
          <StatCard
            title="Aktiva order"
            value={stats.activeOrders}
            subtitle={stats.overdueOrders > 0 ? `${stats.overdueOrders} försenade` : 'Inga försenade'}
            icon={Clock}
            color={stats.overdueOrders > 0 ? 'red' : 'amber'}
          />
          <StatCard
            title="Aktiva kunder"
            value={stats.totalCustomers}
            icon={Users}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Månadsintäkt"
            value={formatCurrency(stats.thisMonthRevenue)}
            subtitle="Innevarande månad"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Total intäkt"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="Alla order"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Beläggningsgrad"
            value={`${stats.occupancyRate}%`}
            subtitle="Uthyrda + reserverade"
            icon={BarChart3}
            color="purple"
          />
          <StatCard
            title="Returer inom 7 dagar"
            value={stats.returningIn7Days}
            icon={CheckCircle2}
            color={stats.returningIn7Days > 0 ? 'amber' : 'green'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Intäkter per månad</h2>
              <span className="text-xs text-slate-500">Senaste 12 månader</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Intäkt']} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fleet Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Flottans status</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={fleetStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {fleetStatusData.map((entry, i) => (
                    <Cell key={i} fill={MACHINE_STATUS_COLORS[entry.name] ?? '#94A3B8'} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 11, color: '#64748B' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Senaste order</h2>
              <Link href="/orders" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                Visa alla <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentOrders.map((order) => {
                const machine = machines.find((m) => m.id === order.machineId);
                const customer = customers.find((c) => c.id === order.customerId);
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{customer?.companyName} · {machine?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">{formatCurrency(order.totalPrice)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top Machines */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Mest lönsamma maskiner</h2>
              <Link href="/statistics" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                Se statistik <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {topMachines.map((machine, i) => {
                const netResult = machine.totalRevenue - (machine.purchasePrice * 0.1 + machine.totalServiceCost);
                return (
                  <Link
                    key={machine.id}
                    href={`/machines/${machine.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-slate-400 bg-slate-100 rounded-full shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{machine.name}</p>
                      <p className="text-xs text-slate-500">{machine.totalRentals} uthyrn. · {machine.totalRentalDays} dagar</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-700">{formatCurrency(machine.totalRevenue)}</p>
                      <MachineStatusBadge status={machine.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overdue Orders */}
        {overdueOrders.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="font-semibold text-slate-900">Försenade returer</h2>
              <span className="ml-auto text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{overdueOrders.length} st</span>
            </div>
            <div className="divide-y divide-red-50">
              {overdueOrders.map((order) => {
                const machine = machines.find((m) => m.id === order.machineId);
                const customer = customers.find((c) => c.id === order.customerId);
                const daysLate = Math.abs(daysUntil(order.plannedReturnDate));
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-red-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{customer?.companyName}</p>
                      <p className="text-xs text-slate-500">{machine?.name} · {order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{daysLate} dag{daysLate !== 1 ? 'ar' : ''} sen</p>
                      <p className="text-xs text-slate-500">Skulle returnerat {formatDate(order.plannedReturnDate)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

