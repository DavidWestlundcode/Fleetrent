'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, Edit, QrCode, Wrench, TrendingUp, Calendar, Hash,
  Zap, MapPin, Clock, BarChart2, Trash2, AlertTriangle, CalendarPlus,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';
import { OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import {
  formatCurrency, formatDate, calculateRecoveryPercent, calculateROI,
} from '@/lib/utils';
import { CATEGORY_LABELS, FUEL_LABELS } from '@/lib/types';

export default function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { machines, orders, customers, serviceRecords, deleteMachine } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const machine = machines.find((m) => m.id === id);
  const today = new Date().toISOString().split('T')[0];
  const machineOrders = useMemo(
    () => orders.filter((o) => o.machineId === id).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [orders, id]
  );
  const machineService = useMemo(
    () => serviceRecords.filter((s) => s.machineId === id).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [serviceRecords, id]
  );

  // Must be before the early return so hook count is stable even when machine is undefined
  const revenueChartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthOrders = machineOrders.filter((o) => {
        const od = new Date(o.startDate);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      months.push({
        month: d.toLocaleDateString('sv-SE', { month: 'short' }),
        intäkt: monthOrders.reduce((s, o) => s + o.totalPrice, 0),
      });
    }
    return months;
  }, [machineOrders]);

  if (!machine) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-400">
        <div className="text-center">
          <p className="text-lg font-medium">Maskinen hittades inte</p>
          <Link href="/machines" className="text-blue-600 hover:underline text-sm mt-2 block">← Tillbaka till maskinlistan</Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMachine(id);
    router.push('/machines');
  };

  const specItems = [
    machine.liftHeight && { label: 'Lyfthöjd', value: `${machine.liftHeight.toLocaleString('sv-SE')} mm` },
    machine.buildHeight && { label: 'Bygghöjd', value: `${machine.buildHeight.toLocaleString('sv-SE')} mm` },
    machine.forkLength && { label: 'Gaffellängd', value: `${machine.forkLength.toLocaleString('sv-SE')} mm` },
    machine.freeLift && { label: 'Frilyft', value: `${machine.freeLift.toLocaleString('sv-SE')} mm` },
    machine.maxReach && { label: 'Max räckvidd', value: `${machine.maxReach.toLocaleString('sv-SE')} mm` },
    machine.digDepth && { label: 'Grävdjup', value: `${machine.digDepth.toLocaleString('sv-SE')} mm` },
    machine.bucketVolume && { label: 'Skopvolym', value: `${machine.bucketVolume.toLocaleString('sv-SE')} liter` },
    machine.workingWeight && { label: 'Tjänstevikt', value: `${machine.workingWeight.toLocaleString('sv-SE')} kg` },
    machine.enginePower && { label: 'Motoreffekt', value: `${machine.enginePower.toLocaleString('sv-SE')} kW` },
  ].filter(Boolean) as { label: string; value: string }[];

  const totalCosts = machine.purchasePrice + machine.leasingCost * 12 + machine.financingCost * 12 +
    machine.insuranceCost * 12 + machine.totalServiceCost + machine.otherCosts * 12;
  const netResult = machine.totalRevenue - totalCosts;
  const recoveryPercent = calculateRecoveryPercent(machine.totalRevenue, machine.purchasePrice);
  const roi = calculateROI(machine.totalRevenue, totalCosts);
  const monthlyCost = (machine.leasingCost + machine.financingCost + machine.insuranceCost + machine.otherCosts);
  const avgMonthlyRevenue = machine.totalRentals > 0 ? machine.totalRevenue / 12 : 0;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title={machine.name}
        subtitle={`${machine.brand} ${machine.model} · ${machine.internalCode}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/qr/${machine.id}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              QR-kod
            </Link>
            {machine.status === 'i_lager' && (
              <Link
                href={`/orders/new?machine=${machine.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Boka
              </Link>
            )}
            <Link
              href={`/machines/${machine.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Redigera
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <Link href="/machines" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till maskiner
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Machine Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Maskininformation</h2>
                <div className="flex flex-col items-end gap-1">
                  <MachineStatusBadge status={machine.status} />
                  {(() => {
                    const res = orders
                      .filter((o) => o.machineId === id && o.status === 'reserverad' && o.startDate > today)
                      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
                    return res ? (
                      <span
                        title={`Bokad från ${res.startDate}`}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full cursor-default"
                      >
                        Bokad {res.startDate}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Fabrikat', value: machine.brand, icon: Hash },
                  { label: 'Modell', value: machine.model, icon: Hash },
                  { label: 'Kategori', value: CATEGORY_LABELS[machine.category], icon: BarChart2 },
                  { label: 'Drivmedel', value: FUEL_LABELS[machine.fuelType], icon: Zap },
                  { label: 'Årsmodell', value: machine.year.toString(), icon: Calendar },
                  { label: 'Kapacitet', value: machine.capacity > 0 ? `${machine.capacity.toLocaleString('sv-SE')} kg` : '–', icon: TrendingUp },
                  { label: 'Serienummer', value: machine.serialNumber, icon: Hash },
                  { label: 'Intern kod', value: machine.internalCode, icon: Hash },
                  { label: 'Drifttimmar', value: `${machine.operatingHours.toLocaleString('sv-SE')} h`, icon: Clock },
                  { label: 'Reg.nummer', value: machine.registrationNumber || '–', icon: Hash },
                  { label: 'Placering', value: machine.location, icon: MapPin },
                  { label: 'Inköpsdatum', value: formatDate(machine.purchaseDate), icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-0.5">
                      <Icon className="w-3 h-3" />
                      {label}
                    </p>
                    <p className="text-sm font-medium text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              {specItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tekniska specifikationer</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {specItems.map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {machine.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Anteckningar</p>
                  <p className="text-sm text-slate-700">{machine.notes}</p>
                </div>
              )}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Intäkter senaste 6 månader</h2>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueChartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Intäkt']} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="intäkt" stroke="#3B82F6" fill="url(#blueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Uthyrningshistorik</h2>
              </div>
              {machineOrders.length === 0 ? (
                <p className="px-5 py-8 text-center text-slate-400 text-sm">Inga uthyrningar registrerade</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Order</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Kund</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Period</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Belopp</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {machineOrders.map((order) => {
                      const customer = customers.find((c) => c.id === order.customerId);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline font-medium">{order.orderNumber}</Link>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{customer?.companyName}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {formatDate(order.startDate)} – {formatDate(order.plannedReturnDate)}
                          </td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(order.totalPrice)}</td>
                          <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Service History */}
            {machineService.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <h2 className="font-semibold text-slate-900">Servicehistorik</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {machineService.map((s) => (
                    <div key={s.id} className="px-5 py-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">{s.description}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.status === 'avslutad' ? 'bg-emerald-100 text-emerald-700' :
                          s.status === 'pagaende' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status === 'avslutad' ? 'Avslutad' : s.status === 'pagaende' ? 'Pågående' : 'Planerad'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(s.startDate)} · {s.technicianName} · {formatCurrency(s.cost)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Financial Stats */}
          <div className="space-y-4">
            {/* Profitability */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Lönsamhet</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Inköpspris</span>
                  <span className="text-sm font-semibold">{formatCurrency(machine.purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Total intäkt</span>
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(machine.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Totala kostnader</span>
                  <span className="text-sm font-semibold text-red-500">{formatCurrency(totalCosts)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Nettoresultat</span>
                  <span className={`text-sm font-bold ${netResult >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(netResult)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">ROI</span>
                  <span className={`text-sm font-bold ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {roi}%
                  </span>
                </div>
              </div>

              {/* Recovery Progress */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">Återbetalt av inköpspris</span>
                  <span className="text-xs font-bold text-slate-700">{recoveryPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: `${recoveryPercent}%`,
                      backgroundColor: recoveryPercent >= 100 ? '#10B981' : recoveryPercent >= 60 ? '#3B82F6' : '#F59E0B',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {recoveryPercent < 100
                    ? `${formatCurrency(machine.purchasePrice - machine.totalRevenue)} kvar till break-even`
                    : `Break-even uppnådd!`}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Nyckeltal</h3>
              <div className="space-y-3">
                {[
                  { label: 'Antal uthyrningar', value: machine.totalRentals.toString() },
                  { label: 'Totalt uthyrda dagar', value: `${machine.totalRentalDays} dagar` },
                  { label: 'Snittintäkt/uthyrning', value: machine.totalRentals > 0 ? formatCurrency(machine.totalRevenue / machine.totalRentals) : '–' },
                  { label: 'Snitt månadsintäkt', value: formatCurrency(avgMonthlyRevenue) },
                  { label: 'Månadskostnad', value: formatCurrency(monthlyCost) },
                  { label: 'Servicekostnader', value: formatCurrency(machine.totalServiceCost) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-sm font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <h3 className="font-semibold text-slate-900 mb-3">Åtgärder</h3>
              <Link
                href="/orders/new"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors justify-center"
              >
                Skapa uthyrningsorder
              </Link>
              <Link
                href={`/service?machine=${machine.id}`}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors justify-center"
              >
                <Wrench className="w-4 h-4" />
                Skapa serviceärende
              </Link>
              <Link
                href={`/qr/${machine.id}`}
                target="_blank"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors justify-center"
              >
                <QrCode className="w-4 h-4" />
                Visa QR-kod
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors justify-center mt-4 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Ta bort maskin
              </button>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Ta bort maskin</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-5">
                    Är du säker på att du vill ta bort <strong>{machine.name}</strong>? Åtgärden kan inte ångras.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
