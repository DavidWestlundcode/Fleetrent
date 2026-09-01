import { calcRentalBreakdown, calcDiscountedTotal, countBusinessDays, daysBetween } from '@/lib/utils';
import type { InvoicePeriod } from '@/lib/types';
import type { createAdminClient } from '@/lib/supabase/admin';

export type ContractInvoiceResult = {
  generated: number;
  skipped: number;
  errors: string[];
  updatedOrders: { id: string; invoicePeriods: InvoicePeriod[] }[];
};

// Shared by the monthly cron and the manual "Generera nu" trigger. Generates one pending
// delfaktura per active avtalshyra-order, from the last invoiced day up to `asOfDate`.
export async function generateContractInvoices(
  admin: ReturnType<typeof createAdminClient>,
  asOfDate: string,
  organizationId?: string,
): Promise<ContractInvoiceResult> {
  let query = admin
    .from('orders')
    .select('id, start_date, actual_return_date, status, daily_price, weekly_price, monthly_price, charge_weekends, rental_discount, weekly_discount, monthly_discount, invoice_periods, order_number')
    .eq('is_long_term', true)
    .in('status', ['aktiv', 'klar_for_fakturering']);

  if (organizationId) query = query.eq('organization_id', organizationId);

  const { data: orders, error } = await query;
  if (error) throw new Error(error.message);

  let generated = 0;
  let skipped = 0;
  const errors: string[] = [];
  const updatedOrders: { id: string; invoicePeriods: InvoicePeriod[] }[] = [];

  for (const order of orders ?? []) {
    try {
      const periods = (order.invoice_periods as InvoicePeriod[]) ?? [];
      const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const lastEnd = sorted.length > 0 ? sorted[sorted.length - 1].endDate : null;
      const nextStart = lastEnd
        ? new Date(new Date(lastEnd).getTime() + 86400000).toISOString().split('T')[0]
        : (order.start_date as string);
      const effectiveEnd = (order.actual_return_date as string | null) || asOfDate;

      if (nextStart > effectiveEnd) { skipped++; continue; }

      const chargeWeekends = (order.charge_weekends as boolean) ?? false;
      const days = chargeWeekends
        ? daysBetween(nextStart, effectiveEnd)
        : countBusinessDays(nextStart, effectiveEnd);

      if (days <= 0) { skipped++; continue; }

      const breakdown = calcRentalBreakdown(
        nextStart,
        effectiveEnd,
        chargeWeekends,
        order.daily_price as number,
        order.weekly_price as number,
        order.monthly_price as number,
      );
      const amount = calcDiscountedTotal(
        breakdown,
        order.daily_price as number, order.weekly_price as number, order.monthly_price as number,
        (order.rental_discount as number) ?? 0, (order.weekly_discount as number) ?? 0, (order.monthly_discount as number) ?? 0
      );

      const newPeriod: InvoicePeriod = {
        id: crypto.randomUUID(),
        startDate: nextStart,
        endDate: effectiveEnd,
        days,
        amount,
        sentToAccounting: false,
        createdAt: new Date().toISOString(),
      };

      const newPeriods = [...periods, newPeriod];
      const { error: updateError } = await admin
        .from('orders')
        .update({ invoice_periods: newPeriods })
        .eq('id', order.id);

      if (updateError) {
        errors.push(`${order.order_number}: ${updateError.message}`);
      } else {
        generated++;
        updatedOrders.push({ id: order.id as string, invoicePeriods: newPeriods });
      }
    } catch (e) {
      errors.push(`${order.order_number}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { generated, skipped, errors, updatedOrders };
}
