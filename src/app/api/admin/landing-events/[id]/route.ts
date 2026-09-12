import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit-log';

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Ej inloggad' }, { status: 401 }) } as const;

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_super_admin, organization_id').eq('id', user.id).single();
  if (!profile?.is_super_admin) return { error: NextResponse.json({ error: 'Ej behörig' }, { status: 403 }) } as const;

  return { user, profile, admin } as const;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;
  const { user, profile, admin } = auth;

  const { title, description, category, event_date, is_published, image_url, meta_title, meta_description } = await req.json();

  const { data: before } = await admin.from('landing_events').select('*').eq('id', id).single();

  const { data, error } = await admin
    .from('landing_events')
    .update({
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(category !== undefined && { category: category?.trim() || null }),
      ...(event_date !== undefined && { event_date }),
      ...(is_published !== undefined && { is_published }),
      ...(image_url !== undefined && { image_url: image_url?.trim() || null }),
      ...(meta_title !== undefined && { meta_title: meta_title?.trim() || null }),
      ...(meta_description !== undefined && { meta_description: meta_description?.trim() || null }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logAuditEvent(admin, {
    organizationId: null,
    actorUserId: user.id,
    actorOrganizationId: profile.organization_id,
    action: 'admin.update_landing_event',
    targetTable: 'landing_events',
    targetId: id,
    metadata: { before, after: data },
  });

  return NextResponse.json({ event: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;
  const { user, profile, admin } = auth;

  const { data: before } = await admin.from('landing_events').select('*').eq('id', id).single();

  const { error } = await admin.from('landing_events').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logAuditEvent(admin, {
    organizationId: null,
    actorUserId: user.id,
    actorOrganizationId: profile.organization_id,
    action: 'admin.delete_landing_event',
    targetTable: 'landing_events',
    targetId: id,
    metadata: { before },
  });

  return NextResponse.json({ ok: true });
}
