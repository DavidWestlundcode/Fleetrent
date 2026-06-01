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

    // Create user if not exists
    const { data: { users: existingUsers } } = await admin.auth.admin.listUsers();
    const alreadyExists = existingUsers?.some((u) => u.email === email);

    let userId: string | null = null;

    if (!alreadyExists) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { organization_id: profile.organization_id },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    } else {
      userId = existingUsers?.find((u) => u.email === email)?.id ?? null;
    }

    if (userId) {
      await admin.from('profiles').upsert({
        id: userId,
        organization_id: profile.organization_id,
        full_name: '',
        role: 'saljare',
      });
    }

    // Generate recovery link — get the hashed_token directly
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${origin}/auth/reset-password` },
    });

    if (linkErr) throw linkErr;

    const hashedToken = linkData?.properties?.hashed_token;
    if (!hashedToken) throw new Error('Kunde inte generera länk');

    // Build a direct link to our confirm page — bypasses PKCE completely
    const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`;

    return NextResponse.json({ success: true, link });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
