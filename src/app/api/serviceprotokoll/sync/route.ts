import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SP_API = 'https://app.serviceprotokoll.se/api/v1';
const RENTABLE_TAG = 'uthyrningsbar';

async function getSPToken(integrationKey: string): Promise<string | null> {
  const res = await fetch(`${SP_API}/Auth/GetToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ IntegrationKey: integrationKey }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.Token ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllPages(url: string, token: string, maxPages = 10, lastSync?: string): Promise<any[]> {
  const results = [];
  let skip = 0;
  const take = 100;
  let page = 0;
  const syncParam = lastSync ? `&request.lastSync=${encodeURIComponent(lastSync)}` : '';
  while (page < maxPages) {
    const res = await fetch(`${url}?request.skip=${skip}&request.take=${take}${syncParam}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) break;
    const data = await res.json();
    const total = data.Count ?? 0;
    const items = data.Result ?? [];
    results.push(...items);
    skip += take;
    page++;
    if (skip >= total || items.length < take) break;
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    const orgId = profile?.organization_id;
    if (!orgId) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });

    const admin = createAdminClient();
    const { data: orgRow } = await admin.from('organizations').select('sp_integration_key, sp_last_sync').eq('id', orgId).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integrationKey = (orgRow as any)?.sp_integration_key as string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastSync = (orgRow as any)?.sp_last_sync as string | null;

    if (!integrationKey) {
      return NextResponse.json({ error: 'Ingen Serviceprotokoll-nyckel konfigurerad' }, { status: 400 });
    }

    const token = await getSPToken(integrationKey);
    if (!token) return NextResponse.json({ error: 'Kunde inte autentisera mot Serviceprotokoll' }, { status: 400 });

    let machinesImported = 0;
    let customersImported = 0;
    const errors: string[] = [];

    // ── Sync machines (ServiceObjects with tag "uthyrningsbar") ──
    try {
      const serviceObjects = await fetchAllPages(`${SP_API}/ServiceObject/Get`, token);
      const rentable = serviceObjects.filter((obj) => {
        const tags: string[] = obj.Tags ?? obj.tags ?? [];
        return tags.some((t: string) => t.toLowerCase() === RENTABLE_TAG);
      });

      for (const obj of rentable) {
        const spId = String(obj.Id ?? obj.id ?? obj.SerialNo ?? '');
        const name = obj.Name ?? obj.Designation ?? obj.Model ?? 'Okänd maskin';
        const brand = obj.Brand ?? obj.Manufacturer ?? '';
        const model = obj.Model ?? obj.Type ?? '';
        const serialNo = obj.SerialNo ?? obj.SerialNumber ?? '';
        const internalCode = obj.ObjectNo ?? obj.CustomerObjectNo ?? '';

        // Upsert — don't overwrite if already exists with same sp_id
        const { data: existing } = await admin.from('machines')
          .select('id')
          .eq('organization_id', orgId)
          .eq('sp_id', spId)
          .maybeSingle();

        if (!existing && spId) {
          const { error } = await admin.from('machines').insert({
            organization_id: orgId,
            name,
            brand,
            model,
            serial_number: serialNo,
            internal_code: internalCode,
            status: 'lager',
            sp_id: spId,
          });
          if (!error) machinesImported++;
          else errors.push(`Maskin ${name}: ${error.message}`);
        }
      }
    } catch (e) {
      errors.push(`Maskiner: ${e instanceof Error ? e.message : String(e)}`);
    }

    // ── Sync customers — no page limit, use lastSync for incremental updates ──
    try {
      const [customers, facilities] = await Promise.all([
        fetchAllPages(`${SP_API}/Customer/Get`, token, 200, lastSync ?? undefined),
        fetchAllPages(`${SP_API}/Facility/Get`, token, 200).catch(() => []),
      ]);

      // Group facilities by CustomerID for fast lookup
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const facilityByCustomer: Record<string, any[]> = {};
      for (const f of facilities) {
        const cid = String(f.CustomerID ?? f.CustomerId ?? '');
        if (!cid) continue;
        if (!facilityByCustomer[cid]) facilityByCustomer[cid] = [];
        facilityByCustomer[cid].push({
          name: f.Name ?? f.FacilityName ?? '',
          address: f.Address?.Street ?? f.StreetAddress ?? '',
          city: f.Address?.City ?? f.City ?? '',
          zip: f.Address?.Zip ?? f.ZipCode ?? '',
        });
      }

      // Build records to upsert in batches of 100
      const records = customers
        .filter(c => c.Name && (c.UniqueID ?? c.CustomerNo))
        .map(c => {
          const spId = String(c.UniqueID ?? c.CustomerNo);
          const contacts = (c.Contacts ?? []).map((ct: Record<string, string>) => ({
            name: ct.Name ?? ct.ContactName ?? '',
            phone: ct.Phone ?? ct.Mobile ?? '',
            email: ct.Email ?? ct.EmailAddress ?? '',
            title: ct.Title ?? ct.Role ?? '',
          })).filter((ct: { name: string }) => ct.name);

          return {
            organization_id: orgId,
            company_name: c.Name,
            org_number: c.OrganisationNumber ?? '',
            email: c.InvoiceEmail ?? (contacts[0]?.email ?? ''),
            phone: c.Phone ?? (contacts[0]?.phone ?? ''),
            contact_person: contacts[0]?.name ?? '',
            invoice_address: [c.InvoiceAddress?.Street, c.InvoiceAddress?.PostalCode, c.InvoiceAddress?.City].filter(Boolean).join(', '),
            delivery_address: [c.Address?.Street, c.Address?.PostalCode, c.Address?.City].filter(Boolean).join(', '),
            contacts,
            facilities: facilityByCustomer[spId] ?? [],
            sp_id: spId,
          };
        });

      const BATCH = 100;
      for (let i = 0; i < records.length; i += BATCH) {
        const batch = records.slice(i, i + BATCH);
        // ignoreDuplicates: false so we UPDATE existing customers with fresh SP data
        const { error, count } = await admin.from('customers')
          .upsert(batch, { onConflict: 'organization_id,sp_id', ignoreDuplicates: false, count: 'exact' });
        if (error) errors.push(`Kunder batch ${i}: ${error.message}`);
        else customersImported += count ?? 0;
      }
    } catch (e) {
      errors.push(`Kunder: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Update last sync timestamp
    await admin.from('organizations').update({ sp_last_sync: new Date().toISOString() }).eq('id', orgId);

    return NextResponse.json({ machinesImported, customersImported, errors });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Okänt fel' }, { status: 500 });
  }
}

// Cron-triggered version (no auth check, uses env var per org)
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  // Sync all orgs that have an SP integration key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orgs } = await admin.from('organizations').select('id, sp_integration_key').not('sp_integration_key' as any, 'is', null);

  let total = { machines: 0, customers: 0 };
  for (const org of orgs ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key = (org as any).sp_integration_key as string;
    if (!key) continue;
    const token = await getSPToken(key);
    if (!token) continue;

    // machines
    const serviceObjects = await fetchAllPages(`${SP_API}/ServiceObject/Get`, token);
    const rentable = serviceObjects.filter((obj) => {
      const tags: string[] = obj.Tags ?? obj.tags ?? [];
      return tags.some((t: string) => t.toLowerCase() === RENTABLE_TAG);
    });
    for (const obj of rentable) {
      const spId = String(obj.Id ?? obj.id ?? obj.SerialNo ?? '');
      if (!spId) continue;
      const { data: existing } = await admin.from('machines').select('id').eq('organization_id', org.id).eq('sp_id', spId).maybeSingle();
      if (!existing) {
        await admin.from('machines').insert({
          organization_id: org.id,
          name: obj.Name ?? obj.Designation ?? obj.Model ?? 'Okänd maskin',
          brand: obj.Brand ?? obj.Manufacturer ?? '',
          model: obj.Model ?? obj.Type ?? '',
          serial_number: obj.SerialNo ?? obj.SerialNumber ?? '',
          internal_code: obj.ObjectNo ?? obj.CustomerObjectNo ?? '',
          status: 'lager',
          sp_id: spId,
        });
        total.machines++;
      }
    }

    // customers
    const customers = await fetchAllPages(`${SP_API}/Customer/Get`, token);
    for (const c of customers) {
      const spId = String(c.UniqueID ?? c.CustomerNo ?? '');
      if (!spId || !c.Name) continue;
      const { data: existing } = await admin.from('customers').select('id').eq('organization_id', org.id).eq('sp_id', spId).maybeSingle();
      if (!existing) {
        await admin.from('customers').insert({
          organization_id: org.id,
          company_name: c.Name,
          org_number: c.OrganisationNumber ?? '',
          email: c.InvoiceEmail ?? '',
          phone: c.Phone ?? '',
          invoice_address: [c.InvoiceAddress?.Street, c.InvoiceAddress?.City].filter(Boolean).join(', '),
          sp_id: spId,
        });
        total.customers++;
      }
    }

    await admin.from('organizations').update({ sp_last_sync: new Date().toISOString() }).eq('id', org.id);
  }

  return NextResponse.json({ ok: true, ...total });
}
