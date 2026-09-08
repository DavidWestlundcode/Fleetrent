import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/audit-log';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });

  // Only admins can disconnect integrations
  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Du har inte behörighet att koppla bort integrationer' }, { status: 403 });
  }

  const admin = createAdminClient();
  await admin
    .from('integrations')
    .delete()
    .eq('organization_id', profile.organization_id)
    .eq('provider', 'fortnox');

  logAuditEvent(admin, {
    organizationId: profile.organization_id,
    actorUserId: user.id,
    action: 'integration.fortnox_disconnected',
    targetTable: 'integrations',
  });

  return NextResponse.json({ success: true });
}
