'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Truck, Clock, User, Calendar, CheckCircle2, AlertTriangle, Wrench, Printer } from 'lucide-react';
import { useStore } from '@/store';
import { MachineStatusBadge, OrderStatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, daysUntil } from '@/lib/utils';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((m) => m.QRCodeSVG), { ssr: false });

export default function QRPage() {
  const { id } = useParams<{ id: string }>();
  const { machines, orders, customers } = useStore();

  const machine = machines.find((m) => m.id === id);
  if (!machine) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-lg font-medium">Maskin hittades inte</p>
          <p className="text-slate-400 text-sm mt-1">QR-koden är ogiltig eller felaktig</p>
        </div>
      </div>
    );
  }

  const activeOrder = orders.find(
    (o) => o.machineId === machine.id && (o.status === 'aktiv' || o.status === 'reserverad')
  );
  const customer = activeOrder ? customers.find((c) => c.id === activeOrder.customerId) : null;
  const isOverdue = activeOrder && new Date(activeOrder.plannedReturnDate) < new Date();
  const daysLeft = activeOrder ? daysUntil(activeOrder.plannedReturnDate) : null;

  const qrUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">FleetRent</span>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-lg hover:bg-slate-600 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Skriv ut
        </button>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {/* Machine Card */}
        <div className="bg-white rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{machine.name}</h1>
              <p className="text-sm text-slate-500">{machine.brand} {machine.model}</p>
            </div>
            <MachineStatusBadge status={machine.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Intern kod', value: machine.internalCode },
              { label: 'Serienummer', value: machine.serialNumber },
              { label: 'Kapacitet', value: machine.capacity },
              { label: 'Drifttimmar', value: `${machine.operatingHours.toLocaleString('sv-SE')} h` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-4 border-t border-slate-100">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <QRCodeSVG value={qrUrl} size={120} />
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">Skanna för maskininfo</p>
        </div>

        {/* Active Order */}
        {activeOrder && customer ? (
          <div className={`bg-white rounded-2xl p-6 mb-4 border-2 ${isOverdue ? 'border-red-300' : 'border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              {isOverdue ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <Clock className="w-5 h-5 text-blue-500" />
              )}
              <h2 className="font-bold text-slate-900">Aktiv uthyrning</h2>
              <span className="ml-auto"><OrderStatusBadge status={activeOrder.status} /></span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Kund</p>
                  <p className="font-semibold text-slate-800">{customer.companyName}</p>
                  <p className="text-xs text-slate-500">{customer.contactPerson} · {customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Startdatum</p>
                  <p className="font-semibold text-slate-800">{formatDate(activeOrder.startDate)}</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-amber-600'}`} />
                <div>
                  <p className="text-xs text-slate-400">Planerad retur</p>
                  <p className={`font-bold ${isOverdue ? 'text-red-700' : 'text-amber-700'}`}>
                    {formatDate(activeOrder.plannedReturnDate)}
                  </p>
                  <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                    {isOverdue ? `FÖRSENAD – ${Math.abs(daysLeft!)} dag${Math.abs(daysLeft!) !== 1 ? 'ar' : ''} sen` : `${daysLeft} dag${daysLeft !== 1 ? 'ar' : ''} kvar`}
                  </p>
                </div>
              </div>
            </div>

            {/* Return Button */}
            <Link
              href={`/return/${activeOrder.id}`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 text-white font-bold text-base rounded-xl hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              Markera som tillbaka i lager
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-slate-900">Ingen aktiv uthyrning</h2>
            </div>
            <p className="text-sm text-slate-500">Maskinen är för tillfället {machine.status === 'i_lager' ? 'tillgänglig i lager' : machine.status === 'service' ? 'på service' : machine.status === 'skadad' ? 'skadad' : 'inte uthyrd'}.</p>
          </div>
        )}

        {/* Service */}
        {machine.status === 'service' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-sm text-orange-800 font-medium">Maskinen är på service</p>
          </div>
        )}
      </div>
    </div>
  );
}
