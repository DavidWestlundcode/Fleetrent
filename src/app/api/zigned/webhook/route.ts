import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body?.event ?? body?.type;
    const agreementId = body?.data?.id ?? body?.agreement_id;

    if (!agreementId) return NextResponse.json({ ok: true });

    const admin = createAdminClient();

    if (event === 'agreement.lifecycle.finalized' || event?.includes('finalized')) {
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
