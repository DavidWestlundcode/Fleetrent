import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

  // RLS on organization_members already confines this to the caller's own rows.
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  const orgIds = (memberships ?? []).map((m) => m.organization_id as string);
  if (orgIds.length === 0) return NextResponse.json({ organizations: [] });

  // organizations' own RLS only allows reading the caller's CURRENTLY ACTIVE
  // org (org_select: id = get_org_id()) — deliberately not broadened for this
  // feature, since that policy also guards org_number/email/phone/address.
  // The service-role client here is scoped to exactly the org ids the
  // caller's own membership rows (checked above, under real RLS) already
  // proved they belong to — not an open read of every organization.
  const admin = createAdminClient();
  const { data: orgs } = await admin
    .from('organizations')
    .select('id, name')
    .in('id', orgIds);

  return NextResponse.json({ organizations: orgs ?? [] });
}
