import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calcBreakdown, countBusinessDays } from '@/lib/utils';
import { NextResponse, type NextRequest } from 'next/server';
import { LIMITS } from '@/lib/rate-limit';

const FORTNOX_API = 'https://api.fortnox.se/3';

async function getValidToken(orgId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: integration } = await admin
    .from('integrations')
    .select('access_token, refresh_token, expires_at')
    .eq('organization_id', orgId)
    .eq('provider', 'fortnox')
    .single();

  if (!integration) return null;

  // Refresh if expired or about to expire (within 5 min)
  const expiresAt = new Date(integration.expires_at as string).getTime();
  if (Date.now() < expiresAt - 5 * 60 * 1000) {
    return integration.access_token as string;
  }

  const credentials = Buffer.from(
    `${process.env.FORTNOX_CLIENT_ID}:${process.env.FORTNOX_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://apps.fortnox.se/oauth-v1/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: integration.refresh_token as string,
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await admin.from('integrations').update({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: newExpiresAt,
    updated_at: new Date().toISOString(),
  }).eq('organization_id', orgId).eq('provider', 'fortnox');

  return tokens.access_token as string;
}

async function ensureFortnoxCustomer(
  token: string,
  customer: { companyName: string; orgNumber: string; email: string; phone: string; invoiceAddress: string; fortnoxCustomerNumber?: string }
): Promise<{ customerNumber: string | null; error?: string }> {
  if (customer.fortnoxCustomerNumber) return { customerNumber: customer.fortnoxCustomerNumber };

  const res = await fetch(`${FORTNOX_API}/customers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Customer: {
        Name: customer.companyName,
        OrganisationNumber: customer.orgNumber || undefined,
        Email: customer.email || undefined,
        Phone1: customer.phone || undefined,
        Address1: customer.invoiceAddress || undefined,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.ErrorInformation?.message ?? err?.message ?? `HTTP ${res.status}`;
    console.error('Fortnox create customer error:', err);
    return { customerNumber: null, error: `Kunde inte skapa kund i Fortnox: ${msg}` };
  }

  const json = await res.json();
  const customerNumber = json.Customer?.CustomerNumber ?? null;
  return { customerNumber };
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId saknas' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    if (!await LIMITS.integration(user.id)) {
      return NextResponse.json({ error: 'För många förfrågningar. Försök igen om en minut.' }, { status: 429 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, cost_center')
      .eq('id', user.id)
      .single();

    const orgId = profile?.organization_id;
    const costCenter = (profile as { cost_center?: string | null } | null)?.cost_center ?? null;
    if (!orgId) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });

    const token = await getValidToken(orgId);
    if (!token) return NextResponse.json({ error: 'Fortnox inte ansluten' }, { status: 400 });

    const admin = createAdminClient();

    // Fetch order with customer and machine
    const { data: orderRow } = await admin
      .from('orders')
      .select('*, customers(*), machines(name, brand, model, internal_code, serial_number)')
      .eq('id', orderId)
      .eq('organization_id', orgId)
      .single();

    if (!orderRow) return NextResponse.json({ error: 'Order hittades inte' }, { status: 404 });

    const customerRow = orderRow.customers as Record<string, unknown>;
    const { customerNumber: fortnoxCustomerNumber, error: customerError } = await ensureFortnoxCustomer(token, {
      companyName: customerRow.company_name as string,
      orgNumber: (customerRow.org_number as string) ?? '',
      email: (customerRow.email as string) ?? '',
      phone: (customerRow.phone as string) ?? '',
      invoiceAddress: (customerRow.invoice_address as string) ?? '',
      fortnoxCustomerNumber: (customerRow.fortnox_customer_number as string) || undefined,
    });

    if (!fortnoxCustomerNumber) {
      return NextResponse.json({ error: customerError ?? 'Kunde inte hämta kundnummer från Fortnox' }, { status: 500 });
    }

    // Save Fortnox customer number back to customer record
    if (!customerRow.fortnox_customer_number) {
      await admin
        .from('customers')
        .update({ fortnox_customer_number: fortnoxCustomerNumber })
        .eq('id', orderRow.customer_id);
    }

    // Build order rows
    const startDate = orderRow.start_date as string;
    // For fixed-term orders use planned_return_date (matches agreed billing period).
    // For open-ended orders (no planned date) fall back to actual_return_date.
    const isOpenEnded = !orderRow.planned_return_date;
    const endDate = isOpenEnded
      ? ((orderRow.actual_return_date as string) || startDate)
      : (orderRow.planned_return_date as string);
    const calendarDays = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
    const chargeWeekends = (orderRow.charge_weekends as boolean) ?? false;
    const days = (!isOpenEnded && !chargeWeekends)
      ? countBusinessDays(startDate, endDate)
      : calendarDays;

    const machineRow = orderRow.machines as Record<string, unknown> | null;
    const machineParts = machineRow ? [
      machineRow.brand,
      machineRow.model,
      machineRow.name,
      machineRow.internal_code ? `(${machineRow.internal_code})` : null,
      machineRow.serial_number ? `S/N: ${machineRow.serial_number}` : null,
    ].filter(Boolean).join(' ') : null;

    const breakdown = calcBreakdown(days, orderRow.daily_price as number, orderRow.weekly_price as number, orderRow.monthly_price as number);
    const monthlyDiscount = (orderRow.monthly_discount as number) ?? 0;
    const weeklyDiscount = (orderRow.weekly_discount as number) ?? 0;
    const dailyDiscount = (orderRow.rental_discount as number) ?? 0;
    const insuranceDiscount = (orderRow.insurance_discount as number) ?? 0;

    // Fetch article numbers for all referenced articles in one query
    const extraArticles = (orderRow.order_articles as { articleId: string; quantity: number; unitPrice: number; discountPercent?: number; description?: string }[]) ?? [];
    const allArticleIds = [
      orderRow.rental_article_id,
      orderRow.insurance_article_id,
      ...extraArticles.map((a) => a.articleId),
    ].filter(Boolean) as string[];

    const articleLookup: Record<string, { name: string; unit: string; article_number: string }> = {};
    if (allArticleIds.length > 0) {
      const { data: artRows } = await admin
        .from('articles')
        .select('id, name, unit, article_number')
        .in('id', allArticleIds);
      for (const a of artRows ?? []) {
        articleLookup[a.id] = a;
      }
    }

    const rentalArt = orderRow.rental_article_id ? articleLookup[orderRow.rental_article_id as string] : null;
    const insArt = orderRow.insurance_article_id ? articleLookup[orderRow.insurance_article_id as string] : null;

    type FortnoxRow = { ArticleNumber?: string; Description: string; DeliveredQuantity: number; Price: number; Unit: string; Discount?: number };
    const orderRows: FortnoxRow[] = [];

    if (breakdown.months > 0) {
      orderRows.push({
        ...(rentalArt?.article_number ? { ArticleNumber: rentalArt.article_number } : {}),
        Description: machineParts ? `Hyra – ${machineParts} – ${breakdown.months} mån` : `Hyra – ${breakdown.months} mån`,
        DeliveredQuantity: breakdown.months,
        Price: (orderRow.monthly_price as number) ?? 0,
        Unit: 'mån',
        ...(monthlyDiscount > 0 ? { Discount: monthlyDiscount } : {}),
      });
    }
    if (breakdown.weeks > 0) {
      orderRows.push({
        ...(rentalArt?.article_number ? { ArticleNumber: rentalArt.article_number } : {}),
        Description: machineParts ? `Hyra – ${machineParts} – ${breakdown.weeks} v` : `Hyra – ${breakdown.weeks} v`,
        DeliveredQuantity: breakdown.weeks,
        Price: (orderRow.weekly_price as number) ?? 0,
        Unit: 'vecka',
        ...(weeklyDiscount > 0 ? { Discount: weeklyDiscount } : {}),
      });
    }
    if (breakdown.days > 0 || orderRows.length === 0) {
      const dayQty = breakdown.days > 0 ? breakdown.days : days;
      orderRows.push({
        ...(rentalArt?.article_number ? { ArticleNumber: rentalArt.article_number } : {}),
        Description: machineParts ? `Hyra – ${machineParts} – ${dayQty} dagar` : `Hyra – ${dayQty} dagar`,
        DeliveredQuantity: dayQty,
        Price: (orderRow.daily_price as number) ?? 0,
        Unit: 'dag',
        ...(dailyDiscount > 0 ? { Discount: dailyDiscount } : {}),
      });
    }

    if ((orderRow.insurance_cost as number) > 0) {
      orderRows.push({
        ...(insArt?.article_number ? { ArticleNumber: insArt.article_number } : {}),
        Description: 'Försäkring',
        DeliveredQuantity: 1,
        Price: orderRow.insurance_cost as number,
        Unit: 'st',
        ...(insuranceDiscount > 0 ? { Discount: insuranceDiscount } : {}),
      });
    }

    for (const extra of extraArticles) {
      const art = articleLookup[extra.articleId];
      const artDiscount = extra.discountPercent ?? 0;
      orderRows.push({
        ...(art?.article_number ? { ArticleNumber: art.article_number } : {}),
        Description: extra.description || art?.name || 'Artikel',
        DeliveredQuantity: extra.quantity,
        Price: extra.unitPrice,
        Unit: art?.unit ?? 'st',
        ...(artDiscount > 0 ? { Discount: artDiscount } : {}),
      });
    }

    const fortnoxRes = await fetch(`${FORTNOX_API}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Order: {
          CustomerNumber: fortnoxCustomerNumber,
          OrderDate: new Date().toISOString().split('T')[0],
          OurReference: orderRow.order_number,
          YourOrderNumber: (orderRow.order_reference as string) || '',
          Comments: `FleetOS-order ${orderRow.order_number}`,
          ...(costCenter ? { CostCenter: costCenter } : {}),
          OrderRows: orderRows,
        },
      }),
    });

    if (!fortnoxRes.ok) {
      const errBody = await fortnoxRes.json().catch(() => ({}));
      const errMsg = errBody?.ErrorInformation?.message ?? errBody?.message ?? JSON.stringify(errBody);
      console.error('Fortnox create order error:', errBody);
      return NextResponse.json({ error: `Fortnox: ${errMsg}` }, { status: 500 });
    }

    const fortnoxJson = await fortnoxRes.json();
    const fortnoxOrderNumber = fortnoxJson.Order?.DocumentNumber as string;

    // Update order in DB
    await admin.from('orders').update({
      sent_to_accounting: true,
      fortnox_order_number: fortnoxOrderNumber,
    }).eq('id', orderId);

    return NextResponse.json({ success: true, fortnoxOrderNumber });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
