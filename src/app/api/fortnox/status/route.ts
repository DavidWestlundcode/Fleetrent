import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ connected: false });

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) return NextResponse.json({ connected: false });

  const admin = createAdminClient();
  const { data } = await admin
    .from('integrations')
    .select('updated_at')
    .eq('organization_id', profile.organization_id)
    .eq('provider', 'fortnox')
    .single();

  return NextResponse.json({ connected: !!data, connectedAt: data?.updated_at ?? null });
}
