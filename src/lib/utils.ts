import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(plannedReturnDate: string, status: string): boolean {
  if (status !== 'aktiv') return false;
  return new Date(plannedReturnDate) < new Date();
}

export function daysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function calcBreakdown(days: number, daily: number, weekly: number, monthly: number) {
  let rem = days;
  const months = monthly > 0 ? Math.floor(rem / 30) : 0;
  if (monthly > 0) rem %= 30;
  const weeks = weekly > 0 ? Math.floor(rem / 7) : 0;
  if (weekly > 0) rem %= 7;
  const remainingDays = rem;
  return {
    months,
    weeks,
    days: remainingDays,
    total: months * monthly + weeks * weekly + remainingDays * daily,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `FR-${year}${month}-${random}`;
}

export function calculateOccupancyRate(totalRentalDays: number, machineAge: number): number {
  const totalPossibleDays = machineAge * 365;
  if (totalPossibleDays === 0) return 0;
  return Math.min(100, Math.round((totalRentalDays / totalPossibleDays) * 100));
}

export function calculateROI(totalRevenue: number, totalCosts: number): number {
  if (totalCosts === 0) return 0;
  return Math.round(((totalRevenue - totalCosts) / totalCosts) * 100);
}

export function calculateRecoveryPercent(totalRevenue: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0;
  return Math.min(100, Math.round((totalRevenue / purchasePrice) * 100));
}

export function getMatchingTemplate<T extends { category: string; capacityMin: number; capacityMax: number }>(
  machine: { category: string; capacity: number },
  templates: T[]
): T | undefined {
  return templates.find((t) => {
    if (t.category !== machine.category) return false;
    const minOk = t.capacityMin === 0 || machine.capacity >= t.capacityMin;
    const maxOk = t.capacityMax === 0 || machine.capacity <= t.capacityMax;
    return minOk && maxOk;
  });
}

export function getMonthlyRevenueData(orders: { startDate: string; totalPrice: number; status: string }[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = 0;
  }
  orders.forEach((order) => {
    if (order.status === 'avslutad' || order.status === 'aktiv') {
      const d = new Date(order.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in months) {
        months[key] += order.totalPrice;
      }
    }
  });
  return Object.entries(months).map(([month, revenue]) => ({
    month: month.substring(5) + '/' + month.substring(2, 4),
    revenue,
  }));
}
