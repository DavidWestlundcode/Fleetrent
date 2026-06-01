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

    if (!profile?.organization_id) return NextResponse.json({ error: 'Ingen organisation kopplad' }, { status: 400 });
    if (profile.role !== 'admin') return NextResponse.json({ error: 'Endast admins kan bjuda in' }, { status: 403 });

    const admin = createAdminClient();
    const origin = request.nextUrl.origin;

    // First create/confirm the user so they exist
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.some((u) => u.email === email);

    if (!alreadyExists) {
      const { error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { organization_id: profile.organization_id },
      });
      if (createErr && !createErr.message.includes('already registered')) throw createErr;

      // Ensure profile record
      const { data: newUser } = await admin.auth.admin.listUsers();
      const created = newUser?.users?.find((u) => u.email === email);
      if (created) {
        await admin.from('profiles').upsert({
          id: created.id,
          organization_id: profile.organization_id,
          full_name: '',
          role: 'saljare',
        });
      }
    }

    // Generate a magic link (password recovery) — bypasses OTP expiry issues
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${origin}/api/auth/callback?next=/auth/reset-password`,
      },
    });

    if (linkErr) throw linkErr;

    return NextResponse.json({ success: true, link: linkData.properties?.action_link });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
