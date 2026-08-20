'use client';
import { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Truck, ArrowLeft, AlertTriangle, Wrench } from 'lucide-react';
import { useStore } from '@/store';
import { formatDate, daysBetween, countBusinessDays, calcBreakdown, calcDiscountedTotal, formatCurrency } from '@/lib/utils';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';
import PhotoCapture from '@/components/ui/PhotoCapture';

type ReturnCondition = 'bra' | 'skadat' | 'kraver_service' | 'kraver_kontroll';

const CONDITIONS: { value: ReturnCondition; label: string; desc: string; color: string }[] = [
  { value: 'bra', label: 'Bra skick', desc: 'Maskinen är i normalt skick utan skador', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'skadat', label: 'Skadad', desc: 'Maskinen har skador som behöver åtgärdas', color: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'kraver_service', label: 'Kräver service', desc: 'Behöver genomgång av servicetekniker', color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'kraver_kontroll', label: 'Kräver kontroll', desc: 'Behöver kontrolleras innan ny uthyrning', color: 'border-amber-500 bg-amber-50 text-amber-700' },
];

function ReturnPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOrder = searchParams.get('from') === 'order';
  const { orders, machines, customers, articles, organizationId, returnMachine, initialized } = useStore();

  const order = orders.find((o) => o.id === id);
  const machine = order ? machines.find((m) => m.id === order.machineId) : null;
  const customer = order ? customers.find((c) => c.id === order.customerId) : null;

  const [step, setStep] = useState<1 | 2>(1);
  const [condition, setCondition] = useState<ReturnCondition | null>(null);
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

  const today = new Date().toISOString();
  const isOpenEnded = order.openEnded === true || !order.plannedReturnDate;
  // Always settle on the actual return date, not the originally planned one — an early or late
  // return should bill for the days the machine was actually out.
  const rentalDays = order.chargeWeekends ? daysBetween(order.startDate, today) : countBusinessDays(order.startDate, today);

  const priceBreakdown = calcBreakdown(rentalDays, order.dailyPrice, order.weeklyPrice, order.monthlyPrice);
  const rentalCost = calcDiscountedTotal(
    priceBreakdown, order.dailyPrice, order.weeklyPrice, order.monthlyPrice,
    order.rentalDiscount, order.weeklyDiscount, order.monthlyDiscount
  );
  const insuranceCostAtReturn = order.insuranceMonthlyRate
    ? Math.ceil(rentalDays / 30) * order.insuranceMonthlyRate
    : (order.insuranceCost ?? 0);
  // Extra articles (transport, insurance, or anything else added as a line item) are part of
  // the order's real value and must count toward machine revenue stats too — deposit is
  // excluded since it's refundable, not revenue, matching how totalPrice is built at creation.
  const extraArticlesTotal = (order.orderArticles ?? []).reduce((sum, r) => {
    const d = r.discountPercent ?? 0;
    return sum + r.quantity * r.unitPrice * (1 - d / 100);
  }, 0);
  const finalTotalPrice = rentalCost + insuranceCostAtReturn + extraArticlesTotal;

  const handleSubmit = () => {
    if (!condition) return;
    returnMachine(order.id, {
      returnCondition: condition,
      returnNotes: notes,
      returnOperatingHours: operatingHours,
      returnImages: images,
      sendToService: condition === 'kraver_service' || condition === 'skadat',
      finalTotalPrice,
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">Order avslutad!</h2>
          <p className="text-slate-500 text-sm mb-6">
            {machine.name} har markerats som{' '}
            {condition === 'skadat' || condition === 'kraver_service' ? 'skickad till service' : 'tillbaka i lager'}.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <p className="text-sm text-slate-600"><span className="font-medium">Maskin:</span> {machine.name}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Kund:</span> {customer?.companyName}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Hyresperiod:</span> {rentalDays} dagar</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Skick:</span> {CONDITIONS.find((c) => c.value === condition)?.label}</p>
            {finalTotalPrice !== undefined && (
              <p className="text-sm text-slate-600"><span className="font-medium">Totalt:</span> {formatCurrency(finalTotalPrice)}</p>
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
          <p className="text-white font-bold">Returregistrering</p>
          <p className="text-slate-400 text-xs">{machine.name} · {order.orderNumber}</p>
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
                <p className="text-sm font-semibold text-slate-700">
                  {order.plannedReturnDate ? formatDate(order.plannedReturnDate) : 'Löpande'}
                </p>
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
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Maskinens skick vid retur</h3>
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
            <div className="bg-white rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">Kommentar och dokumentation</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Beskriv maskinens skick, eventuella skador eller avvikelser..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
                rows={4}
              />
              {organizationId && (
                <PhotoCapture
                  images={images}
                  onChange={setImages}
                  orgId={organizationId}
                  folderId={machine.id}
                  hint="Foton av maskinens skick vid retur — särskilt viktigt om skick avviker från utlämningen."
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
                  <span className="text-slate-500">Hyresperiod</span>
                  <span className="font-semibold">{rentalDays} dagar</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Foton</span>
                  <span className="font-semibold">{images.length} st</span>
                </div>
                {(condition === 'skadat' || condition === 'kraver_service') && (
                  <div className="mt-2 p-3 bg-orange-50 rounded-xl flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-500" />
                    <p className="text-xs text-orange-700 font-medium">Maskinen skickas automatiskt till service</p>
                  </div>
                )}
                {priceBreakdown && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Beräknad hyreskostnad {!isOpenEnded && <span className="text-slate-400 font-normal">(faktiska dagar, ej planerat slutdatum)</span>}
                    </p>
                    <div className="space-y-1">
                      {priceBreakdown.months > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 inline-flex items-center">
                            {priceBreakdown.months} mån à {formatCurrency(order.monthlyPrice)}
                            {(order.monthlyDiscount ?? 0) > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 rounded">-{order.monthlyDiscount}%</span>}
                          </span>
                          <span className="font-medium">{formatCurrency(priceBreakdown.months * order.monthlyPrice * (1 - (order.monthlyDiscount ?? 0) / 100))}</span>
                        </div>
                      )}
                      {priceBreakdown.weeks > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 inline-flex items-center">
                            {priceBreakdown.weeks} veckor à {formatCurrency(order.weeklyPrice)}
                            {(order.weeklyDiscount ?? 0) > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 rounded">-{order.weeklyDiscount}%</span>}
                          </span>
                          <span className="font-medium">{formatCurrency(priceBreakdown.weeks * order.weeklyPrice * (1 - (order.weeklyDiscount ?? 0) / 100))}</span>
                        </div>
                      )}
                      {priceBreakdown.days > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 inline-flex items-center">
                            {priceBreakdown.days} dagar à {formatCurrency(order.dailyPrice)}
                            {(order.rentalDiscount ?? 0) > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 rounded">-{order.rentalDiscount}%</span>}
                          </span>
                          <span className="font-medium">{formatCurrency(priceBreakdown.days * order.dailyPrice * (1 - (order.rentalDiscount ?? 0) / 100))}</span>
                        </div>
                      )}
                      {insuranceCostAtReturn > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Försäkring{order.insuranceMonthlyRate ? ` (${Math.ceil(rentalDays / 30)} mån)` : ''}
                          </span>
                          <span className="font-medium">{formatCurrency(insuranceCostAtReturn)}</span>
                        </div>
                      )}
                      {(order.orderArticles ?? []).map((row, i) => {
                        const art = articles.find((a) => a.id === row.articleId);
                        const d = row.discountPercent ?? 0;
                        const lineTotal = row.quantity * row.unitPrice * (1 - d / 100);
                        return (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-slate-500">
                              {row.description ?? art?.name ?? 'Artikel'} {row.quantity} × {formatCurrency(row.unitPrice)}
                              {d > 0 && <span className="ml-1 text-emerald-600 font-medium">-{d}%</span>}
                            </span>
                            <span className="font-medium">{formatCurrency(lineTotal)}</span>
                          </div>
                        );
                      })}
                      {order.deposit > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Deposition (ej ingår i totalt, återbetalas)</span>
                          <span className="font-medium">{formatCurrency(order.deposit)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-200">
                        <span>Totalt</span>
                        <span className="text-blue-600">{formatCurrency(finalTotalPrice ?? 0)}</span>
                      </div>
                    </div>
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
                Avsluta order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <ReturnPageInner />
    </Suspense>
  );
}
