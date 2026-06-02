import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

const ZIGNED_API = 'https://api.zigned.se/rest/v3';

async function getZignedToken(): Promise<string | null> {
  const clientId = process.env.ZIGNED_CLIENT_ID;
  const clientSecret = process.env.ZIGNED_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch('https://api.zigned.se/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId saknas' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    const admin = createAdminClient();
    const { data: orderRow } = await admin
      .from('orders')
      .select('zigned_agreement_id, organization_id')
      .eq('id', orderId)
      .single();

    if (!orderRow?.zigned_agreement_id) {
      return NextResponse.json({ error: 'Inget Zigned-avtal kopplat till denna order' }, { status: 400 });
    }

    const token = await getZignedToken();
    if (!token) return NextResponse.json({ error: 'Zigned inte ansluten' }, { status: 400 });

    const res = await fetch(`${ZIGNED_API}/agreements/${orderRow.zigned_agreement_id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Kunde inte hämta avtalsstatus från Zigned' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any;
    const status = data?.data?.lifecycle_state?.status ?? data?.data?.status;

    let signingStatus: string | null = null;
    if (status === 'fulfilled' || status === 'finalized') signingStatus = 'signed';
    else if (status === 'cancelled' || status === 'expired') signingStatus = 'cancelled';
    else if (status === 'pending' || status === 'open') signingStatus = 'pending';

    if (signingStatus) {
      await admin.from('orders')
        .update({ signing_status: signingStatus })
        .eq('id', orderId);
    }

    return NextResponse.json({ status, signingStatus });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
