import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_super_admin').eq('id', user.id).single();
  if (!profile?.is_super_admin) return NextResponse.json({ error: 'Ej behörig' }, { status: 403 });

  const { orgId, plan, max_users, max_machines } = await req.json();
  if (!orgId) return NextResponse.json({ error: 'orgId saknas' }, { status: 400 });

  const { error } = await admin
    .from('organizations')
    .update({ plan, max_users, max_machines })
    .eq('id', orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
