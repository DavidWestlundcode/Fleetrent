-- ============================================================
-- FleetRent Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Organizations (one per company)
CREATE TABLE IF NOT EXISTS organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  role            TEXT NOT NULL DEFAULT 'admin',
  full_name       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile row on every new signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS helper: returns current user's organization_id
CREATE OR REPLACE FUNCTION get_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

-- ---- RLS: organizations & profiles ----
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON organizations FOR SELECT USING (id = get_org_id());
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (id = get_org_id());

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile" ON profiles FOR ALL USING (id = auth.uid());

-- ============================================================
-- Machines
-- ============================================================
CREATE TABLE IF NOT EXISTS machines (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  model               TEXT NOT NULL DEFAULT '',
  brand               TEXT NOT NULL DEFAULT '',
  serial_number       TEXT NOT NULL DEFAULT '',
  registration_number TEXT NOT NULL DEFAULT '',
  internal_code       TEXT NOT NULL DEFAULT '',
  category            TEXT NOT NULL,
  capacity            NUMERIC NOT NULL DEFAULT 0,
  fuel_type           TEXT NOT NULL,
  lift_height         NUMERIC,
  build_height        NUMERIC,
  fork_length         NUMERIC,
  free_lift           NUMERIC,
  max_reach           NUMERIC,
  dig_depth           NUMERIC,
  bucket_volume       NUMERIC,
  working_weight      NUMERIC,
  engine_power        NUMERIC,
  year                INTEGER NOT NULL DEFAULT 0,
  operating_hours     NUMERIC NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'i_lager',
  images              TEXT[] NOT NULL DEFAULT '{}',
  documents           TEXT[] NOT NULL DEFAULT '{}',
  notes               TEXT NOT NULL DEFAULT '',
  location            TEXT NOT NULL DEFAULT '',
  qr_code             TEXT NOT NULL DEFAULT '',
  purchase_price      NUMERIC NOT NULL DEFAULT 0,
  purchase_date       TEXT NOT NULL DEFAULT '',
  leasing_cost        NUMERIC NOT NULL DEFAULT 0,
  financing_cost      NUMERIC NOT NULL DEFAULT 0,
  insurance_cost      NUMERIC NOT NULL DEFAULT 0,
  service_cost        NUMERIC NOT NULL DEFAULT 0,
  other_costs         NUMERIC NOT NULL DEFAULT 0,
  total_revenue       NUMERIC NOT NULL DEFAULT 0,
  total_rentals       INTEGER NOT NULL DEFAULT 0,
  total_rental_days   INTEGER NOT NULL DEFAULT 0,
  total_service_cost  NUMERIC NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON machines FOR ALL USING (organization_id = get_org_id());

-- ============================================================
-- Customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name     TEXT NOT NULL,
  org_number       TEXT NOT NULL DEFAULT '',
  contact_person   TEXT NOT NULL DEFAULT '',
  phone            TEXT NOT NULL DEFAULT '',
  email            TEXT NOT NULL DEFAULT '',
  invoice_address  TEXT NOT NULL DEFAULT '',
  delivery_address TEXT NOT NULL DEFAULT '',
  notes            TEXT NOT NULL DEFAULT '',
  credit_limit     NUMERIC NOT NULL DEFAULT 0,
  total_spent      NUMERIC NOT NULL DEFAULT 0,
  active_orders    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON customers FOR ALL USING (organization_id = get_org_id());

-- ============================================================
-- Price templates
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  description              TEXT NOT NULL DEFAULT '',
  category                 TEXT NOT NULL,
  capacity_min             NUMERIC NOT NULL DEFAULT 0,
  capacity_max             NUMERIC NOT NULL DEFAULT 0,
  daily_price              NUMERIC NOT NULL DEFAULT 0,
  weekly_price             NUMERIC NOT NULL DEFAULT 0,
  monthly_price            NUMERIC NOT NULL DEFAULT 0,
  long_term_daily_price    NUMERIC NOT NULL DEFAULT 0,
  long_term_weekly_price   NUMERIC NOT NULL DEFAULT 0,
  long_term_monthly_price  NUMERIC NOT NULL DEFAULT 0,
  insurance_daily_price    NUMERIC NOT NULL DEFAULT 0,
  insurance_weekly_price   NUMERIC NOT NULL DEFAULT 0,
  insurance_monthly_price  NUMERIC NOT NULL DEFAULT 0,
  start_fee                NUMERIC NOT NULL DEFAULT 0,
  transport_cost           NUMERIC NOT NULL DEFAULT 0,
  deposit                  NUMERIC NOT NULL DEFAULT 0,
  min_rental_days          INTEGER NOT NULL DEFAULT 0,
  standard_terms           TEXT NOT NULL DEFAULT '',
  internal_note            TEXT NOT NULL DEFAULT '',
  rental_article_id        UUID,
  insurance_article_id     UUID,
  transport_article_id     UUID,
  deposit_article_id       UUID,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON templates FOR ALL USING (organization_id = get_org_id());

-- ============================================================
-- Articles
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  article_number  TEXT NOT NULL DEFAULT '',
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  type            TEXT NOT NULL,
  unit            TEXT NOT NULL,
  default_price   NUMERIC NOT NULL DEFAULT 0,
  account_number  TEXT NOT NULL DEFAULT '',
  vat_rate        NUMERIC NOT NULL DEFAULT 25,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON articles FOR ALL USING (organization_id = get_org_id());

-- ============================================================
-- Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_number          TEXT NOT NULL,
  machine_id            UUID NOT NULL REFERENCES machines(id),
  customer_id           UUID NOT NULL REFERENCES customers(id),
  template_id           UUID REFERENCES templates(id),
  start_date            TEXT NOT NULL,
  planned_return_date   TEXT,
  actual_return_date    TEXT,
  daily_price           NUMERIC NOT NULL DEFAULT 0,
  weekly_price          NUMERIC NOT NULL DEFAULT 0,
  monthly_price         NUMERIC NOT NULL DEFAULT 0,
  transport_cost        NUMERIC NOT NULL DEFAULT 0,
  deposit               NUMERIC NOT NULL DEFAULT 0,
  total_price           NUMERIC NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'aktiv',
  internal_notes        TEXT NOT NULL DEFAULT '',
  customer_notes        TEXT NOT NULL DEFAULT '',
  accessories           TEXT[] NOT NULL DEFAULT '{}',
  insurance_cost        NUMERIC,
  return_condition      TEXT,
  return_notes          TEXT,
  return_images         TEXT[] NOT NULL DEFAULT '{}',
  return_operating_hours NUMERIC,
  rental_article_id     UUID,
  insurance_article_id  UUID,
  transport_article_id  UUID,
  deposit_article_id    UUID,
  open_ended            BOOLEAN NOT NULL DEFAULT false,
  insurance_monthly_rate NUMERIC,
  created_by            UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON orders FOR ALL USING (organization_id = get_org_id());

-- ============================================================
-- Order events (audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id         UUID REFERENCES auth.users(id)
);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON order_events FOR ALL USING (organization_id = get_org_id());

-- ============================================================
-- Service records
-- ============================================================
CREATE TABLE IF NOT EXISTS service_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  machine_id      UUID NOT NULL REFERENCES machines(id),
  type            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'planerad',
  description     TEXT NOT NULL DEFAULT '',
  technician_name TEXT NOT NULL DEFAULT '',
  start_date      TEXT NOT NULL,
  completed_date  TEXT,
  cost            NUMERIC NOT NULL DEFAULT 0,
  notes           TEXT NOT NULL DEFAULT '',
  images          TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON service_records FOR ALL USING (organization_id = get_org_id());
