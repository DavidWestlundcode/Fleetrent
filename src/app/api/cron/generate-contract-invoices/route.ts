import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calcBreakdown, countBusinessDays, daysBetween } from '@/lib/utils';
import type { InvoicePeriod } from '@/lib/types';

export const maxDuration = 120;

function isLastDayOfMonth(d: Date): boolean {
  const next = new Date(d);
  next.setDate(d.getDate() + 1);
  return next.getMonth() !== d.getMonth();
}

// Cron-triggered — Vercel sends Authorization: Bearer <CRON_SECRET>. Runs daily but only
// generates delfakturor when triggered on the last calendar day of the month.
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization') ?? '';
  const secret = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const forceRun = request.nextUrl.searchParams.get('force') === '1';
  if (!forceRun && !isLastDayOfMonth(now)) {
    return NextResponse.json({ ok: true, skipped: 'not last day of month' });
  }

  const todayStr = now.toISOString().split('T')[0];
  const admin = createAdminClient();

  const { data: orders, error } = await admin
    .from('orders')
    .select('id, start_date, actual_return_date, status, daily_price, weekly_price, monthly_price, charge_weekends, rental_discount, invoice_periods, order_number')
    .eq('is_long_term', true)
    .in('status', ['aktiv', 'klar_for_fakturering']);

  if (error) {
    console.error('[contract-invoices] Failed to fetch orders:', error.message);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  let generated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const order of orders ?? []) {
    try {
      const periods = (order.invoice_periods as InvoicePeriod[]) ?? [];
      const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const lastEnd = sorted.length > 0 ? sorted[sorted.length - 1].endDate : null;
      const nextStart = lastEnd
        ? new Date(new Date(lastEnd).getTime() + 86400000).toISOString().split('T')[0]
        : (order.start_date as string);
      const effectiveEnd = (order.actual_return_date as string | null) || todayStr;

      if (nextStart > effectiveEnd) { skipped++; continue; }

      const chargeWeekends = (order.charge_weekends as boolean) ?? false;
      const days = chargeWeekends
        ? daysBetween(nextStart, effectiveEnd)
        : countBusinessDays(nextStart, effectiveEnd);

      if (days <= 0) { skipped++; continue; }

      const breakdown = calcBreakdown(
        days,
        order.daily_price as number,
        order.weekly_price as number,
        order.monthly_price as number,
      );
      const rentalDiscount = (order.rental_discount as number) ?? 0;
      const amount = breakdown.total * (1 - rentalDiscount / 100);

      const newPeriod: InvoicePeriod = {
        id: crypto.randomUUID(),
        startDate: nextStart,
        endDate: effectiveEnd,
        days,
        amount,
        sentToAccounting: false,
        createdAt: new Date().toISOString(),
      };

      const { error: updateError } = await admin
        .from('orders')
        .update({ invoice_periods: [...periods, newPeriod] })
        .eq('id', order.id);

      if (updateError) {
        errors.push(`${order.order_number}: ${updateError.message}`);
      } else {
        generated++;
      }
    } catch (e) {
      errors.push(`${order.order_number}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(`[contract-invoices] Done — generated: ${generated}, skipped: ${skipped}, errors: ${errors.length}`);
  return NextResponse.json({ ok: true, generated, skipped, errors });
}
