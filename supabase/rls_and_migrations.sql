-- ============================================================
-- FleetRent – RLS-fix & saknade kolumner
-- Kör i Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Säkert att köra flera gånger (IF NOT EXISTS / OR REPLACE)
-- ============================================================


-- ============================================================
-- 1. SAKNADE KOLUMNER (tillagda under tidigare sessioner)
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS charge_weekends     BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS order_reference     TEXT     NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sent_to_accounting  BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fortnox_order_number TEXT,
  ADD COLUMN IF NOT EXISTS order_articles      JSONB    NOT NULL DEFAULT '[]';

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS fortnox_customer_number TEXT,
  ADD COLUMN IF NOT EXISTS contacts               JSONB    NOT NULL DEFAULT '[]';


-- ============================================================
-- 2. INTEGRATIONS-TABELL (Fortnox OAuth-tokens)
-- ============================================================

CREATE TABLE IF NOT EXISTS integrations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider        TEXT        NOT NULL,
  access_token    TEXT        NOT NULL,
  refresh_token   TEXT        NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Bara admins i samma org kan se/hantera integrationer
DROP POLICY IF EXISTS "org_admin_only" ON integrations;
CREATE POLICY "org_admin_only" ON integrations
  FOR ALL
  USING (
    organization_id = get_org_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    organization_id = get_org_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );


-- ============================================================
-- 3. FÖRSTÄRK BEFINTLIGA RLS-POLICIES MED EXPLICIT WITH CHECK
--    (skyddar INSERT-operationer extra tydligt)
-- ============================================================

-- Machines
DROP POLICY IF EXISTS "org_isolation" ON machines;
CREATE POLICY "org_isolation" ON machines
  FOR ALL
  USING     (organization_id = get_org_id())
  WITH CHECK(organization_id = get_org_id());

-- Customers
DROP POLICY IF EXISTS "org_isolation" ON customers;
CREATE POLICY "org_isolation" ON customers
  FOR ALL
  USING     (organization_id = get_org_id())
  WITH CHECK(organization_id = get_org_id());

-- Orders
DROP POLICY IF EXISTS "org_isolation" ON orders;
CREATE POLICY "org_isolation" ON orders
  FOR ALL
  USING     (organization_id = get_org_id())
  WITH CHECK(organization_id = get_org_id());

-- Order events
DROP POLICY IF EXISTS "org_isolation" ON order_events;
CREATE POLICY "org_isolation" ON order_events
  FOR ALL
  USING     (organization_id = get_org_id())
  WITH CHECK(organization_id = get_org_id());

-- Templates
DROP POLICY IF EXISTS "org_isolation" ON templates;
CREATE POLICY "org_isolation" ON templates
  FOR ALL
  USING     (organization_id = get_org_id())
  WITH CHECK(organization_id = get_org_id());

-- Articles
DROP POLICY IF EXISTS "org_isolation" ON articles;
CREATE POLICY "org_isolation" ON articles
  FOR ALL
  USING     (organization_id = get_org_id())
  WITH CHECK(organization_id = get_org_id());

-- Service records
DROP POLICY IF EXISTS "org_isolation" ON service_records;
CREATE POLICY "org_isolation" ON service_records
  FOR ALL
  USING     (organization_id = get_org_id())
  WITH CHECK(organization_id = get_org_id());


-- ============================================================
-- 4. VERIFIERING – ska visa grön status på alla rader
-- ============================================================

SELECT
  tablename,
  rowsecurity AS rls_enabled,
  (
    SELECT COUNT(*) FROM pg_policies
    WHERE pg_policies.tablename = pg_tables.tablename
      AND schemaname = 'public'
  ) AS policy_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'machines', 'customers', 'orders', 'order_events',
    'templates', 'articles', 'service_records', 'integrations',
    'organizations', 'profiles'
  )
ORDER BY tablename;
