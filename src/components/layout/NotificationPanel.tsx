'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, AlertTriangle, Clock, Calendar, Wrench, AlertCircle, FileCheck } from 'lucide-react';
import { useStore } from '@/store';
import { getDismissed, dismissNotification, pruneDismissed } from '@/lib/notificationDismissals';
import { needsPartialInvoice, daysSinceLastInvoice } from '@/lib/utils';

type NotifType = 'error' | 'warning' | 'info' | 'success';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  desc: string;
  href: string;
}

const icons: Record<NotifType, React.ReactNode> = {
  error:   <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
  info:    <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
  success: <FileCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
};

const colors: Record<NotifType, string> = {
  error:   'border-l-red-400 bg-red-50/60',
  warning: 'border-l-amber-400 bg-amber-50/60',
  info:    'border-l-blue-400 bg-blue-50/60',
  success: 'border-l-emerald-400 bg-emerald-50/60',
};

function computeNotifications(
  orders: ReturnType<typeof useStore.getState>['orders'],
  machines: ReturnType<typeof useStore.getState>['machines'],
  customers: ReturnType<typeof useStore.getState>['customers']
): Notification[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in3days = new Date(today);
  in3days.setDate(in3days.getDate() + 3);

  const notifs: Notification[] = [];

  orders.forEach((o) => {
    const customer = customers.find((c) => c.id === o.customerId);
    const machine = machines.find((m) => m.id === o.machineId);
    const label = machine?.name ?? 'Okänd maskin';
    const customerName = customer?.companyName ?? '';

    // Försenade returer
    if (o.status === 'aktiv' && o.plannedReturnDate) {
      const ret = new Date(o.plannedReturnDate);
      ret.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - ret.getTime()) / 86400000);
      if (diffDays > 0) {
        notifs.push({
          id: `overdue-${o.id}`,
          type: 'error',
          title: `Försenad retur — ${label}`,
          desc: `${diffDays} dag${diffDays > 1 ? 'ar' : ''} försenad${customerName ? ` · ${customerName}` : ''}`,
          href: `/orders/${o.id}`,
        });
        return;
      }
      // Retur idag
      if (diffDays === 0) {
        notifs.push({
          id: `today-${o.id}`,
          type: 'warning',
          title: `Retur idag — ${label}`,
          desc: `Ska lämnas tillbaka idag${customerName ? ` · ${customerName}` : ''}`,
          href: `/orders/${o.id}`,
        });
        return;
      }
      // Retur imorgon
      const retTomorrow = new Date(tomorrow);
      if (ret.getTime() === retTomorrow.getTime()) {
        notifs.push({
          id: `tomorrow-${o.id}`,
          type: 'info',
          title: `Retur imorgon — ${label}`,
          desc: `Planerad retur imorgon${customerName ? ` · ${customerName}` : ''}`,
          href: `/orders/${o.id}`,
        });
        return;
      }
      // Retur inom 3 dagar
      if (ret <= in3days) {
        const days = Math.round((ret.getTime() - today.getTime()) / 86400000);
        notifs.push({
          id: `soon-${o.id}`,
          type: 'info',
          title: `Retur om ${days} dagar — ${label}`,
          desc: `Planerad retur ${o.plannedReturnDate}${customerName ? ` · ${customerName}` : ''}`,
          href: `/orders/${o.id}`,
        });
      }
    }

    // Reservation startar idag
    if (o.status === 'reserverad' && o.startDate) {
      const start = new Date(o.startDate);
      start.setHours(0, 0, 0, 0);
      const diffDays = Math.round((start.getTime() - today.getTime()) / 86400000);
      if (diffDays === 0) {
        notifs.push({
          id: `res-today-${o.id}`,
          type: 'info',
          title: `Reservation startar idag — ${label}`,
          desc: customerName ? `Kund: ${customerName}` : `Order ${o.orderNumber}`,
          href: `/orders/${o.id}`,
        });
      } else if (diffDays === 1) {
        notifs.push({
          id: `res-tomorrow-${o.id}`,
          type: 'info',
          title: `Reservation startar imorgon — ${label}`,
          desc: customerName ? `Kund: ${customerName}` : `Order ${o.orderNumber}`,
          href: `/orders/${o.id}`,
        });
      }
    }

    // Klar för fakturering
    if (o.status === 'klar_for_fakturering' && !o.sentToAccounting) {
      notifs.push({
        id: `invoice-${o.id}`,
        type: 'success',
        title: `Klar för fakturering — ${o.orderNumber}`,
        desc: `${label}${customerName ? ` · ${customerName}` : ''}`,
        href: `/orders/${o.id}`,
      });
    }

    // 30+ dagar utan delfaktura (kortsiktiga ordrar — avtalshyra sköts av cronjobbet)
    if (needsPartialInvoice(o)) {
      const days = daysSinceLastInvoice(o);
      notifs.push({
        id: `partial-invoice-${o.id}`,
        type: 'warning',
        title: `${days} dagar sedan senaste fakturering — ${o.orderNumber}`,
        desc: `${label}${customerName ? ` · ${customerName}` : ''}`,
        href: `/orders/${o.id}`,
      });
    }
  });

  // Maskiner på service
  machines
    .filter((m) => m.status === 'service')
    .forEach((m) => {
      notifs.push({
        id: `service-${m.id}`,
        type: 'warning',
        title: `På service — ${m.name}`,
        desc: m.location ? `Plats: ${m.location}` : 'Ingen plats angiven',
        href: `/machines/${m.id}`,
      });
    });

  // Skadade maskiner
  machines
    .filter((m) => m.status === 'skadad')
    .forEach((m) => {
      notifs.push({
        id: `damaged-${m.id}`,
        type: 'error',
        title: `Skadad maskin — ${m.name}`,
        desc: m.location ? `Plats: ${m.location}` : 'Ingen plats angiven',
        href: `/machines/${m.id}`,
      });
    });

  // Sort: error → warning → info → success
  const order: Record<NotifType, number> = { error: 0, warning: 1, info: 2, success: 3 };
  return notifs.sort((a, b) => order[a.type] - order[b.type]);
}

export function useNotifications() {
  const { orders, machines, customers } = useStore();
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  useEffect(() => { setDismissed(getDismissed()); }, []);

  const all = computeNotifications(orders, machines, customers);

  useEffect(() => {
    pruneDismissed(new Set(all.map((n) => n.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.map((n) => n.id).join(',')]);

  const notifications = all.filter((n) => !dismissed.has(n.id));

  const dismiss = (id: string) => {
    dismissNotification(id);
    setDismissed((prev) => new Set(prev).add(id));
  };

  return { notifications, dismiss };
}

interface Props {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export default function NotificationPanel({ notifications, onDismiss, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-[13px] font-semibold text-slate-900">Notiser</p>
          {notifications.length > 0 && (
            <p className="text-[11px] text-slate-400">{notifications.length} aktiva</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[13px] font-medium text-slate-700">Allt ser bra ut</p>
            <p className="text-[12px] text-slate-400 mt-1">Inga aktiva notiser just nu</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-[3px] transition-colors hover:brightness-95 ${colors[n.type]}`}
              >
                <Link href={n.href} onClick={onClose} className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer">
                  {icons[n.type]}
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-800 leading-snug">{n.title}</p>
                    <p className="text-[11.5px] text-slate-500 mt-0.5 truncate">{n.desc}</p>
                  </div>
                </Link>
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                  title="Markera som läst"
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
