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

    // Fetch all facilities (first 500) and find ones with "renta" or "enköping" in name
    const facRes = await fetch(`${SP_API}/Facility/Get?request.skip=0&request.take=500`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const facData = facRes.ok ? await facRes.json() : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rentaFacilities = facData?.Result?.filter((f: any) =>
      f.Name?.toLowerCase().includes('renta') || f.Name?.toLowerCase().includes('enköping') || f.Name?.toLowerCase().includes('bålsta')
    ) ?? [];

    // Show unique CustomerIDs to understand the pattern
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueCustomerIDs = [...new Set(facData?.Result?.map((f: any) => f.CustomerID) ?? [])].slice(0, 20);

    // Find customers with non-null CustomerNo
    const custRes = await fetch(`${SP_API}/Customer/Get?request.skip=0&request.take=200`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const custData = custRes.ok ? await custRes.json() : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withCustomerNo = custData?.Result?.filter((c: any) => c.CustomerNo !== null).slice(0, 5);

    return NextResponse.json({ rentaFacilities, uniqueCustomerIDs, withCustomerNo });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
