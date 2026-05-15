import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { name, company, email, phone, machines, message } = await request.json();

    if (!name || !company || !email || !phone) {
      return NextResponse.json({ error: 'Obligatoriska fält saknas' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from('leads').insert({
      name,
      company,
      email,
      phone,
      machines,
      message: message || '',
    });

    if (error) {
      console.error('Failed to save lead:', error);
      return NextResponse.json({ error: 'Kunde inte spara förfrågan' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Lead API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
