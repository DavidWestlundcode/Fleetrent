'use client';
import { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Truck, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store';
import { formatDate } from '@/lib/utils';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';
import PhotoCapture from '@/components/ui/PhotoCapture';

type PickupCondition = 'bra' | 'skadat' | 'kraver_service' | 'kraver_kontroll';

const CONDITIONS: { value: PickupCondition; label: string; desc: string; color: string }[] = [
  { value: 'bra', label: 'Bra skick', desc: 'Maskinen är i normalt skick utan skador', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'skadat', label: 'Skadad', desc: 'Maskinen har befintliga skador — dokumentera med foto', color: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'kraver_service', label: 'Kräver service', desc: 'Behöver genomgång av servicetekniker', color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'kraver_kontroll', label: 'Kräver kontroll', desc: 'Behöver kontrolleras innan utlämning', color: 'border-amber-500 bg-amber-50 text-amber-700' },
];

function PickupPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOrder = searchParams.get('from') === 'order';
  const { orders, machines, customers, organizationId, pickupMachine, initialized } = useStore();

  const order = orders.find((o) => o.id === id);
  const machine = order ? machines.find((m) => m.id === order.machineId) : null;
  const customer = order ? customers.find((c) => c.id === order.customerId) : null;

  const [step, setStep] = useState<1 | 2>(1);
  const [condition, setCondition] = useState<PickupCondition | null>(null);
  const [notes, setNotes] = useState('');
  const [operatingHours, setOperatingHours] = useState(machine?.operatingHours ?? 0);
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!initialized) return null;

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
          {fromOrder ? (
            <Link href={`/orders/${order.id}`} className="mt-4 block text-blue-400 hover:underline text-sm">← Till ordern</Link>
          ) : (
            <Link href={`/qr/${machine.id}`} className="mt-4 block text-blue-400 hover:underline text-sm">← Till maskinens QR-sida</Link>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!condition) return;
    pickupMachine(order.id, {
      pickupCondition: condition,
      pickupNotes: notes,
      pickupOperatingHours: operatingHours,
      pickupImages: images,
    });
    if (fromOrder) {
      router.push(`/orders/${order.id}`);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Utlämning registrerad!</h2>
          <p className="text-slate-500 text-sm mb-6">{machine.name} är dokumenterad och redo att lämnas ut till {customer?.companyName}.</p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <p className="text-sm text-slate-600"><span className="font-medium">Maskin:</span> {machine.name}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Kund:</span> {customer?.companyName}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Skick:</span> {CONDITIONS.find((c) => c.value === condition)?.label}</p>
            {images.length > 0 && (
              <p className="text-sm text-slate-600"><span className="font-medium">Foton:</span> {images.length} st</p>
            )}
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

  const backHref = fromOrder ? `/orders/${order.id}` : `/qr/${machine.id}`;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex items-center gap-3">
        <Link href={backHref} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-white font-bold">Utlämningsregistrering</p>
          <p className="text-slate-400 text-xs">{machine.name} · {order.orderNumber}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
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
                <p className="text-xs text-slate-400">Startdatum</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(order.startDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Maskinens skick vid utlämning</h3>
              <div className="space-y-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCondition(c.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      condition === c.value ? c.color : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-sm">{c.label}</p>
                    <p className="text-xs opacity-75 mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Drifttimmar vid utlämning</h3>
              <input
                type="number"
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-3 text-lg font-semibold text-center bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Kommentar och dokumentation</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Beskriv maskinens skick vid utlämning, eventuella befintliga skador eller avvikelser..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
                rows={4}
              />
              {organizationId && (
                <PhotoCapture
                  images={images}
                  onChange={setImages}
                  orgId={organizationId}
                  folderId={machine.id}
                  hint="Foton av maskinens skick innan den lämnar gården — värdefullt vid eventuell tvist om skador."
                />
              )}
            </div>

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
                  <span className="text-slate-500">Foton</span>
                  <span className="font-semibold">{images.length} st</span>
                </div>
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
                Bekräfta utlämning
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PickupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <PickupPageInner />
    </Suspense>
  );
}
