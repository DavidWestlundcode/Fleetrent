import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const clientId = process.env.FORTNOX_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL('/settings?error=fortnox_not_configured', request.url));
  }

  const redirectUri = `${process.env.APP_URL ?? request.nextUrl.origin}/api/fortnox/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'order companyinformation customer',
    state: user.id,
    access_type: 'offline',
    response_type: 'code',
  });

  return NextResponse.redirect(`https://apps.fortnox.se/oauth-v1/auth?${params}`);
}
