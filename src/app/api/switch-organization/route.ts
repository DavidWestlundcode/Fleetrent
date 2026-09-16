import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { LIMITS } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();
    if (!organizationId || typeof organizationId !== 'string') {
      return NextResponse.json({ error: 'organizationId krävs' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    if (!await LIMITS.switchOrg(user.id)) {
      return NextResponse.json({ error: 'För många förfrågningar. Försök igen om en minut.' }, { status: 429 });
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (currentProfile?.organization_id === organizationId) {
      return NextResponse.json({ success: true, alreadyActive: true });
    }

    // Runs on the caller's own anon+cookie client — RLS on organization_members
    // ("user_id = auth.uid() OR ...") already confines results to the caller's
    // own rows regardless of the .eq() filter below. Defense in depth, not the
    // only guard: the admin update below is what actually matters.
    const { data: membership, error: membershipErr } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (membershipErr) throw membershipErr;
    if (!membership) {
      return NextResponse.json({ error: 'Du har inte tillgång till den organisationen' }, { status: 403 });
    }

    // Only a service-role write can get past the protect_profile_fields
    // trigger, which reverts client-side changes to organization_id.
    const admin = createAdminClient();
    const { error: updateErr } = await admin
      .from('profiles')
      .update({ organization_id: organizationId })
      .eq('id', user.id);

    if (updateErr) throw updateErr;

    logAuditEvent(admin, {
      organizationId,
      actorUserId: user.id,
      actorOrganizationId: currentProfile?.organization_id ?? null,
      action: 'user.switch_organization',
      targetTable: 'profiles',
      targetId: user.id,
      metadata: { from: currentProfile?.organization_id ?? null, to: organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
