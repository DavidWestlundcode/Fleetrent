'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Truck, Building2, Calendar, Package, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { MachineStatusBadge, OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate, formatDateTime, daysBetween, daysUntil } from '@/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, machines, customers, updateOrder } = useStore();

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-400">
        <div className="text-center">
          <p className="text-lg font-medium">Ordern hittades inte</p>
          <Link href="/orders" className="text-blue-600 hover:underline text-sm mt-2 block">← Tillbaka</Link>
        </div>
      </div>
    );
  }

  const machine = machines.find((m) => m.id === order.machineId);
  const customer = customers.find((c) => c.id === order.customerId);
  const isOverdue = order.status === 'aktiv' && new Date(order.plannedReturnDate) < new Date();
  const daysRemaining = daysUntil(order.plannedReturnDate);
  const actualDays = order.actualReturnDate
    ? daysBetween(order.startDate, order.actualReturnDate)
    : daysBetween(order.startDate, new Date().toISOString());

  const handleCancelOrder = () => {
    if (confirm('Är du säker på att du vill annullera denna order?')) {
      updateOrder(order.id, { status: 'annullerad' });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title={order.orderNumber}
        subtitle={`${customer?.companyName ?? '–'} · ${machine?.name ?? '–'}`}
        actions={
          <div className="flex items-center gap-2">
            {(order.status === 'aktiv' || order.status === 'reserverad') && (
              <>
                <Link
                  href={`/return/${order.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Registrera retur
                </Link>
                <button
                  onClick={handleCancelOrder}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Annullera
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Tillbaka till order
        </Link>

        {isOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Försenad retur!</p>
              <p className="text-sm text-red-700">Maskinen skulle ha returnerats för {Math.abs(daysRemaining)} dagar sedan.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Orderdetaljer</h2>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Building2 className="w-3.5 h-3.5" /> Kund
                  </div>
                  <Link href={`/customers/${customer?.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {customer?.companyName}
                  </Link>
                  <p className="text-xs text-slate-500">{customer?.contactPerson}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Truck className="w-3.5 h-3.5" /> Maskin
                  </div>
                  <Link href={`/machines/${machine?.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {machine?.name}
                  </Link>
                  <p className="text-xs text-slate-500">{machine?.brand} {machine?.model}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Skapad
                  </div>
                  <p className="text-sm font-medium text-slate-800">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Startdatum</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(order.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Planerad retur</p>
                  <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                    {formatDate(order.plannedReturnDate)}
                  </p>
                </div>
                {order.actualReturnDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Faktisk retur</p>
                    <p className="text-sm font-medium text-slate-800">{formatDate(order.actualReturnDate)}</p>
                  </div>
                )}
              </div>

              {order.accessories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Tillbehör</p>
                  <div className="flex flex-wrap gap-2">
                    {order.accessories.map((acc, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{acc}</span>
                    ))}
                  </div>
                </div>
              )}

              {(order.customerNotes || order.internalNotes) && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.customerNotes && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Kundanteckning</p>
                      <p className="text-sm text-slate-700">{order.customerNotes}</p>
                    </div>
                  )}
                  {order.internalNotes && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Intern anteckning</p>
                      <p className="text-sm text-slate-700">{order.internalNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Return Info */}
            {order.returnCondition && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Returinformation</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Skick vid retur</p>
                    <p className="text-sm font-medium text-slate-800 capitalize">
                      {order.returnCondition === 'bra' ? 'Bra' :
                       order.returnCondition === 'skadat' ? 'Skadat' :
                       order.returnCondition === 'kraver_service' ? 'Kräver service' : 'Kräver kontroll'}
                    </p>
                  </div>
                  {order.returnOperatingHours && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Drifttimmar vid retur</p>
                      <p className="text-sm font-medium text-slate-800">{order.returnOperatingHours.toLocaleString('sv-SE')} h</p>
                    </div>
                  )}
                  {order.returnNotes && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Returkommentar</p>
                      <p className="text-sm text-slate-700">{order.returnNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Log */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Händelselogg</h2>
              </div>
              <div className="px-5 py-4 space-y-3">
                {order.events.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      {i < order.events.length - 1 && <div className="w-px h-full bg-slate-200 mt-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-slate-800">{event.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Pricing */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Ekonomi</h3>
              <div className="space-y-2">
                {[
                  { label: 'Dagspris', value: formatCurrency(order.dailyPrice) + '/dag' },
                  { label: 'Veckopris', value: formatCurrency(order.weeklyPrice) + '/vecka' },
                  { label: 'Månadspris', value: formatCurrency(order.monthlyPrice) + '/mån' },
                  { label: 'Transport', value: formatCurrency(order.transportCost) },
                  { label: 'Deposition', value: formatCurrency(order.deposit) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span className="font-semibold text-slate-800">Totalt</span>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Hyresperiod</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Planerade dagar</span>
                  <span className="font-medium">{daysBetween(order.startDate, order.plannedReturnDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Faktiska dagar</span>
                  <span className="font-medium">{actualDays}</span>
                </div>
                {order.status === 'aktiv' && !isOverdue && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dagar kvar</span>
                    <span className="font-medium text-emerald-600">{daysRemaining}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Machine Quick Info */}
            {machine && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Maskininfo</h3>
                <div className="flex items-center gap-2 mb-3">
                  <MachineStatusBadge status={machine.status} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Intern kod</span>
                    <span className="font-medium">{machine.internalCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Serienummer</span>
                    <span className="font-medium text-xs">{machine.serialNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Drifttimmar</span>
                    <span className="font-medium">{machine.operatingHours.toLocaleString('sv-SE')} h</span>
                  </div>
                </div>
                <Link href={`/machines/${machine.id}`} className="mt-3 block text-center text-xs text-blue-600 hover:underline">
                  Visa maskinsida →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
