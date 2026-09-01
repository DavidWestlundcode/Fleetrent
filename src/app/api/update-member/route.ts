import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { LIMITS } from '@/lib/rate-limit';

const VALID_ROLES = ['admin', 'saljare', 'verkstad'];

export async function POST(request: NextRequest) {
  try {
    const { userId, fullName, role } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId krävs' }, { status: 400 });
    if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Ogiltig roll' }, { status: 400 });

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
    if (profile.role !== 'admin') return NextResponse.json({ error: 'Endast admins kan redigera medlemmar' }, { status: 403 });
    if (userId === user.id) return NextResponse.json({ error: 'Du kan inte redigera din egen roll här' }, { status: 400 });

    const admin = createAdminClient();

    // Only allow editing someone within your own organization.
    const { data: target } = await admin
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!target || target.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Användaren hittades inte i din organisation' }, { status: 404 });
    }

    const { error: updateError } = await admin
      .from('profiles')
      .update({ full_name: fullName || '', role })
      .eq('id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
