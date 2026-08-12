import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateContractInvoices } from '@/lib/contract-invoicing';
import { LIMITS } from '@/lib/rate-limit';

// Manual "Generera nu" trigger — lets an admin generate this month's delfakturor on demand
// instead of waiting for the cron job, e.g. to test the flow or catch up after a missed run.
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    if (!await LIMITS.integration(user.id)) {
      return NextResponse.json({ error: 'För många förfrågningar. Försök igen om en minut.' }, { status: 429 });
    }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    const orgId = profile?.organization_id;
    if (!orgId) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });

    const admin = createAdminClient();
    const todayStr = new Date().toISOString().split('T')[0];
    const { generated, skipped, errors, updatedOrders } = await generateContractInvoices(admin, todayStr, orgId);

    return NextResponse.json({ generated, skipped, errors, updatedOrders });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Okänt fel' }, { status: 500 });
  }
}
