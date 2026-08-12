import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateContractInvoices } from '@/lib/contract-invoicing';

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

  try {
    const { generated, skipped, errors } = await generateContractInvoices(admin, todayStr);
    console.log(`[contract-invoices] Done — generated: ${generated}, skipped: ${skipped}, errors: ${errors.length}`);
    return NextResponse.json({ ok: true, generated, skipped, errors });
  } catch (e) {
    console.error('[contract-invoices] Failed:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
