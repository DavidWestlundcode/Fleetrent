import { Repeat } from 'lucide-react';
import type { MachineStatus, OrderStatus } from '@/lib/types';
import { STATUS_LABELS, ORDER_STATUS_LABELS } from '@/lib/types';

const MACHINE_BADGE: Record<MachineStatus, { bg: string; dot: string }> = {
  i_lager:   { bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80', dot: 'bg-emerald-500' },
  uthyrd:    { bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',          dot: 'bg-blue-500' },
  reserverad:{ bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',       dot: 'bg-amber-400' },
  service:   { bg: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/80',    dot: 'bg-orange-500' },
  skadad:    { bg: 'bg-red-50 text-red-700 ring-1 ring-red-200/80',             dot: 'bg-red-500' },
  utfasad:   { bg: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/80',      dot: 'bg-slate-400' },
};

const ORDER_BADGE: Record<OrderStatus, { bg: string; dot: string }> = {
  aktiv:      { bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80',       dot: 'bg-blue-500' },
  reserverad: { bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80',    dot: 'bg-amber-400' },
  forsenad:   { bg: 'bg-red-50 text-red-700 ring-1 ring-red-200/80',          dot: 'bg-red-500' },
  klar_for_fakturering: { bg: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80', dot: 'bg-violet-500' },
  avslutad:   { bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80', dot: 'bg-emerald-500' },
  annullerad: { bg: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/80',   dot: 'bg-slate-400' },
};

export function MachineStatusBadge({ status }: { status: MachineStatus }) {
  const s = MACHINE_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function LongTermBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80 ${className}`}>
      <Repeat className="w-3 h-3 shrink-0" />
      Avtalshyra
    </span>
  );
}
