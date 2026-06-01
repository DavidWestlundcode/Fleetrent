import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'E-post krävs' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'Ingen organisation kopplad' }, { status: 400 });
    }
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Endast admins kan bjuda in' }, { status: 403 });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${request.nextUrl.origin}/api/auth/callback?next=/auth/reset-password`,
      data: { organization_id: profile.organization_id },
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
