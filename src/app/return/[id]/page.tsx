'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Truck, ArrowLeft, Camera, AlertTriangle, Wrench } from 'lucide-react';
import { useStore } from '@/store';
import { formatDate, daysBetween } from '@/lib/utils';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';

type ReturnCondition = 'bra' | 'skadat' | 'kraver_service' | 'kraver_kontroll';

const CONDITIONS: { value: ReturnCondition; label: string; desc: string; color: string }[] = [
  { value: 'bra', label: 'Bra skick', desc: 'Maskinen är i normalt skick utan skador', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'skadat', label: 'Skadad', desc: 'Maskinen har skador som behöver åtgärdas', color: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'kraver_service', label: 'Kräver service', desc: 'Behöver genomgång av servicetekniker', color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'kraver_kontroll', label: 'Kräver kontroll', desc: 'Behöver kontrolleras innan ny uthyrning', color: 'border-amber-500 bg-amber-50 text-amber-700' },
];

export default function ReturnPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, machines, customers, returnMachine } = useStore();

  const order = orders.find((o) => o.id === id);
  const machine = order ? machines.find((m) => m.id === order.machineId) : null;
  const customer = order ? customers.find((c) => c.id === order.customerId) : null;

  const [step, setStep] = useState<1 | 2>(1);
  const [condition, setCondition] = useState<ReturnCondition | null>(null);
  const [notes, setNotes] = useState('');
  const [operatingHours, setOperatingHours] = useState(machine?.operatingHours ?? 0);
  const [submitted, setSubmitted] = useState(false);

  if (!order || !machine) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-lg font-medium">Order hittades inte</p>
          <Link href="/" className="text-slate-400 hover:text-white text-sm mt-2 block">← Tillbaka</Link>
        </div>
      </div>
    );
  }

  if (order.status !== 'aktiv' && order.status !== 'reserverad') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-semibold">Ordern är redan avslutad</p>
          <p className="text-slate-400 text-sm mt-2">Denna order har status: {order.status}</p>
          <Link href={`/qr/${machine.id}`} className="mt-4 block text-blue-400 hover:underline text-sm">← Till maskinens QR-sida</Link>
        </div>
      </div>
    );
  }

  const rentalDays = daysBetween(order.startDate, new Date().toISOString());

  const handleSubmit = () => {
    if (!condition) return;
    returnMachine(order.id, {
      returnCondition: condition,
      returnNotes: notes,
      returnOperatingHours: operatingHours,
      sendToService: condition === 'kraver_service' || condition === 'skadat',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Retur registrerad!</h2>
          <p className="text-slate-500 text-sm mb-6">
            {machine.name} har markerats som{' '}
            {condition === 'skadat' || condition === 'kraver_service' ? 'skickad till service' : 'tillbaka i lager'}.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Maskin:</span> {machine.name}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">Kund:</span> {customer?.companyName}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">Hyresperiod:</span> {rentalDays} dagar
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">Skick:</span> {CONDITIONS.find((c) => c.value === condition)?.label}
            </p>
          </div>
          <Link
            href={`/qr/${machine.id}`}
            className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-xl text-center hover:bg-blue-700 transition-colors"
          >
            Tillbaka till maskinsidan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex items-center gap-3">
        <Link href={`/qr/${machine.id}`} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-white font-bold">Returregistrering</p>
          <p className="text-slate-400 text-xs">{machine.name}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {/* Machine Info */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{machine.name}</h2>
              <p className="text-xs text-slate-500">{machine.brand} {machine.model} · {machine.internalCode}</p>
            </div>
            <div className="ml-auto">
              <MachineStatusBadge status={machine.status} />
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">Kund</p>
                <p className="text-sm font-semibold text-slate-800">{customer?.companyName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Uthyrd sedan</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(order.startDate)}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between">
              <div>
                <p className="text-xs text-slate-400">Planerad retur</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(order.plannedReturnDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Faktiska dagar</p>
                <p className="text-sm font-semibold text-slate-700">{rentalDays} dagar</p>
              </div>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* Condition Selection */}
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Maskinens skick vid retur</h3>
              <div className="space-y-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCondition(c.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      condition === c.value ? c.color + ' border-opacity-100' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-sm">{c.label}</p>
                    <p className="text-xs opacity-75 mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Drifttimmar vid retur</h3>
              <input
                type="number"
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                min={machine.operatingHours}
                className="w-full px-4 py-3 text-lg font-semibold text-center bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 text-center mt-1">Vid avresa: {machine.operatingHours.toLocaleString('sv-SE')} h</p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!condition}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Nästa →
            </button>
          </>
        ) : (
          <>
            {/* Notes and Photos */}
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Kommentar och dokumentation</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Beskriv maskinens skick, eventuella skador eller avvikelser..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <button className="mt-3 flex items-center gap-2 w-full py-3 border border-dashed border-slate-300 text-slate-500 text-sm rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors justify-center">
                <Camera className="w-4 h-4" />
                Lägg till foton (kommer snart)
              </button>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Sammanfattning</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Skick</span>
                  <span className="font-semibold">{CONDITIONS.find((c) => c.value === condition)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Drifttimmar</span>
                  <span className="font-semibold">{operatingHours.toLocaleString('sv-SE')} h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Hyresperiod</span>
                  <span className="font-semibold">{rentalDays} dagar</span>
                </div>
                {(condition === 'skadat' || condition === 'kraver_service') && (
                  <div className="mt-2 p-3 bg-orange-50 rounded-xl flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-500" />
                    <p className="text-xs text-orange-700 font-medium">Maskinen skickas automatiskt till service</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 active:scale-95 transition-all"
              >
                ← Tillbaka
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Bekräfta retur
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
