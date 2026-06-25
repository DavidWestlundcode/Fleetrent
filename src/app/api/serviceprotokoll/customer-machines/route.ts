import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SP_API = 'https://app.serviceprotokoll.se/api/v1';

async function getSPToken(integrationKey: string): Promise<string | null> {
  const reqBody = JSON.stringify({ IntegrationKey: integrationKey });
  const reqHeaders = { 'Content-Type': 'application/json' };

  async function doPost(url: string) {
    return fetch(url, { method: 'POST', headers: reqHeaders, body: reqBody, redirect: 'manual' });
  }

  let res = await doPost(`${SP_API}/Auth/GetToken`);
  if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
    const location = res.headers.get('location');
    if (!location) return null;
    res = await doPost(location);
  }
  if (!res.ok) return null;
  const data = await res.json();
  return data.Token ?? null;
}

export async function GET(request: NextRequest) {
  const customerNo = request.nextUrl.searchParams.get('customerNo');
  if (!customerNo) {
    return NextResponse.json({ error: 'customerNo krävs' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  const orgId = profile?.organization_id;
  if (!orgId) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });

  const admin = createAdminClient();
  const { data: orgRow } = await admin.from('organizations').select('sp_integration_key').eq('id', orgId).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const integrationKey = (orgRow as any)?.sp_integration_key as string | null;
  if (!integrationKey) {
    return NextResponse.json({ machines: [] });
  }

  const token = await getSPToken(integrationKey);
  if (!token) return NextResponse.json({ error: 'Kunde inte autentisera mot Serviceprotokoll' }, { status: 400 });

  const results = [];
  let skip = 0;
  const take = 100;
  while (true) {
    const res = await fetch(
      `${SP_API}/ServiceObject/Get?request.skip=${skip}&request.take=${take}&request.customerNo=${encodeURIComponent(customerNo)}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) break;
    const data = await res.json();
    const items = data.Result ?? [];
    results.push(...items);
    if (items.length < take) break;
    skip += take;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const machines = results.map((obj: any) => ({
    spId: String(obj.Id ?? obj.id ?? ''),
    name: obj.Name ?? obj.Designation ?? obj.Model ?? 'Okänd maskin',
    brand: obj.Brand ?? obj.Manufacturer ?? '',
    model: obj.Model ?? obj.Type ?? '',
    serialNo: obj.SerialNo ?? obj.SerialNumber ?? '',
    objectNo: obj.ObjectNo ?? obj.CustomerObjectNo ?? '',
    tags: obj.Tags ?? obj.tags ?? [],
  }));

  return NextResponse.json({ machines });
}
