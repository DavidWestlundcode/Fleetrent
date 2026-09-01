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

// Date-aware version of calcBreakdown for pricing an actual rental span. Whether a full month/week
// was rented is decided on the calendar span (30/7 calendar days, same fixed convention calcBreakdown
// already uses) — NOT on the weekend-excluded day count — so a calendar month always reaches the
// monthly tier even though it only contains ~20 business days. Only the leftover tail (the days after
// the last full month/week) is priced using actual billable days, respecting chargeWeekends, matching
// how the daily rate has always been meant to apply to that remainder.
export function calcRentalBreakdown(
  startDate: string, endDate: string, chargeWeekends: boolean,
  daily: number, weekly: number, monthly: number
) {
  const calendarDays = daysBetween(startDate, endDate);
  let rem = calendarDays;
  const months = monthly > 0 ? Math.floor(rem / 30) : 0;
  if (monthly > 0) rem %= 30;
  const weeks = weekly > 0 ? Math.floor(rem / 7) : 0;
  if (weekly > 0) rem %= 7;

  let days: number;
  if (rem <= 0) {
    days = 0;
  } else if (chargeWeekends) {
    days = rem;
  } else {
    const tailStart = new Date(endDate);
    tailStart.setDate(tailStart.getDate() - rem);
    days = countBusinessDays(isoDate(tailStart), endDate);
  }

  return {
    months,
    weeks,
    days,
    total: months * monthly + weeks * weekly + days * daily,
  };
}

// Applies each price tier's own discount % to its own portion of a breakdown, rather than one
// blended discount to the total — a rental billed mostly by month with a 40% monthly discount
// but 0% daily discount needs the 40% applied only to the monthly portion.
export function calcDiscountedTotal(
  breakdown: { months: number; weeks: number; days: number },
  daily: number, weekly: number, monthly: number,
  dailyDiscount = 0, weeklyDiscount = 0, monthlyDiscount = 0
): number {
  return (
    breakdown.months * monthly * (1 - monthlyDiscount / 100) +
    breakdown.weeks * weekly * (1 - weeklyDiscount / 100) +
    breakdown.days * daily * (1 - dailyDiscount / 100)
  );
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

type RevenueOrder = {
  status: string;
  totalPrice: number;
  startDate: string;
  actualReturnDate?: string;
  invoicePeriods?: { amount: number; endDate: string }[];
};

// Reconstructs *realized* (booked) revenue as dated events — mirrors exactly how the store books
// machine.totalRevenue: each delfaktura books its amount on its period end date, and the remaining
// balance books on the order's actual return date once the machine is returned. Active orders with
// no invoicing yet, and cancelled orders, contribute nothing — matching accounting-accurate revenue
// rather than pipeline/projected revenue.
export function getRealizedRevenueEvents(orders: RevenueOrder[]): { date: string; amount: number }[] {
  const events: { date: string; amount: number }[] = [];
  orders.forEach((order) => {
    if (order.status === 'annullerad') return;
    const periods = order.invoicePeriods ?? [];
    let invoiced = 0;
    periods.forEach((p) => {
      events.push({ date: p.endDate, amount: p.amount });
      invoiced += p.amount;
    });
    if (order.status === 'avslutad' || order.status === 'klar_for_fakturering') {
      const remaining = Math.max(0, order.totalPrice - invoiced);
      if (remaining > 0 && order.actualReturnDate) {
        events.push({ date: order.actualReturnDate, amount: remaining });
      }
    }
  });
  return events;
}

type StatsOrder = {
  status: string;
  totalPrice: number;
  startDate: string;
  actualReturnDate?: string;
  machineId: string;
  customerId: string;
  invoicePeriods?: { id: string; amount: number; days: number }[];
  machineSwaps?: { fromMachineId: string; invoicePeriodId?: string }[];
};

// Computed live from orders/invoicePeriods instead of a stored running counter, so it's always
// correct regardless of which code path created a given delfaktura (manual "Ny delfaktura", the
// avtalshyra cron, or a Fortnox send) — there's no separate counter that a code path can forget
// to update. "Realized" = invoiced periods, plus the remaining un-invoiced balance once an order
// actually closes (avslutad/klar_for_fakturering) — matches getRealizedRevenueEvents above.
export function getMachineStats(orders: StatsOrder[], machineId: string) {
  let totalRevenue = 0;
  let totalRentalDays = 0;
  let totalRentals = 0;

  for (const order of orders) {
    if (order.status === 'annullerad') continue;
    const periods = order.invoicePeriods ?? [];
    const swaps = order.machineSwaps ?? [];
    let invoicedAmount = 0;
    let invoicedDays = 0;

    for (const p of periods) {
      invoicedAmount += p.amount;
      invoicedDays += p.days;
      // A period referenced by a swap's invoicePeriodId billed the OUTGOING machine's usage.
      const swap = swaps.find((s) => s.invoicePeriodId === p.id);
      const periodMachineId = swap ? swap.fromMachineId : order.machineId;
      if (periodMachineId === machineId) {
        totalRevenue += p.amount;
        totalRentalDays += p.days;
      }
    }

    const isClosed = order.status === 'avslutad' || order.status === 'klar_for_fakturering';
    if (order.machineId === machineId && isClosed) {
      totalRevenue += Math.max(0, order.totalPrice - invoicedAmount);
      if (order.actualReturnDate) {
        const totalDays = Math.max(1, Math.round(
          (new Date(order.actualReturnDate).getTime() - new Date(order.startDate).getTime()) / 86400000
        ));
        totalRentalDays += Math.max(0, totalDays - invoicedDays);
      }
    }

    if (order.machineId === machineId && order.status !== 'reserverad') totalRentals += 1;
    if (swaps.some((s) => s.fromMachineId === machineId)) totalRentals += 1;
  }

  return { totalRevenue, totalRentalDays, totalRentals };
}

export function getCustomerTotalSpent(orders: StatsOrder[], customerId: string): number {
  let total = 0;
  for (const order of orders) {
    if (order.status === 'annullerad' || order.customerId !== customerId) continue;
    const periods = order.invoicePeriods ?? [];
    const invoicedAmount = periods.reduce((s, p) => s + p.amount, 0);
    total += invoicedAmount;
    if (order.status === 'avslutad' || order.status === 'klar_for_fakturering') {
      total += Math.max(0, order.totalPrice - invoicedAmount);
    }
  }
  return total;
}

export function getMonthlyRevenueData(orders: RevenueOrder[]) {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = 0;
  }
  getRealizedRevenueEvents(orders).forEach(({ date, amount }) => {
    const d = new Date(date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in months) months[key] += amount;
  });
  return Object.entries(months).map(([month, revenue]) => ({
    month: month.substring(5) + '/' + month.substring(2, 4),
    revenue,
  }));
}

const MONTH_NAMES_SV = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

// Month-by-month realized revenue for a given calendar year, alongside the same months the year
// before — lets you compare e.g. August this year directly against August last year.
export function getYearlyRevenueComparison(orders: RevenueOrder[], year: number) {
  const current = new Array(12).fill(0);
  const previous = new Array(12).fill(0);

  getRealizedRevenueEvents(orders).forEach(({ date, amount }) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = d.getMonth();
    if (y === year) current[m] += amount;
    else if (y === year - 1) previous[m] += amount;
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

// Total realized revenue split by calendar year — e.g. { 2025: 120000, 2026: 45000 }.
export function getRealizedRevenueByYear(orders: RevenueOrder[]): Record<number, number> {
  const byYear: Record<number, number> = {};
  getRealizedRevenueEvents(orders).forEach(({ date, amount }) => {
    const y = new Date(date).getFullYear();
    byYear[y] = (byYear[y] ?? 0) + amount;
  });
  return byYear;
}
