import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'E-post och lösenord krävs' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Lösenordet måste vara minst 8 tecken' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    if (!await LIMITS.userAdmin(user.id)) {
      return NextResponse.json({ error: 'För många förfrågningar. Försök igen om en minut.' }, { status: 429 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });
    if (profile.role !== 'admin') return NextResponse.json({ error: 'Endast admins kan skapa användare' }, { status: 403 });

    const admin = createAdminClient();

    // Create user with confirmed email — no invite mail needed
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { organization_id: profile.organization_id, full_name: fullName || '' },
    });

    if (createError) {
      const msg = createError.message.includes('already registered')
        ? 'En användare med den e-postadressen finns redan'
        : createError.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Create profile record
    await admin.from('profiles').upsert({
      id: newUser.user.id,
      organization_id: profile.organization_id,
      full_name: fullName || '',
      role: 'saljare',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
