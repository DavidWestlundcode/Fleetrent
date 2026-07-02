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

async function getSPToken(integrationKey: string): Promise<{ token: string } | { error: string }> {
  const body = JSON.stringify({ IntegrationKey: integrationKey });
  const headers = { 'Content-Type': 'application/json' };

  async function doPost(url: string): Promise<Response> {
    return fetch(url, {
      method: 'POST',
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });
  }

  try {
    let res = await doPost(`${SP_API}/Auth/GetToken`);

    // Follow redirects manually to preserve POST method (fetch converts POST→GET on 301/302)
    if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
      const location = res.headers.get('location');
      if (!location) return { error: `Redirect ${res.status} utan Location-header` };
      res = await doPost(location);
    }

    const text = await res.text();
    if (!res.ok) return { error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    const data = JSON.parse(text);
    if (!data.Token) return { error: `Inget Token i svar: ${text.slice(0, 200)}` };
    return { token: data.Token };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function spGet(url: string, token: string): Promise<Response> {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(30000) });
  if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
    const location = res.headers.get('location');
    if (location) return fetch(location, { headers, signal: AbortSignal.timeout(30000) });
  }
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllPages(url: string, token: string, maxPages = 200, lastSync?: string, extraParams = ''): Promise<any[]> {
  const results = [];
  let skip = 0;
  const take = 100;
  let page = 0;
  const syncParam = lastSync ? `&request.lastSync=${encodeURIComponent(lastSync)}` : '';
  while (page < maxPages) {
    const res = await spGet(`${url}?request.skip=${skip}&request.take=${take}${syncParam}${extraParams}`, token);
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

// Extract the first number from a string (handles "160x15" → 160, "5000 kg" → 5000)
function parseNumericValue(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const m = String(raw).match(/\d+([.,]\d+)?/);
  if (!m) return undefined;
  const n = parseFloat(m[0].replace(',', '.'));
  return isNaN(n) ? undefined : n;
}

// Parse technical specs from SP object.
// Tries CustomInfo array (when includeCustomInfo=true) first, falls back to Installation date for year.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSpSpecs(obj: any): {
  year?: number;
  capacity?: number;
  lift_height?: number;
  build_height?: number;
  fork_length?: number;
  purchase_price?: number;
  working_weight?: number;
  mast_type?: string;
  power_unit?: string;
  cabin?: string;
  category?: string;
} {
  // CustomInfo is an array of { Name, Value } when SP flag includeCustomInfo=true is used
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customFields: { Name?: string; Value?: string }[] = Array.isArray(obj?.CustomInfo) ? obj.CustomInfo
    : Array.isArray(obj?.CustomFields) ? obj.CustomFields
    : Array.isArray(obj?.Properties) ? obj.Properties
    : [];

  const getField = (...names: string[]): number | undefined => {
    for (const name of names) {
      const entry = customFields.find((f) => f.Name?.toLowerCase() === name.toLowerCase());
      if (entry?.Value) {
        const v = parseNumericValue(entry.Value);
        if (v !== undefined) return v;
      }
    }
    return undefined;
  };

  const getTextField = (...names: string[]): string | undefined => {
    for (const name of names) {
      const entry = customFields.find((f) => f.Name?.toLowerCase() === name.toLowerCase());
      if (entry?.Value && entry.Value.trim() && entry.Value.trim() !== '.') return entry.Value.trim();
    }
    return undefined;
  };

  // Year: try CustomInfo first, then top-level SP fields, then Installation date
  let year = getField('Årsmodell', 'Arsmodell', 'ModelYear', 'ManufactureYear', 'year', 'Year');
  if (!year) {
    const topLevelYear = obj?.ModelYear ?? obj?.ManufactureYear ?? obj?.Arsmodell ?? obj?.ArsModell ?? obj?.Year;
    if (topLevelYear) {
      const y = parseInt(String(topLevelYear));
      if (y > 1900 && y < 2100) year = y;
    }
  }
  if (!year && obj?.Installation) {
    const y = parseInt(String(obj.Installation).slice(0, 4));
    if (y > 1900 && y < 2100) year = y;
  }

  // Category from SP custom field "Kategori"
  const categoryRaw = customFields.find((f) =>
    f.Name?.toLowerCase() === 'kategori' || f.Name?.toLowerCase() === 'category'
  )?.Value;

  return {
    year,
    capacity: getField('kapacitet', 'Kapacitet', 'capacity'),
    lift_height: getField('Lyfthöjd', 'lyfthöjd', 'lift_height'),
    build_height: getField('Bygghöjd', 'bygghöjd', 'build_height'),
    fork_length: getField('Gafflar', 'gafflar', 'fork_length', 'Gaffelhängd'),
    purchase_price: getField('Inköpspris', 'inköpspris', 'purchase_price'),
    working_weight: getField('Vikt', 'vikt', 'working_weight'),
    mast_type: getTextField('Stativ', 'stativ', 'mast_type'),
    power_unit: getTextField('Aggregat', 'aggregat', 'power_unit'),
    cabin: getTextField('Hytt', 'hytt', 'cabin'),
    category: mapSpCategory(categoryRaw),
  };
}

// Map an SP category string to a FleetRent MachineCategory code
function mapSpCategory(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase()
    .replace(/[åä]/g, 'a').replace(/[ö]/g, 'o');
  const map: Record<string, string> = {
    motviktstruck: 'motviktstruck',
    ledstaplare: 'ledstaplare',
    skjutstativtruck: 'skjutstativtruck',
    teleskoplastare: 'teleskoplastare',
    hjullastare: 'hjullastare',
    gravmaskin: 'gravmaskin',
    kompaktlastare: 'kompaktlastare',
    ovrigt: 'ovrig',
    ovrig: 'ovrig',
  };
  return map[v];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSpMachinesPerCustomer(customerNos: string[], token: string): Promise<Record<string, any[]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any[]> = {};
  const CONCURRENCY = 10;
  for (let i = 0; i < customerNos.length; i += CONCURRENCY) {
    const batch = customerNos.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (customerNo) => {
      try {
        const objects: unknown[] = [];
        let skip = 0;
        const take = 100;
        for (let page = 0; page < 3; page++) {
          const res = await spGet(
            `${SP_API}/ServiceObject/Get?request.skip=${skip}&request.take=${take}&request.customerNo=${encodeURIComponent(customerNo)}`,
            token,
          );
          if (!res.ok) break;
          const data = await res.json();
          const items = data.Result ?? [];
          objects.push(...items);
          if (items.length < take) break;
          skip += take;
        }
        if (objects.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result[customerNo] = (objects as any[]).map((obj) => ({
            spId: String(obj.Id ?? obj.id ?? ''),
            name: obj.Name ?? obj.Designation ?? obj.Model ?? 'Okänd maskin',
            brand: obj.Brand ?? obj.Manufacturer ?? '',
            model: obj.Model ?? obj.Type ?? '',
            serialNo: obj.SerialNo ?? obj.SerialNumber ?? '',
            objectNo: obj.ObjectNo ?? obj.CustomerObjectNo ?? '',
            tags: obj.Tags ?? obj.tags ?? [],
          }));
        }
      } catch { /* skip failed customer */ }
    }));
  }
  return result;
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
    const { data: orgRow } = await admin.from('organizations').select('sp_integration_key, sp_last_sync, sp_customer_no').eq('id', orgId).single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integrationKey = ((orgRow as any)?.sp_integration_key as string | null)?.trim() || null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastSync = forceFullSync ? null : ((orgRow as any)?.sp_last_sync as string | null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spCustomerNo = (orgRow as any)?.sp_customer_no as string | null;

    if (!integrationKey) {
      return NextResponse.json({ error: 'Ingen Serviceprotokoll-nyckel konfigurerad' }, { status: 400 });
    }

    const tokenResult = await getSPToken(integrationKey);
    if ('error' in tokenResult) return NextResponse.json({ error: `Kunde inte autentisera mot Serviceprotokoll: ${tokenResult.error}` }, { status: 400 });
    const token = tokenResult.token;

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
            status: 'i_lager',
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

      // Bulk insert new customers in batches of 50 — smaller batches avoid PostgREST statement timeout
      const BATCH = 50;
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

    // ── Import machines linked to the org's own SP customer number ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let debug: Record<string, any> = { spCustomerNo, rawCount: 0, firstObject: null };
    if (spCustomerNo) {
      try {
        const url = `${SP_API}/ServiceObject/Get`;
        const customerObjects = await fetchAllPages(url, token, 20, undefined, `&request.customerNo=${encodeURIComponent(spCustomerNo)}&request.includeCustomInfo=true`);
        debug.rawCount = customerObjects.length;

        // Diagnose: if SP returned 0 objects, test both with and without customerNo
        if (customerObjects.length === 0) {
          try {
            const diagRes = await spGet(
              `${url}?request.skip=0&request.take=5&request.customerNo=${encodeURIComponent(spCustomerNo)}`,
              token,
            );
            debug.diagStatus = diagRes.status;
            debug.diagBody = (await diagRes.text()).slice(0, 800);
          } catch (diagErr) {
            debug.diagStatus = 'fetch-error';
            debug.diagBody = diagErr instanceof Error ? diagErr.message : String(diagErr);
          }
          // Also test without customerNo — if this works, the problem is specific to customerNo=1000
          try {
            const diagBaseRes = await spGet(`${url}?request.skip=0&request.take=3`, token);
            debug.diagBaseStatus = diagBaseRes.status;
            debug.diagBaseBody = (await diagBaseRes.text()).slice(0, 400);
          } catch (diagBaseErr) {
            debug.diagBaseStatus = 'fetch-error';
            debug.diagBaseBody = diagBaseErr instanceof Error ? diagBaseErr.message : String(diagBaseErr);
          }
        }
        const first = customerObjects[0];
        debug.firstObjectKeys = first ? Object.keys(first) : [];
        debug.firstSpId = first ? String(first.Id ?? first.id ?? first.UniqueID ?? first.ObjectId ?? '') : '';
        debug.firstName = first ? String(first.Description ?? first.Name ?? first.Designation ?? '') : '';

        // Bulk-fetch existing sp_ids and their row ids — one query instead of one per machine
        const { data: existingRows } = await admin.from('machines')
          .select('id, sp_id')
          .eq('organization_id', orgId)
          .not('sp_id', 'is', null);
        const existingSpIdMap = new Map((existingRows ?? []).map((r) => [String(r.sp_id), r.id]));

        let skippedNoId = 0;
        let skippedExists = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toInsert: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toUpdateSpecs: { id: string; specs: Record<string, any> }[] = [];
        for (const obj of customerObjects) {
          const spId = String(obj.Id ?? obj.id ?? obj.UniqueID ?? obj.ObjectId ?? '');
          if (!spId) { skippedNoId++; continue; }
          const specs = parseSpSpecs(obj);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const definedSpecs = Object.fromEntries(Object.entries(specs).filter(([, v]) => v !== undefined)) as Record<string, any>;
          if (existingSpIdMap.has(spId)) {
            // Update tech specs on already-imported machines
            toUpdateSpecs.push({ id: existingSpIdMap.get(spId)!, specs: definedSpecs });
            skippedExists++;
            continue;
          }
          toInsert.push({
            organization_id: orgId,
            name: obj.Description ?? obj.Name ?? obj.Designation ?? obj.Model ?? 'Okänd maskin',
            brand: obj.Brand ?? obj.Manufacturer ?? '',
            model: obj.Model ?? obj.Type ?? '',
            serial_number: obj.SerialNo ?? obj.SerialNumber ?? '',
            internal_code: obj.MachineNo ?? obj.ObjectNo ?? obj.CustomerObjectNo ?? '',
            fuel_type: 'okand',
            status: 'i_lager',
            sp_id: spId,
            ...definedSpecs,
            category: definedSpecs.category ?? 'ovrig',
          });
        }
        // Bulk insert new machines in batches of 100
        for (let i = 0; i < toInsert.length; i += 100) {
          const { error } = await admin.from('machines').insert(toInsert.slice(i, i + 100));
          if (!error) machinesImported += toInsert.slice(i, i + 100).length;
          else errors.push(`SP-maskiner batch ${i}: ${error.message}`);
        }
        // Update tech specs on existing machines in batches of 100
        for (let i = 0; i < toUpdateSpecs.length; i += 100) {
          const batch = toUpdateSpecs.slice(i, i + 100);
          await Promise.all(batch.map(({ id, specs }) => {
            const updates = Object.fromEntries(Object.entries(specs).filter(([, v]) => v !== undefined));
            if (Object.keys(updates).length === 0) return Promise.resolve();
            return admin.from('machines').update(updates).eq('id', id);
          }));
        }
        // Remove machines no longer linked to this org's customer number in SP.
        // Guard 1: never delete if SP returned 0 objects (treat as fetch failure).
        // Guard 2: never delete if SP returned fewer than 50% of stored count (partial fetch / SP anomaly).
        const currentSpIds = new Set(
          customerObjects
            .map((obj) => String(obj.Id ?? obj.id ?? obj.UniqueID ?? obj.ObjectId ?? ''))
            .filter(Boolean),
        );
        const storedCount = existingSpIdMap.size;
        const spReturnedEnough = currentSpIds.size > 0 &&
          (storedCount === 0 || currentSpIds.size >= storedCount * 0.5);
        const toRemoveIds = spReturnedEnough
          ? [...existingSpIdMap.entries()]
              .filter(([spId]) => !currentSpIds.has(spId))
              .map(([, id]) => id)
          : [];
        if (!spReturnedEnough && currentSpIds.size > 0) {
          errors.push(`Borttagning hoppades över: SP returnerade ${currentSpIds.size} av ${storedCount} maskiner (under 50%)`);
        }
        let removedMachines = 0;
        if (toRemoveIds.length > 0) {
          // Only delete machines with no orders to avoid orphaning data
          const { data: withOrders } = await admin.from('orders')
            .select('machine_id')
            .in('machine_id', toRemoveIds);
          const hasOrders = new Set((withOrders ?? []).map((r) => r.machine_id));
          const safeToRemove = toRemoveIds.filter((id) => !hasOrders.has(id));
          if (safeToRemove.length > 0) {
            const { error: delErr } = await admin.from('machines').delete().in('id', safeToRemove);
            if (delErr) errors.push(`Borttagning: ${delErr.message}`);
            else removedMachines = safeToRemove.length;
          }
        }
        debug.skippedNoId = skippedNoId;
        debug.skippedExists = skippedExists;
        debug.removedMachines = removedMachines;
        debug.firstCustomInfo = first?.CustomInfo ?? first?.CustomFields ?? first?.Properties ?? null;
        debug.firstParsedSpecs = first ? parseSpSpecs(first) : null;
        // Full raw dump of first object (all fields including nested) to identify CustomInfo key
        debug.firstRawFull = first ? JSON.stringify(first).slice(0, 2000) : null;
        // Find which top-level field contains a year value across all machines
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yearFields: Record<string, any> = {};
        for (const o of customerObjects) {
          for (const [k, v] of Object.entries(o)) {
            if (typeof v === 'number' && v > 1900 && v < 2100) yearFields[k] = v;
            if (typeof v === 'string' && /^(19|20)\d{2}$/.test(v.trim())) yearFields[k] = v;
          }
        }
        debug.yearFields = yearFields;
      } catch (e) {
        errors.push(`SP kundmaskiner: ${e instanceof Error ? e.message : String(e)}`);
        debug.error = e instanceof Error ? e.message : String(e);
      }
    }

    // Update last sync timestamp
    await admin.from('organizations').update({ sp_last_sync: new Date().toISOString() }).eq('id', orgId);

    return NextResponse.json({ machinesImported, customersImported, errors, debug });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Okänt fel' }, { status: 500 });
  }
}

// Cron-triggered version — Vercel sends Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  console.log('[SP-sync] Cron triggered at', new Date().toISOString());

  const auth = request.headers.get('authorization') ?? '';
  const secret = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    console.error('[SP-sync] Unauthorized — CRON_SECRET mismatch');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orgs, error: orgsError } = await admin.from('organizations').select('id, sp_integration_key, sp_customer_no, name').not('sp_integration_key' as any, 'is', null);

  if (orgsError) {
    console.error('[SP-sync] Failed to fetch organizations:', orgsError.message);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  console.log(`[SP-sync] Found ${orgs?.length ?? 0} organization(s) with SP integration`);

  let total = { machines: 0, customers: 0, orgs: 0, errors: 0 };

  for (const org of orgs ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key = (org as any).sp_integration_key as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgName = (org as any).name ?? org.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orgSpCustomerNo = (org as any).sp_customer_no as string | null;
    if (!key) continue;

    console.log(`[SP-sync] Syncing org: ${orgName} (${org.id})`);

    const tokenResult = await getSPToken(key);
    if ('error' in tokenResult) {
      console.error(`[SP-sync] Could not get SP token for org ${orgName}: ${tokenResult.error}`);
      total.errors++;
      continue;
    }
    const token = tokenResult.token;

    try {
      // machines
      const serviceObjects = await fetchAllPages(`${SP_API}/ServiceObject/Get`, token);
      console.log(`[SP-sync] ${orgName}: fetched ${serviceObjects.length} service objects from SP`);

      const rentable = serviceObjects.filter((obj) => {
        const tags: string[] = obj.Tags ?? obj.tags ?? [];
        return tags.some((t: string) => t.toLowerCase() === RENTABLE_TAG);
      });
      console.log(`[SP-sync] ${orgName}: ${rentable.length} tagged as '${RENTABLE_TAG}'`);

      // Bulk-fetch existing sp_ids to avoid N+1 queries
      const { data: rentableExistingRows } = await admin.from('machines')
        .select('id, sp_id')
        .eq('organization_id', org.id)
        .not('sp_id', 'is', null);
      const rentableExistingSet = new Set((rentableExistingRows ?? []).map((r) => String(r.sp_id)));

      let newMachines = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rentableToInsert: any[] = [];
      for (const obj of rentable) {
        const spId = String(obj.Id ?? obj.id ?? obj.SerialNo ?? '');
        if (!spId || rentableExistingSet.has(spId)) continue;
        const rentableSpecs = parseSpSpecs(obj);
        rentableToInsert.push({
          organization_id: org.id,
          name: obj.Name ?? obj.Designation ?? obj.Model ?? 'Okänd maskin',
          brand: obj.Brand ?? obj.Manufacturer ?? '',
          model: obj.Model ?? obj.Type ?? '',
          serial_number: obj.SerialNo ?? obj.SerialNumber ?? '',
          internal_code: obj.MachineNo ?? obj.ObjectNo ?? obj.CustomerObjectNo ?? '',
          category: rentableSpecs.category ?? 'ovrig',
          fuel_type: 'okand',
          status: 'i_lager',
          sp_id: spId,
          ...rentableSpecs,
        });
      }
      for (let i = 0; i < rentableToInsert.length; i += 100) {
        const { error } = await admin.from('machines').insert(rentableToInsert.slice(i, i + 100));
        if (!error) { newMachines += rentableToInsert.slice(i, i + 100).length; total.machines += rentableToInsert.slice(i, i + 100).length; }
        else console.error(`[SP-sync] ${orgName}: rentable insert batch ${i}: ${error.message}`);
      }
      console.log(`[SP-sync] ${orgName}: ${newMachines} new machines inserted`);

      // customers — use lastSync for incremental fetch, bulk insert/update to avoid N+1 timeout
      const { data: orgLastSyncRow } = await admin.from('organizations').select('sp_last_sync').eq('id', org.id).single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgLastSync = (orgLastSyncRow as any)?.sp_last_sync as string | null;
      const [customers, facilities] = await Promise.all([
        fetchAllPages(`${SP_API}/Customer/Get`, token, 200),
        fetchAllPages(`${SP_API}/Facility/Get`, token, 50).catch(() => []),
      ]);
      console.log(`[SP-sync] ${orgName}: fetched ${customers.length} customers, ${facilities.length} facilities`);

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

      const cronRecords = customers
        .filter((c: { Name: string; UniqueID: unknown; CustomerNo: unknown }) => c.Name && (c.UniqueID ?? c.CustomerNo))
        .map((c) => {
          const spId = String(c.UniqueID ?? c.CustomerNo);
          const customerNoKey = c.CustomerNo ? String(c.CustomerNo) : null;
          const customerFacilities = customerNoKey ? (facilityByCustomer[customerNoKey] ?? []) : [];
          const allContacts = (customerFacilities as { contacts?: { name: string; phone: string; email: string; title: string }[] }[])
            .flatMap(f => f.contacts ?? []);
          return {
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
        });

      // Bulk-fetch all existing sp_ids for this org
      const cronExistingAll: { id: string; sp_id: string }[] = [];
      let cronSkip = 0;
      while (true) {
        const { data: batch } = await admin.from('customers')
          .select('id, sp_id').eq('organization_id', org.id).not('sp_id', 'is', null)
          .range(cronSkip, cronSkip + 999);
        if (!batch || batch.length === 0) break;
        cronExistingAll.push(...batch as { id: string; sp_id: string }[]);
        if (batch.length < 1000) break;
        cronSkip += 1000;
      }
      const cronExistingMap = new Map(cronExistingAll.map(r => [String(r.sp_id), String(r.id)]));

      const cronToInsert = cronRecords.filter(r => !cronExistingMap.has(r.sp_id));
      const cronToUpdate = cronRecords
        .filter(r => cronExistingMap.has(r.sp_id))
        .map(r => ({ ...r, id: cronExistingMap.get(r.sp_id)! }));

      const CBATCH = 50;
      for (let i = 0; i < cronToInsert.length; i += CBATCH) {
        const { error } = await admin.from('customers').insert(cronToInsert.slice(i, i + CBATCH));
        if (!error) total.customers += cronToInsert.slice(i, i + CBATCH).length;
      }
      for (let i = 0; i < cronToUpdate.length; i += CBATCH) {
        const batch = cronToUpdate.slice(i, i + CBATCH).map(r => ({
          id: r.id, company_name: r.company_name, org_number: r.org_number,
          email: r.email, phone: r.phone, contact_person: r.contact_person,
          invoice_address: r.invoice_address, delivery_address: r.delivery_address,
          fortnox_customer_number: r.fortnox_customer_number,
          contacts: r.contacts, facilities: r.facilities, sp_id: r.sp_id,
          organization_id: r.organization_id,
        }));
        const { error } = await admin.from('customers').upsert(batch, { onConflict: 'id' });
        if (!error) total.customers += batch.length;
      }
      console.log(`[SP-sync] ${orgName}: ${cronToInsert.length} new + ${cronToUpdate.length} updated customers`);

      // Import machines linked to the org's own SP customer number
      if (orgSpCustomerNo) {
        const customerObjects = await fetchAllPages(
          `${SP_API}/ServiceObject/Get`,
          token,
          20,
          undefined,
          `&request.customerNo=${encodeURIComponent(orgSpCustomerNo)}&request.includeCustomInfo=true`,
        );
        // Bulk-fetch existing sp_ids for this org
        const { data: existingMachineRows } = await admin.from('machines')
          .select('id, sp_id')
          .eq('organization_id', org.id)
          .not('sp_id', 'is', null);
        const existingMachineMap = new Map((existingMachineRows ?? []).map((r) => [String(r.sp_id), r.id]));

        let newCustomerMachines = 0;
        for (const obj of customerObjects) {
          const spId = String(obj.Id ?? obj.id ?? obj.UniqueID ?? '');
          if (!spId) continue;
          const specs = parseSpSpecs(obj);
          const definedSpecs = Object.fromEntries(Object.entries(specs).filter(([, v]) => v !== undefined));
          if (existingMachineMap.has(spId)) {
            // Update tech specs for existing machines
            if (Object.keys(definedSpecs).length > 0) {
              await admin.from('machines').update(definedSpecs).eq('id', existingMachineMap.get(spId)!);
            }
          } else {
            await admin.from('machines').insert({
              organization_id: org.id,
              name: obj.Description ?? obj.Name ?? obj.Designation ?? obj.Model ?? 'Okänd maskin',
              brand: obj.Brand ?? obj.Manufacturer ?? '',
              model: obj.Model ?? obj.Type ?? '',
              serial_number: obj.SerialNo ?? obj.SerialNumber ?? '',
              internal_code: obj.MachineNo ?? obj.ObjectNo ?? obj.CustomerObjectNo ?? '',
              fuel_type: 'okand',
              status: 'i_lager',
              sp_id: spId,
              ...definedSpecs,
              category: definedSpecs.category ?? 'ovrig',
            });
            newCustomerMachines++;
            total.machines++;
          }
        }
        // Remove machines no longer linked to this org's customer number in SP.
        // Guard 1: never delete if SP returned 0 objects (treat as fetch failure).
        // Guard 2: never delete if SP returned fewer than 50% of stored count (partial fetch / SP anomaly).
        const currentSpIdsCron = new Set(
          customerObjects
            .map((obj) => String(obj.Id ?? obj.id ?? obj.UniqueID ?? ''))
            .filter(Boolean),
        );
        const storedCronCount = existingMachineMap.size;
        const cronReturnedEnough = currentSpIdsCron.size > 0 &&
          (storedCronCount === 0 || currentSpIdsCron.size >= storedCronCount * 0.5);
        const toRemoveCron = cronReturnedEnough
          ? [...existingMachineMap.entries()]
              .filter(([spId]) => !currentSpIdsCron.has(spId))
              .map(([, id]) => id)
          : [];
        if (toRemoveCron.length > 0) {
          const { data: withOrdersCron } = await admin.from('orders').select('machine_id').in('machine_id', toRemoveCron);
          const hasOrdersCron = new Set((withOrdersCron ?? []).map((r) => r.machine_id));
          const safeToRemoveCron = toRemoveCron.filter((id) => !hasOrdersCron.has(id));
          if (safeToRemoveCron.length > 0) {
            await admin.from('machines').delete().in('id', safeToRemoveCron);
            console.log(`[SP-sync] ${orgName}: removed ${safeToRemoveCron.length} machines no longer in SP`);
          }
        }
        console.log(`[SP-sync] ${orgName}: ${newCustomerMachines} new SP customer machines inserted`);
      }

      await admin.from('organizations').update({ sp_last_sync: new Date().toISOString() }).eq('id', org.id);
      total.orgs++;
      console.log(`[SP-sync] ${orgName}: sync complete ✓`);

    } catch (err) {
      console.error(`[SP-sync] Error syncing org ${orgName}:`, err instanceof Error ? err.message : err);
      total.errors++;
    }
  }

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`[SP-sync] Done in ${elapsed}s — orgs: ${total.orgs}, machines: ${total.machines}, customers: ${total.customers}, errors: ${total.errors}`);

  return NextResponse.json({ ok: true, elapsed: `${elapsed}s`, ...total });
}
