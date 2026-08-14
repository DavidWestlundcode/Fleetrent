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

function getEasterSunday(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function getSwedishHolidays(year: number): Set<string> {
  const easter = getEasterSunday(year);
  const add = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const s = new Set<string>();

  // Fixed
  s.add(`${year}-01-01`); s.add(`${year}-01-06`);
  s.add(`${year}-05-01`); s.add(`${year}-06-06`);
  s.add(`${year}-12-24`); s.add(`${year}-12-25`);
  s.add(`${year}-12-26`); s.add(`${year}-12-31`);

  // Midsommarafton — fredag 19-25 juni
  const mid = new Date(year, 5, 19);
  while (mid.getDay() !== 5) mid.setDate(mid.getDate() + 1);
  s.add(isoDate(mid)); s.add(isoDate(add(mid, 1)));

  // Alla helgons dag — lördag 31 okt–6 nov
  const allS = new Date(year, 9, 31);
  while (allS.getDay() !== 6) allS.setDate(allS.getDate() + 1);
  s.add(isoDate(allS));

  // Easter-based
  s.add(isoDate(add(easter, -2)));  // Långfredag
  s.add(isoDate(easter));           // Påskdagen
  s.add(isoDate(add(easter, 1)));   // Annandag påsk
  s.add(isoDate(add(easter, 39)));  // Kristi himmelsfärdsdag
  s.add(isoDate(add(easter, 49)));  // Pingstdagen

  return s;
}

export function countBusinessDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const holidays = new Set<string>();
  for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
    getSwedishHolidays(y).forEach((h) => holidays.add(h));
  }
  let count = 0;
  const cur = new Date(startDate);
  while (cur < endDate) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6 && !holidays.has(isoDate(cur))) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(1, count);
}

export function generateId(): string {
  return crypto.randomUUID();
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

const MONTH_NAMES_SV = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

// Month-by-month revenue for a given calendar year, alongside the same months the year before —
// lets you compare e.g. August this year directly against August last year.
export function getYearlyRevenueComparison(
  orders: { startDate: string; totalPrice: number; status: string }[],
  year: number,
) {
  const current = new Array(12).fill(0);
  const previous = new Array(12).fill(0);

  orders.forEach((order) => {
    if (order.status !== 'avslutad' && order.status !== 'aktiv') return;
    const d = new Date(order.startDate);
    const y = d.getFullYear();
    const m = d.getMonth();
    if (y === year) current[m] += order.totalPrice;
    else if (y === year - 1) previous[m] += order.totalPrice;
  });

  return MONTH_NAMES_SV.map((month, i) => ({ month, current: current[i], previous: previous[i] }));
}

// Earliest and latest year with any order activity, plus the current year — used to bound year navigation.
export function getOrderYearRange(orders: { startDate: string }[]): { min: number; max: number } {
  const currentYear = new Date().getFullYear();
  if (orders.length === 0) return { min: currentYear, max: currentYear };
  const years = orders.map((o) => new Date(o.startDate).getFullYear());
  return { min: Math.min(...years, currentYear), max: Math.max(...years, currentYear) };
}
