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
      .select('zigned_agreement_id')
      .eq('id', orderId)
      .single();

    if (!orderRow?.zigned_agreement_id) {
      return NextResponse.json({ error: 'Inget Zigned-avtal kopplat' }, { status: 400 });
    }

    const token = await getZignedToken();
    if (!token) return NextResponse.json({ error: 'Zigned inte ansluten' }, { status: 400 });

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Fetch agreement to get document file ID
    const agreementRes = await fetch(`${ZIGNED_API}/agreements/${orderRow.zigned_agreement_id}`, { headers });
    if (!agreementRes.ok) return NextResponse.json({ error: 'Kunde inte hämta avtal från Zigned' }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agreement = await agreementRes.json() as any;
    const fileId = agreement?.data?.documents?.main?.file_id
      ?? agreement?.data?.document?.file_id
      ?? agreement?.data?.documents?.[0]?.file_id;

    if (!fileId) {
      return NextResponse.json({ error: 'Signerat dokument inte tillgängligt än' }, { status: 404 });
    }

    // Fetch file download URL
    const fileRes = await fetch(`${ZIGNED_API}/files/${fileId}`, { headers });
    if (!fileRes.ok) return NextResponse.json({ error: 'Kunde inte hämta fil från Zigned' }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileData = await fileRes.json() as any;
    const downloadUrl = fileData?.data?.url ?? fileData?.data?.download_url ?? fileData?.url;

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Nedladdningslänk saknas' }, { status: 404 });
    }

    return NextResponse.json({ downloadUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
