import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit: 100 req/min per IP
  if (!rateLimit(`webhook:${getClientIp(request)}`, 100, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Verify webhook secret if configured
  const webhookSecret = process.env.ZIGNED_WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = request.headers.get('authorization') ?? '';
    const signature = request.headers.get('x-zigned-signature') ?? '';
    const provided = authHeader.replace('Bearer ', '') || signature;
    if (provided !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const event = body?.event ?? body?.type;
    const agreementId = body?.data?.id ?? body?.agreement_id;

    if (!agreementId) return NextResponse.json({ ok: true });

    const admin = createAdminClient();

    if (
      event === 'agreement.lifecycle.fulfilled' ||
      event === 'agreement.lifecycle.finalized' ||
      event?.includes('fulfilled') ||
      event?.includes('finalized')
    ) {
      await admin.from('orders')
        .update({ signing_status: 'signed' })
        .eq('zigned_agreement_id', agreementId);
    }

    if (event === 'agreement.lifecycle.cancelled' || event?.includes('cancelled')) {
      await admin.from('orders')
        .update({ signing_status: 'cancelled' })
        .eq('zigned_agreement_id', agreementId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
