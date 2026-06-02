'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Truck, Building2, Calendar, CheckCircle2, Trash2, Pencil, Send, Loader2, ExternalLink, Receipt, Plus, ChevronDown, ChevronUp, FileSignature } from 'lucide-react';
import Header from '@/components/layout/Header';
import { MachineStatusBadge, OrderStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate, formatDateTime, daysBetween, daysUntil, calcBreakdown, countBusinessDays } from '@/lib/utils';
import { ARTICLE_UNIT_LABELS } from '@/lib/types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, machines, customers, articles, members, updateOrder, deleteOrder, addInvoicePeriod, markInvoicePeriodSent } = useStore();
  const getMemberName = (userId: string) => members.find((m) => m.id === userId)?.fullName ?? 'Okänd användare';
  const [sendingToFortnox, setSendingToFortnox] = useState(false);
  const [fortnoxError, setFortnoxError] = useState<string | null>(null);
  const [sendingToZigned, setSendingToZigned] = useState(false);
  const [zignedError, setZignedError] = useState<string | null>(null);
  const [checkingZignedStatus, setCheckingZignedStatus] = useState(false);
  const [downloadingAgreement, setDownloadingAgreement] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceEndDate, setInvoiceEndDate] = useState('');
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [sendingPeriodId, setSendingPeriodId] = useState<string | null>(null);
  const [periodFortnoxError, setPeriodFortnoxError] = useState<string | null>(null);

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

  // Invoice period calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const sortedInvoices = [...(order.invoicePeriods ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const lastInvoiceEnd = sortedInvoices.length > 0 ? sortedInvoices[sortedInvoices.length - 1].endDate : null;
  const nextInvoiceStart = lastInvoiceEnd
    ? new Date(new Date(lastInvoiceEnd).getTime() + 86400000).toISOString().split('T')[0]
    : order.startDate;
  const effectiveEnd = order.actualReturnDate || todayStr;
  const totalRentedDays = Math.max(0, daysBetween(order.startDate, effectiveEnd));
  const invoicedDays = sortedInvoices.reduce((s, p) => s + p.days, 0);
  const uninvoicedDays = Math.max(0, totalRentedDays - invoicedDays);
  const canInvoice = (order.status === 'aktiv' || order.status === 'klar_for_fakturering') && nextInvoiceStart <= effectiveEnd;

  const newInvoiceDays = invoiceEndDate && invoiceEndDate >= nextInvoiceStart
    ? (order.chargeWeekends ? daysBetween(nextInvoiceStart, invoiceEndDate) : countBusinessDays(nextInvoiceStart, invoiceEndDate))
    : 0;
  const newInvoiceBreakdown = calcBreakdown(newInvoiceDays, order.dailyPrice, order.weeklyPrice, order.monthlyPrice);
  const rentalDisc = order.rentalDiscount ?? 0;
  const newInvoiceAmount = newInvoiceBreakdown.total * (1 - rentalDisc / 100);

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

  const handleCheckZignedStatus = async () => {
    setCheckingZignedStatus(true);
    try {
      const res = await fetch('/api/zigned/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (res.ok && data.signingStatus) {
        updateOrder(order.id, { signingStatus: data.signingStatus });
      }
    } finally {
      setCheckingZignedStatus(false);
    }
  };

  const handleDownloadAgreement = async () => {
    setDownloadingAgreement(true);
    try {
      const res = await fetch('/api/zigned/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } finally {
      setDownloadingAgreement(false);
    }
  };

  const handleSendToZigned = async () => {
    setSendingToZigned(true);
    setZignedError(null);
    try {
      const res = await fetch('/api/zigned/send-for-signing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) { setZignedError(data.error ?? 'Något gick fel'); return; }
      updateOrder(order.id, {
        zignedAgreementId: data.agreementId,
        signingStatus: 'pending',
        signingUrl: data.signingUrl,
      });
    } finally {
      setSendingToZigned(false);
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
            {(order.status === 'aktiv' || order.status === 'reserverad') && !order.signingStatus && (
              <button
                onClick={handleSendToZigned}
                disabled={sendingToZigned}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {sendingToZigned ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                Skicka för signering
              </button>
            )}
            {order.signingStatus === 'pending' && (
              <span className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                Väntar på signering
              </span>
            )}
            {order.signingStatus === 'signed' && (
              <span className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Signerat
              </span>
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

        {zignedError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-700 text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">Kunde inte skicka till Zigned</p>
              <p className="text-sm text-red-700">{zignedError}</p>
            </div>
          </div>
        )}

        {order.signingStatus === 'pending' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
            <FileSignature className="w-5 h-5 text-indigo-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-indigo-800">Väntar på kundens signering</p>
              <p className="text-sm text-indigo-600 mt-0.5">Kunden har fått ett e-postmeddelande med signeringslänken.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCheckZignedStatus}
                disabled={checkingZignedStatus}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50">
                {checkingZignedStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Kontrollera status
              </button>
              {order.signingUrl && (
                <a href={order.signingUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Öppna signeringsrum
                </a>
              )}
            </div>
          </div>
        )}

        {order.signingStatus === 'signed' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-emerald-800 flex-1">Hyresavtalet är signerat av kunden.</p>
            <button
              onClick={handleDownloadAgreement}
              disabled={downloadingAgreement}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50">
              {downloadingAgreement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
              Ladda ner signerat avtal
            </button>
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

            {/* Fakturering */}
            {(order.status === 'aktiv' || order.status === 'klar_for_fakturering' || sortedInvoices.length > 0) && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-500" />
                    <h2 className="font-semibold text-slate-900">Fakturering</h2>
                  </div>
                  {canInvoice && (
                    <button
                      onClick={() => { setShowInvoiceForm((v) => !v); setInvoiceEndDate(effectiveEnd); setPeriodFortnoxError(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {showInvoiceForm ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {showInvoiceForm ? 'Stäng' : 'Skapa delfaktura'}
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Totalt uthyrd', value: `${totalRentedDays} dagar`, color: 'text-slate-700' },
                    { label: 'Fakturerat', value: `${invoicedDays} dagar`, color: 'text-emerald-600' },
                    { label: 'Ej fakturerat', value: `${uninvoicedDays} dagar`, color: uninvoicedDays > 0 ? 'text-amber-600' : 'text-slate-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                      <p className={`text-[15px] font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Period history */}
                {sortedInvoices.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Period</th>
                          <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Dagar</th>
                          <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Belopp</th>
                          <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-3 py-2 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedInvoices.map((period) => (
                          <tr key={period.id} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2.5 text-[13px] text-slate-700">
                              {formatDate(period.startDate)} – {formatDate(period.endDate)}
                            </td>
                            <td className="px-3 py-2.5 text-[13px] text-right text-slate-600">{period.days} dagar</td>
                            <td className="px-3 py-2.5 text-[13px] text-right font-medium text-slate-800">{formatCurrency(period.amount)}</td>
                            <td className="px-3 py-2.5 text-right">
                              {period.sentToAccounting ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {period.fortnoxOrderNumber ? `#${period.fortnoxOrderNumber}` : 'Skickad'}
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-600 font-medium">Ej skickad</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {!period.sentToAccounting && (
                                <button
                                  onClick={async () => {
                                    setSendingPeriodId(period.id);
                                    setPeriodFortnoxError(null);
                                    try {
                                      const res = await fetch('/api/fortnox/create-partial-invoice', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ orderId: order.id, periodId: period.id }),
                                      });
                                      const data = await res.json();
                                      if (!res.ok) { setPeriodFortnoxError(data.error ?? 'Fel'); return; }
                                      markInvoicePeriodSent(order.id, period.id, data.fortnoxOrderNumber);
                                    } finally { setSendingPeriodId(null); }
                                  }}
                                  disabled={sendingPeriodId === period.id}
                                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {sendingPeriodId === period.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                  Fortnox
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {periodFortnoxError && (
                  <p className="mb-3 text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{periodFortnoxError}</p>
                )}

                {/* New invoice form */}
                {showInvoiceForm && canInvoice && (
                  <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-3">
                    <p className="text-[12px] font-semibold text-slate-600">Ny delfaktura</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Från</label>
                        <div className="px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-500">{nextInvoiceStart}</div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Till</label>
                        <input
                          type="date"
                          value={invoiceEndDate}
                          min={nextInvoiceStart}
                          max={effectiveEnd}
                          onChange={(e) => setInvoiceEndDate(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                    </div>

                    {newInvoiceDays > 0 && (
                      <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-1 text-[12px]">
                        {newInvoiceBreakdown.months > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>{newInvoiceBreakdown.months} mån à {formatCurrency(order.monthlyPrice)}</span>
                            <span>{formatCurrency(newInvoiceBreakdown.months * order.monthlyPrice)}</span>
                          </div>
                        )}
                        {newInvoiceBreakdown.weeks > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>{newInvoiceBreakdown.weeks} v à {formatCurrency(order.weeklyPrice)}</span>
                            <span>{formatCurrency(newInvoiceBreakdown.weeks * order.weeklyPrice)}</span>
                          </div>
                        )}
                        {newInvoiceBreakdown.days > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>{newInvoiceBreakdown.days} dagar à {formatCurrency(order.dailyPrice)}</span>
                            <span>{formatCurrency(newInvoiceBreakdown.days * order.dailyPrice)}</span>
                          </div>
                        )}
                        {rentalDisc > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Rabatt -{rentalDisc}%</span>
                            <span>-{formatCurrency(newInvoiceBreakdown.total * rentalDisc / 100)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                          <span>{newInvoiceDays} fakturerbara dagar</span>
                          <span>{formatCurrency(newInvoiceAmount)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        disabled={newInvoiceDays === 0 || savingInvoice}
                        onClick={async () => {
                          if (newInvoiceDays === 0) return;
                          setSavingInvoice(true);
                          addInvoicePeriod(order.id, {
                            startDate: nextInvoiceStart,
                            endDate: invoiceEndDate,
                            days: newInvoiceDays,
                            amount: newInvoiceAmount,
                            sentToAccounting: false,
                          });
                          setShowInvoiceForm(false);
                          setSavingInvoice(false);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {savingInvoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                        Spara delfaktura
                      </button>
                      <button onClick={() => setShowInvoiceForm(false)} className="px-4 py-2 text-[13px] text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        Avbryt
                      </button>
                    </div>
                  </div>
                )}

                {sortedInvoices.length === 0 && !canInvoice && (
                  <p className="text-[13px] text-slate-400 text-center py-2">Inga fakturor skapade ännu</p>
                )}
              </div>
            )}

            {/* Articles Table */}
            {(order.rentalArticleId || order.insuranceArticleId || order.transportArticleId || order.depositArticleId || order.orderArticles?.length > 0) && (() => {
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
                        <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pris</th>
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
                          <td className="px-5 py-3 text-[13px] text-right text-slate-500">–</td>
                        </tr>
                      ))}
                      {(order.orderArticles ?? []).map((row, i) => {
                        const art = articles.find((a) => a.id === row.articleId);
                        if (!art) return null;
                        return (
                          <tr key={`extra-${i}`} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3 font-mono text-[13px] text-slate-700">{art.articleNumber}</td>
                            <td className="px-5 py-3 text-[13px] text-slate-800">{row.description ?? art.name}</td>
                            <td className="px-5 py-3 text-[13px] text-right font-medium text-slate-700">{row.quantity}</td>
                            <td className="px-5 py-3 text-[13px] text-slate-500">{ARTICLE_UNIT_LABELS[art.unit]}</td>
                            <td className="px-5 py-3 text-[13px] text-right font-medium text-slate-700">{formatCurrency(row.quantity * row.unitPrice)}</td>
                          </tr>
                        );
                      })}
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
            {(() => {
              const endDate = order.actualReturnDate || order.plannedReturnDate || null;
              const totalCalDays = endDate ? daysBetween(order.startDate, endDate) : null;
              const billableDays = totalCalDays !== null
                ? (order.chargeWeekends ? totalCalDays : countBusinessDays(order.startDate, endDate!))
                : null;
              const breakdown = billableDays !== null
                ? calcBreakdown(billableDays, order.dailyPrice, order.weeklyPrice, order.monthlyPrice)
                : null;
              const insuranceMonths = billableDays ? Math.ceil(billableDays / 30) : 0;
              const rentalDisc = order.rentalDiscount ?? 0;
              const insDisc = order.insuranceDiscount ?? 0;
              const rentalGross = breakdown ? breakdown.total : 0;
              const rentalNet = rentalGross * (1 - rentalDisc / 100);

              return (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Ekonomi</h3>
                  <div className="space-y-4">

                    {/* Rental */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Hyra</p>
                      {order.openEnded ? (
                        <div className="space-y-1.5">
                          {order.dailyPrice > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Dagspris</span>
                              <span className="font-medium">{formatCurrency(order.dailyPrice)}/dag</span>
                            </div>
                          )}
                          {order.weeklyPrice > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Veckopris</span>
                              <span className="font-medium">{formatCurrency(order.weeklyPrice)}/vecka</span>
                            </div>
                          )}
                          {order.monthlyPrice > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Månadspris</span>
                              <span className="font-medium">{formatCurrency(order.monthlyPrice)}/mån</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm pt-1 border-t border-slate-100">
                            <span className="text-slate-400 italic text-[12px]">Beräknas vid retur</span>
                          </div>
                        </div>
                      ) : breakdown ? (
                        <div className="space-y-1.5">
                          {breakdown.months > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{breakdown.months} mån à {formatCurrency(order.monthlyPrice)}</span>
                              <span className="font-medium">{formatCurrency(breakdown.months * order.monthlyPrice)}</span>
                            </div>
                          )}
                          {breakdown.weeks > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{breakdown.weeks} v à {formatCurrency(order.weeklyPrice)}</span>
                              <span className="font-medium">{formatCurrency(breakdown.weeks * order.weeklyPrice)}</span>
                            </div>
                          )}
                          {breakdown.days > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{breakdown.days} dagar à {formatCurrency(order.dailyPrice)}</span>
                              <span className="font-medium">{formatCurrency(breakdown.days * order.dailyPrice)}</span>
                            </div>
                          )}
                          {rentalDisc > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-600">Rabatt -{rentalDisc}%</span>
                              <span className="text-emerald-600 font-medium">-{formatCurrency(rentalGross - rentalNet)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-100">
                            <span className="text-slate-700">Hyra totalt</span>
                            <span>{formatCurrency(rentalNet)}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Insurance */}
                    {(order.insuranceCost ?? 0) > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Försäkring</p>
                        <div className="space-y-1.5">
                          {order.insuranceMonthlyRate ? (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">{insuranceMonths} mån à {formatCurrency(order.insuranceMonthlyRate)}</span>
                              <span className="font-medium">{formatCurrency(insuranceMonths * order.insuranceMonthlyRate)}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Försäkring</span>
                              <span className="font-medium">{formatCurrency(order.insuranceCost!)}</span>
                            </div>
                          )}
                          {insDisc > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-600">Rabatt -{insDisc}%</span>
                              <span className="text-emerald-600 font-medium">-{formatCurrency((order.insuranceCost ?? 0) * insDisc / 100)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-100">
                            <span className="text-slate-700">Försäkring totalt</span>
                            <span>{formatCurrency((order.insuranceCost ?? 0) * (1 - insDisc / 100))}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Articles */}
                    {(order.orderArticles ?? []).length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Artiklar</p>
                        <div className="space-y-1.5">
                          {(order.orderArticles ?? []).map((row, i) => {
                            const art = articles.find((a) => a.id === row.articleId);
                            const d = row.discountPercent ?? 0;
                            const lineTotal = row.quantity * row.unitPrice * (1 - d / 100);
                            return (
                              <div key={i} className="flex justify-between text-sm gap-2">
                                <span className="text-slate-500 min-w-0">
                                  <span className="font-medium text-slate-700">{row.description ?? art?.name ?? 'Artikel'}</span>
                                  <span className="ml-1 text-[12px] text-slate-400">{row.quantity} × {formatCurrency(row.unitPrice)}</span>
                                  {d > 0 && <span className="ml-1 text-[11px] font-medium text-emerald-600">-{d}%</span>}
                                </span>
                                <span className="font-medium shrink-0">{formatCurrency(lineTotal)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="font-semibold text-slate-800">Totalt</span>
                      <span className="font-bold text-blue-600 text-lg">{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

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
