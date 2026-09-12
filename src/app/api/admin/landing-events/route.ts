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

  const { title, description, category, event_date, is_published, image_url, meta_title, meta_description } = await req.json();
  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Titel och beskrivning krävs' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('landing_events')
    .insert({
      title: title.trim(),
      description: description.trim(),
      category: category?.trim() || null,
      event_date: event_date || new Date().toISOString().slice(0, 10),
      is_published: is_published ?? true,
      image_url: image_url?.trim() || null,
      meta_title: meta_title?.trim() || null,
      meta_description: meta_description?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logAuditEvent(admin, {
    organizationId: null,
    actorUserId: user.id,
    actorOrganizationId: profile.organization_id,
    action: 'admin.create_landing_event',
    targetTable: 'landing_events',
    targetId: data.id,
    metadata: { title, category, event_date, is_published },
  });

  return NextResponse.json({ event: data });
}
