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

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();
    if (!profile?.organization_id) return NextResponse.json({ error: 'Ingen organisation' }, { status: 403 });

    const admin = createAdminClient();

    // Verify order belongs to user's organization
    const { data: orderRow } = await admin
      .from('orders')
      .select('zigned_agreement_id')
      .eq('id', orderId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!orderRow) return NextResponse.json({ error: 'Order hittades inte' }, { status: 404 });
    if (!orderRow.zigned_agreement_id) {
      return NextResponse.json({ error: 'Inget Zigned-avtal kopplat' }, { status: 400 });
    }

    const token = await getZignedToken();
    if (!token) return NextResponse.json({ error: 'Zigned inte ansluten' }, { status: 400 });

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const agreementRes = await fetch(`${ZIGNED_API}/agreements/${orderRow.zigned_agreement_id}`, { headers });
    if (!agreementRes.ok) return NextResponse.json({ error: 'Kunde inte hämta avtal' }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agreement = await agreementRes.json() as any;
    const downloadUrl = agreement?.data?.documents?.signed_document?.data?.url;

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Signerat dokument inte tillgängligt än' }, { status: 404 });
    }

    return NextResponse.json({ downloadUrl });
  } catch {
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 });
  }
}
