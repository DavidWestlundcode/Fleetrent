import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import RentalAgreementPDF from '@/lib/pdf/rental-agreement';
import React from 'react';

const ZIGNED_API = 'https://api.zigned.se/rest/v3';

async function getZignedToken(): Promise<string | null> {
  const clientId = process.env.ZIGNED_CLIENT_ID;
  const clientSecret = process.env.ZIGNED_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch('https://api.zigned.se/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId saknas' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    const orgId = profile?.organization_id;
    if (!orgId) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });

    const token = await getZignedToken();
    if (!token) return NextResponse.json({ error: 'Zigned inte ansluten — kontrollera ZIGNED_CLIENT_ID och ZIGNED_CLIENT_SECRET' }, { status: 400 });

    const admin = createAdminClient();

    const { data: orderRow } = await admin
      .from('orders')
      .select('*, customers(*), machines(name, brand, model, internal_code, serial_number)')
      .eq('id', orderId)
      .eq('organization_id', orgId)
      .single();

    if (!orderRow) return NextResponse.json({ error: 'Order hittades inte' }, { status: 404 });

    const { data: orgRow } = await admin.from('organizations').select('name').eq('id', orgId).single();

    const customer = orderRow.customers as Record<string, unknown>;
    const machine = orderRow.machines as Record<string, unknown> | null;

    // Fetch template for standard terms if applicable
    let standardTerms = '';
    if (orderRow.template_id) {
      const { data: tmpl } = await admin.from('templates').select('standard_terms').eq('id', orderRow.template_id).single();
      standardTerms = (tmpl?.standard_terms as string) ?? '';
    }

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderFn = renderToBuffer as (el: any) => Promise<Buffer>;
    const pdfBuffer = await renderFn(
      React.createElement(RentalAgreementPDF, {
        orderNumber: orderRow.order_number as string,
        startDate: orderRow.start_date as string,
        plannedReturnDate: (orderRow.planned_return_date as string) ?? '',
        openEnded: (orderRow.open_ended as boolean) ?? false,
        customerName: customer.company_name as string,
        customerOrgNumber: (customer.org_number as string) ?? '',
        customerEmail: (customer.email as string) ?? '',
        customerPhone: (customer.phone as string) ?? '',
        customerAddress: (customer.invoice_address as string) ?? '',
        machineName: machine ? (machine.name as string) : '',
        machineBrand: machine ? (machine.brand as string) : '',
        machineModel: machine ? (machine.model as string) : '',
        machineInternalCode: machine ? (machine.internal_code as string) ?? '' : '',
        machineSerial: machine ? (machine.serial_number as string) ?? '' : '',
        dailyPrice: (orderRow.daily_price as number) ?? 0,
        weeklyPrice: (orderRow.weekly_price as number) ?? 0,
        monthlyPrice: (orderRow.monthly_price as number) ?? 0,
        totalPrice: (orderRow.total_price as number) ?? 0,
        deposit: (orderRow.deposit as number) ?? 0,
        organizationName: (orgRow?.name as string) ?? 'Uthyraren',
        standardTerms,
        accessories: (orderRow.accessories as string[]) ?? [],
        orderReference: (orderRow.order_reference as string) ?? '',
        createdAt: new Date().toLocaleDateString('sv-SE'),
      })
    );

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 1. Upload PDF to Zigned
    const formData = new FormData();
    const pdfArrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength) as ArrayBuffer;
    formData.append('file', new Blob([pdfArrayBuffer], { type: 'application/pdf' }), `hyresavtal-${orderRow.order_number}.pdf`);
    const uploadRes = await fetch(`${ZIGNED_API}/files`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      return NextResponse.json({ error: `Zigned fil-upload: ${err?.error?.message ?? uploadRes.status}` }, { status: 500 });
    }
    const uploadData = await uploadRes.json();
    const fileId = uploadData.data?.id;

    // 2. Create agreement
    const agreementRes = await fetch(`${ZIGNED_API}/agreements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        send_emails: true,
        success_callback_url: `${request.nextUrl.origin}/orders/${orderId}?signed=1`,
      }),
    });
    if (!agreementRes.ok) {
      const err = await agreementRes.json().catch(() => ({}));
      return NextResponse.json({ error: `Zigned avtal: ${err?.error?.message ?? agreementRes.status}` }, { status: 500 });
    }
    const agreementData = await agreementRes.json();
    const agreementId = agreementData.data?.id;

    // 3. Add document FIRST (required before pending)
    const docRes = await fetch(`${ZIGNED_API}/agreements/${agreementId}/documents/main`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ file_id: fileId }),
    });
    if (!docRes.ok) {
      const err = await docRes.json().catch(() => ({}));
      return NextResponse.json({ error: `Zigned dokument: ${err?.error?.message ?? docRes.status}` }, { status: 500 });
    }

    // 4. Add customer as signer
    const participantRes = await fetch(`${ZIGNED_API}/agreements/${agreementId}/participants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: customer.email as string,
        name: customer.company_name as string,
        role: 'signer',
        locale: 'sv-SE',
      }),
    });
    if (!participantRes.ok) {
      const err = await participantRes.json().catch(() => ({}));
      return NextResponse.json({ error: `Zigned deltagare: ${err?.error?.message ?? participantRes.status}` }, { status: 500 });
    }
    const participantData = await participantRes.json();
    const participantId = participantData.data?.id;

    // 5. Fetch agreement state to verify it's ready
    const agreementCheckRes = await fetch(`${ZIGNED_API}/agreements/${agreementId}`, { headers });
    const agreementCheck = agreementCheckRes.ok ? await agreementCheckRes.json() : null;
    const currentStatus = agreementCheck?.data?.status;
    console.log('Agreement state before pending:', currentStatus, JSON.stringify(agreementCheck?.data));

    // 6. Initiate signing (draft → pending)
    const pendingRes = await fetch(`${ZIGNED_API}/agreements/${agreementId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' }),
    });
    if (!pendingRes.ok) {
      const errBody = await pendingRes.text().catch(() => '');
      console.error('Zigned PATCH error:', pendingRes.status, errBody);
      return NextResponse.json({ error: `Zigned aktivering (${pendingRes.status}): ${errBody}` }, { status: 500 });
    }

    // 6. Fetch signing URL after pending (only available then)
    let signingUrl: string | null = null;
    if (participantId) {
      const fetchPart = await fetch(`${ZIGNED_API}/agreements/${agreementId}/participants/${participantId}`, { headers });
      if (fetchPart.ok) {
        const pd = await fetchPart.json();
        signingUrl = pd.data?.signing_room_url ?? null;
      }
    }

    // 6. Update order in DB
    await admin.from('orders').update({
      zigned_agreement_id: agreementId,
      signing_status: 'pending',
      signing_url: signingUrl,
    }).eq('id', orderId);

    return NextResponse.json({ success: true, agreementId, signingUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
