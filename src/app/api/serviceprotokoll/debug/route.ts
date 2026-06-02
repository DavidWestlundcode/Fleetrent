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

    // Fetch first 3 service objects — return raw so we can see the structure
    const res = await fetch(`${SP_API}/ServiceObject/Get?request.skip=0&request.take=3`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const raw = await res.json();

    return NextResponse.json({ raw });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
