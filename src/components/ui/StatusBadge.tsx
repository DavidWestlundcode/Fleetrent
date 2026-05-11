import type { MachineStatus, OrderStatus } from '@/lib/types';
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types';

export function MachineStatusBadge({ status }: { status: MachineStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
