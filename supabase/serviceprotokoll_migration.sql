-- Serviceprotokoll integration columns
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS sp_integration_key TEXT,
  ADD COLUMN IF NOT EXISTS sp_last_sync       TIMESTAMPTZ;

-- sp_id on machines — links machine back to Serviceprotokoll object
ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS sp_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS machines_org_sp_id ON machines (organization_id, sp_id)
  WHERE sp_id IS NOT NULL;

-- sp_id on customers — links customer back to Serviceprotokoll customer
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS sp_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS customers_org_sp_id ON customers (organization_id, sp_id)
  WHERE sp_id IS NOT NULL;

-- sp_machines on customers — machines owned by this customer in Serviceprotokoll
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS sp_machines JSONB NOT NULL DEFAULT '[]'::jsonb;

-- sp_customer_no on organizations — the org's own customer number in SP, used to import their machines
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS sp_customer_no TEXT;

-- Cost center per user profile — sent to Fortnox when creating orders
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cost_center TEXT;

-- Fix SP-imported machines that were incorrectly set to 'el' — reset to 'okand' (unknown)
UPDATE machines
  SET fuel_type = 'okand'
  WHERE sp_id IS NOT NULL
    AND fuel_type = 'el';
