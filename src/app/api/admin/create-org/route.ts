import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit-log';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_super_admin, organization_id').eq('id', user.id).single();
  if (!profile?.is_super_admin) return NextResponse.json({ error: 'Ej behörig' }, { status: 403 });

  const { name, adminEmail } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Organisationsnamn krävs' }, { status: 400 });

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: name.trim() })
    .select('id, name')
    .single();

  if (orgError || !org) return NextResponse.json({ error: orgError?.message ?? 'Kunde inte skapa organisation' }, { status: 500 });

  let memberWarning: string | null = null;

  if (adminEmail?.trim()) {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const match = users?.find((u) => u.email === adminEmail.trim());

    if (!match) {
      memberWarning = `Organisationen skapades, men ingen användare hittades med e-posten ${adminEmail.trim()} — lägg till medlemskap manuellt när personen har ett konto.`;
    } else {
      const { error: memberErr } = await admin.from('organization_members').upsert(
        { user_id: match.id, organization_id: org.id },
        { onConflict: 'user_id,organization_id', ignoreDuplicates: true }
      );
      if (memberErr) memberWarning = `Organisationen skapades, men kunde inte ge ${adminEmail.trim()} åtkomst: ${memberErr.message}`;
    }
  }

  logAuditEvent(admin, {
    organizationId: org.id,
    actorUserId: user.id,
    actorOrganizationId: profile.organization_id,
    action: 'admin.create_org',
    targetTable: 'organizations',
    targetId: org.id,
    metadata: { name: org.name, adminEmail: adminEmail?.trim() || null },
  });

  return NextResponse.json({ organization: org, warning: memberWarning });
}
