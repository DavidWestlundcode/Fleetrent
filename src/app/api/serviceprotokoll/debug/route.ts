import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SP_API = 'https://app.serviceprotokoll.se/api/v1';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orgRow } = await admin.from('organizations').select('sp_integration_key').eq('id', profile?.organization_id).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integrationKey = (orgRow as any)?.sp_integration_key;
    if (!integrationKey) return NextResponse.json({ error: 'Ingen nyckel' }, { status: 400 });

    const tokenRes = await fetch(`${SP_API}/Auth/GetToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ IntegrationKey: integrationKey }),
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.Token;
    if (!token) return NextResponse.json({ error: 'Auth misslyckades', tokenData }, { status: 400 });

    // First 3 customers with full data
    const custRes = await fetch(`${SP_API}/Customer/Get?request.skip=0&request.take=3`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const customers = custRes.ok ? await custRes.json() : 'failed';

    // First 3 facilities
    const facRes = await fetch(`${SP_API}/Facility/Get?request.skip=0&request.take=3`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const facilities = facRes.ok ? await facRes.json() : 'failed';

    return NextResponse.json({ customers, facilities });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
