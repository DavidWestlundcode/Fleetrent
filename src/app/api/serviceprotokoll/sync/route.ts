import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { LIMITS } from '@/lib/rate-limit';

export const maxDuration = 300;

const SP_API = 'https://app.serviceprotokoll.se/api/v1';
const RENTABLE_TAG = 'uthyrningsbar';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAddress(addr: any): string {
  if (!addr) return '';
  return [addr.AddressRow1, addr.AddressRow2, addr.PostalCode, addr.Place].filter(Boolean).join(', ');
}

// SP address mapping: Address → delivery_address, invoice_address left empty (managed in Fortnox).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCustomerAddresses(c: any) {
  return {
    invoice_address: '',
    delivery_address: mapAddress(c.Address),
  };
}

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
async function fetchAllPages(url: string, token: string, maxPages = 200, lastSync?: string): Promise<any[]> {
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
    const items = data.Result ?? [];
    results.push(...items);
    skip += take;
    page++;
    // Stop only when we get fewer items than requested — Count is unreliable
    if (items.length < take) break;
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const forceFullSync = body?.force === true;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    if (!await LIMITS.sync(user.id)) {
      return NextResponse.json({ error: 'För många synkroniseringar. Vänta 5 minuter och försök igen.' }, { status: 429 });
    }

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    const orgId = profile?.organization_id;
    if (!orgId) return NextResponse.json({ error: 'Ingen organisation' }, { status: 400 });

    const admin = createAdminClient();
    const { data: orgRow } = await admin.from('organizations').select('sp_integration_key, sp_last_sync').eq('id', orgId).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integrationKey = (orgRow as any)?.sp_integration_key as string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastSync = forceFullSync ? null : ((orgRow as any)?.sp_last_sync as string | null);

    if (!integrationKey) {
      return NextResponse.json({ error: 'Ingen Serviceprotokoll-nyckel konfigurerad' }, { status: 400 });
    }

    const token = await getSPToken(integrationKey);
    if (!token) return NextResponse.json({ error: 'Kunde inte autentisera mot Serviceprotokoll' }, { status: 400 });

    let machinesImported = 0;
    let customersImported = 0;
    const errors: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let facilityByCustomer: Record<string, any[]> = {};

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
        fetchAllPages(`${SP_API}/Facility/Get`, token, 50).catch(() => []),
      ]);

      // Group facilities by CustomerID — contacts sit on facilities, not on customers
      for (const f of facilities) {
        const cid = String(f.CustomerID ?? f.CustomerId ?? '');
        if (!cid) continue;
        if (!facilityByCustomer[cid]) facilityByCustomer[cid] = [];
        const facContacts = (f.Contacts ?? []).map((ct: Record<string, string>) => ({
          name: ct.Name ?? '',
          phone: ct.MobilePhoneNo ?? ct.PhoneNo ?? '',
          email: ct.Email ?? '',
          title: ct.Title ?? '',
        })).filter((ct: { name: string }) => ct.name);

        facilityByCustomer[cid].push({
          name: f.Name ?? '',
          address: f.Address?.AddressRow1 ?? '',
          city: f.Address?.Place ?? '',
          zip: f.Address?.PostalCode ?? '',
          contacts: facContacts,
        });
      }

      // Build records
      const records = customers
        .filter((c: { Name: string; UniqueID: unknown; CustomerNo: unknown }) => c.Name && (c.UniqueID ?? c.CustomerNo))
        .map((c) => {
          const spId = String(c.UniqueID ?? c.CustomerNo);
          // Facilities use CustomerNo as CustomerID, not UniqueID
          const customerNoKey = c.CustomerNo ? String(c.CustomerNo) : null;
          const customerFacilities = customerNoKey ? (facilityByCustomer[customerNoKey] ?? []) : [];

          // All contacts come from facilities (customer.Contacts is null in SP API)
          const allContacts = customerFacilities.flatMap((f: { contacts?: { name: string; phone: string; email: string; title: string }[] }) => f.contacts ?? []);

          return {
            organization_id: orgId,
            company_name: c.Name,
            org_number: c.OrganisationNumber ?? '',
            email: c.InvoiceEmail ?? '',
            phone: c.Phone ?? (allContacts[0]?.phone ?? ''),
            contact_person: allContacts[0]?.name ?? '',
            ...mapCustomerAddresses(c),
            fortnox_customer_number: c.CustomerNo ? String(c.CustomerNo) : null,
            contacts: allContacts,
            facilities: customerFacilities,
            sp_id: spId,
          };
        });

      // Fetch ALL existing sp_ids with pagination (Supabase default limit is 1000)
      const existingAll: { id: string; sp_id: string }[] = [];
      let exSkip = 0;
      while (true) {
        const { data: batch } = await admin.from('customers')
          .select('id, sp_id')
          .eq('organization_id', orgId)
          .not('sp_id', 'is', null)
          .range(exSkip, exSkip + 999);
        if (!batch || batch.length === 0) break;
        existingAll.push(...batch as { id: string; sp_id: string }[]);
        if (batch.length < 1000) break;
        exSkip += 1000;
      }
      const existingMap = new Map(existingAll.map(r => [String(r.sp_id), String(r.id)]));

      const toInsert = records.filter(r => !existingMap.has(r.sp_id));
      const toUpdate = records
        .filter(r => existingMap.has(r.sp_id))
        .map(r => ({ ...r, id: existingMap.get(r.sp_id)! }));

      // Bulk insert new customers in batches of 200
      const BATCH = 200;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const { error } = await admin.from('customers').insert(toInsert.slice(i, i + BATCH));
        if (error) errors.push(`Insert batch ${i}: ${error.message}`);
        else customersImported += toInsert.slice(i, i + BATCH).length;
      }

      // Update only SP-sourced fields — don't overwrite manual fields like notes, credit_limit
      for (let i = 0; i < toUpdate.length; i += BATCH) {
        const batch = toUpdate.slice(i, i + BATCH).map(r => ({
          id: r.id,
          company_name: r.company_name,
          org_number: r.org_number,
          email: r.email,
          phone: r.phone,
          contact_person: r.contact_person,
          invoice_address: r.invoice_address,
          delivery_address: r.delivery_address,
          fortnox_customer_number: r.fortnox_customer_number,
          contacts: r.contacts,
          facilities: r.facilities,
          sp_id: r.sp_id,
          organization_id: r.organization_id,
        }));
        const { error } = await admin.from('customers')
          .upsert(batch, { onConflict: 'id' });
        if (error) errors.push(`Update batch ${i}: ${error.message}`);
        else customersImported += batch.length;
      }
    } catch (e) {
      errors.push(`Kunder: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Update last sync timestamp
    await admin.from('organizations').update({ sp_last_sync: new Date().toISOString() }).eq('id', orgId);

    const facilitiesTotal = Object.values(facilityByCustomer ?? {}).flat().length;
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
    const [customers, facilities] = await Promise.all([
      fetchAllPages(`${SP_API}/Customer/Get`, token),
      fetchAllPages(`${SP_API}/Facility/Get`, token, 50).catch(() => []),
    ]);

    // Group facilities by CustomerNo (same as POST handler)
    const facilityByCustomer: Record<string, unknown[]> = {};
    for (const f of facilities) {
      const cid = String(f.CustomerID ?? f.CustomerId ?? '');
      if (!cid) continue;
      if (!facilityByCustomer[cid]) facilityByCustomer[cid] = [];
      const facContacts = (f.Contacts ?? []).map((ct: Record<string, string>) => ({
        name: ct.Name ?? '',
        phone: ct.MobilePhoneNo ?? ct.PhoneNo ?? '',
        email: ct.Email ?? '',
        title: ct.Title ?? '',
      })).filter((ct: { name: string }) => ct.name);
      facilityByCustomer[cid].push({
        name: f.Name ?? '',
        address: f.Address?.AddressRow1 ?? '',
        city: f.Address?.Place ?? '',
        zip: f.Address?.PostalCode ?? '',
        contacts: facContacts,
      });
    }

    for (const c of customers) {
      const spId = String(c.UniqueID ?? c.CustomerNo ?? '');
      if (!spId || !c.Name) continue;

      const customerNoKey = c.CustomerNo ? String(c.CustomerNo) : null;
      const customerFacilities = customerNoKey ? (facilityByCustomer[customerNoKey] ?? []) : [];
      const allContacts = (customerFacilities as { contacts?: { name: string; phone: string; email: string; title: string }[] }[])
        .flatMap(f => f.contacts ?? []);

      const record = {
        organization_id: org.id,
        company_name: c.Name,
        org_number: c.OrganisationNumber ?? '',
        email: c.InvoiceEmail ?? (allContacts[0]?.email ?? ''),
        phone: c.Phone ?? (allContacts[0]?.phone ?? ''),
        contact_person: allContacts[0]?.name ?? '',
        ...mapCustomerAddresses(c),
        fortnox_customer_number: c.CustomerNo ? String(c.CustomerNo) : null,
        contacts: allContacts,
        facilities: customerFacilities,
        sp_id: spId,
      };

      const { data: existing } = await admin.from('customers').select('id').eq('organization_id', org.id).eq('sp_id', spId).maybeSingle();
      if (!existing) {
        await admin.from('customers').insert(record);
      } else {
        await admin.from('customers').update(record).eq('id', existing.id);
      }
      total.customers++;
    }

    await admin.from('organizations').update({ sp_last_sync: new Date().toISOString() }).eq('id', org.id);
  }

  return NextResponse.json({ ok: true, ...total });
}
