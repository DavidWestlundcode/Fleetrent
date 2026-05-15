'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Truck, Building2, Calendar, CheckCircle2, Trash2, Pencil, Send, Loader2, ExternalLink } from 'lucide-react';
import Header from '@/components/layout/Header';
import { MachineStatusBadge, OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate, formatDateTime, daysBetween, daysUntil } from '@/lib/utils';
import { ARTICLE_UNIT_LABELS } from '@/lib/types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, machines, customers, articles, members, updateOrder, deleteOrder } = useStore();
  const getMemberName = (userId: string) => members.find((m) => m.id === userId)?.fullName ?? 'Okänd användare';
  const [sendingToFortnox, setSendingToFortnox] = useState(false);
  const [fortnoxError, setFortnoxError] = useState<string | null>(null);

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
  const isOverdue = order.status === 'aktiv' && !!order.plannedReturnDate && new Date(order.plannedReturnDate) < new Date();
  const daysRemaining = order.plannedReturnDate ? daysUntil(order.plannedReturnDate) : null;
  const actualDays = order.actualReturnDate
    ? daysBetween(order.startDate, order.actualReturnDate)
    : daysBetween(order.startDate, new Date().toISOString());

  const handleCancelOrder = () => {
    if (confirm('Är du säker på att du vill annullera denna order?')) {
      updateOrder(order.id, { status: 'annullerad' });
    }
  };

  const handleDeleteOrder = () => {
    if (confirm(`Radera order ${order.orderNumber}? Detta går inte att ångra.`)) {
      deleteOrder(order.id);
      router.push('/orders');
    }
  };

  const handleSendToFortnox = async () => {
    setSendingToFortnox(true);
    setFortnoxError(null);
    try {
      const res = await fetch('/api/fortnox/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'Fortnox inte ansluten') {
          setFortnoxError('Fortnox är inte ansluten. Gå till Inställningar → Integrationer för att ansluta.');
        } else {
          setFortnoxError(data.error ?? 'Något gick fel');
        }
        return;
      }
      updateOrder(order.id, {
        sentToAccounting: true,
        fortnoxOrderNumber: data.fortnoxOrderNumber,
      });
    } finally {
      setSendingToFortnox(false);
    }
  };

  const handleMarkSentManually = () => {
    if (confirm('Markera order som skickad till bokföringsprogrammet manuellt?')) {
      updateOrder(order.id, { sentToAccounting: true });
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
                  href={`/return/${order.id}?from=order`}
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
            {order.status === 'klar_for_fakturering' && !order.sentToAccounting && (
              <button
                onClick={handleSendToFortnox}
                disabled={sendingToFortnox}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                {sendingToFortnox ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Skicka till bokföringsprogrammet
              </button>
            )}
            {order.status === 'klar_for_fakturering' && !order.sentToAccounting && (
              <button
                onClick={handleMarkSentManually}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Markera skickad manuellt
              </button>
            )}
            {order.status === 'klar_for_fakturering' && order.sentToAccounting && (
              <button
                onClick={() => updateOrder(order.id, { status: 'avslutad' })}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Markera fakturerad
              </button>
            )}
            <Link
              href={`/orders/${order.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Redigera
            </Link>
            <button
              onClick={handleDeleteOrder}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Radera
            </button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Tillbaka till order
        </Link>

        {fortnoxError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-700 text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Kunde inte skicka till Fortnox</p>
              <p className="text-sm text-red-700">{fortnoxError}</p>
              {fortnoxError.includes('Inställningar') && (
                <Link href="/settings?tab=integrations" className="mt-1 inline-flex items-center gap-1 text-sm text-red-700 underline">
                  Gå till integrationer <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={handleMarkSentManually}
                className="mt-2 text-sm text-red-700 underline block"
              >
                Markera som skickad manuellt istället
              </button>
            </div>
          </div>
        )}

        {isOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Försenad retur!</p>
              <p className="text-sm text-red-700">Maskinen skulle ha returnerats för {daysRemaining !== null ? Math.abs(daysRemaining) : 0} dagar sedan.</p>
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
                    {order.plannedReturnDate ? formatDate(order.plannedReturnDate) : 'Löpande'}
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

            {/* Articles Table */}
            {(order.rentalArticleId || order.insuranceArticleId || order.transportArticleId || order.depositArticleId) && (() => {
              const totalDays = order.actualReturnDate
                ? daysBetween(order.startDate, order.actualReturnDate)
                : order.plannedReturnDate
                ? daysBetween(order.startDate, order.plannedReturnDate)
                : null;

              const rows = [
                { id: order.rentalArticleId, type: 'rental' as const },
                { id: order.insuranceArticleId, type: 'insurance' as const },
                { id: order.transportArticleId, type: 'transport' as const },
                { id: order.depositArticleId, type: 'deposit' as const },
              ]
                .filter((r) => r.id)
                .map((r) => {
                  const art = articles.find((a) => a.id === r.id);
                  if (!art) return null;
                  let antal: number | string;
                  if (totalDays === null) {
                    antal = 'Löpande';
                  } else if (r.type === 'transport' || r.type === 'deposit') {
                    antal = 1;
                  } else if (r.type === 'insurance') {
                    antal = Math.ceil(totalDays / 30);
                  } else {
                    switch (art.unit) {
                      case 'dag': antal = totalDays; break;
                      case 'vecka': antal = Math.ceil(totalDays / 7); break;
                      case 'månad': antal = Math.ceil(totalDays / 30); break;
                      default: antal = 1;
                    }
                  }
                  return { art, antal };
                })
                .filter(Boolean) as { art: (typeof articles)[number]; antal: number | string }[];

              if (rows.length === 0) return null;
              return (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">Artiklar</h2>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Art.nr</th>
                        <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Beskrivning</th>
                        <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Antal</th>
                        <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enhet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row) => (
                        <tr key={row.art.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3 font-mono text-[13px] text-slate-700">{row.art.articleNumber}</td>
                          <td className="px-5 py-3 text-[13px] text-slate-800">{row.art.name}</td>
                          <td className="px-5 py-3 text-[13px] text-right font-medium text-slate-700">
                            {typeof row.antal === 'string'
                              ? <span className="text-amber-600">{row.antal}</span>
                              : row.antal}
                          </td>
                          <td className="px-5 py-3 text-[13px] text-slate-500">{ARTICLE_UNIT_LABELS[row.art.unit]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

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
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDateTime(event.timestamp)}
                        {event.userId && <span className="ml-1.5">· {getMemberName(event.userId)}</span>}
                      </p>
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
                  ...(order.insuranceCost ? [{ label: 'Försäkring', value: formatCurrency(order.insuranceCost) }] : []),
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
                  <span className="font-medium">
                    {order.plannedReturnDate ? daysBetween(order.startDate, order.plannedReturnDate) : '–'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Faktiska dagar</span>
                  <span className="font-medium">{actualDays}</span>
                </div>
                {order.status === 'aktiv' && !isOverdue && daysRemaining !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dagar kvar</span>
                    <span className="font-medium text-emerald-600">{daysRemaining}</span>
                  </div>
                )}
                {order.status === 'aktiv' && !order.plannedReturnDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Typ</span>
                    <span className="font-medium text-amber-600">Löpande</span>
                  </div>
                )}
              </div>
            </div>

            {/* Created by */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Orderinfo</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ordernummer</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                {order.orderReference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Ordermärkning</span>
                    <span className="font-medium font-mono text-xs">{order.orderReference}</span>
                  </div>
                )}
                {order.fortnoxOrderNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Fortnox-order</span>
                    <span className="font-medium font-mono text-xs text-[#00a651]">#{order.fortnoxOrderNumber}</span>
                  </div>
                )}
                {order.sentToAccounting && !order.fortnoxOrderNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Bokföring</span>
                    <span className="text-xs text-emerald-600">Skickad manuellt</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Skapad av</span>
                  <span className="font-medium">{order.createdBy ? getMemberName(order.createdBy) : '–'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Skapad</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
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
