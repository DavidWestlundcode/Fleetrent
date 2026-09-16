-- ============================================================
-- FleetOS – "Byt bolag": organization_members
-- Kör i Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Säkert att köra flera gånger (CREATE OR REPLACE / IF NOT EXISTS / ON CONFLICT)
--
-- VIKTIGT: Den här migrationen rör INTE get_org_id() eller någon
-- befintlig RLS-policy (org_isolation på machines/customers/templates/
-- articles/orders/order_events/service_records, org_admin_only på
-- integrations, org_select/org_update på organizations,
-- audit_log_select_own_org, eller storage-policyerna på machine-photos).
-- profiles.organization_id behåller exakt samma betydelse som idag:
-- "det här kontots just nu AKTIVA organisation." Det som läggs till är
-- bara en TABELL som beskriver vilka organisationer ett konto FÅR
-- växla mellan — själva växlingen sker via /api/switch-organization,
-- som går via service-role för att komma förbi protect_profile_fields-
-- triggern (samma skydd som redan hindrar en användare från att själv
-- sätta sin egen organization_id/role/is_super_admin).
-- ============================================================


-- ============================================================
-- 1. organization_members
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, organization_id)
);

-- PK (user_id, organization_id) redan indexerar "vilka orgs får jag växla till".
-- Lägg till omvänd riktning för teammedlemslistan ("vem har tillgång till org X").
CREATE INDEX IF NOT EXISTS organization_members_org_idx
  ON organization_members (organization_id);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- En användare får se: (a) sina egna medlemskapsrader (oavsett org), så
-- appen kan lista vilka organisationer kontot får växla till, och (b)
-- alla medlemskapsrader för sin JUST NU AKTIVA org, så att inställnings-
-- sidans teammedlemslista kan visa vilka som har tillgång till den org
-- man står i. get_org_id() ger bara tillbaka anroparens EGEN aktiva org,
-- så (b) kan aldrig läcka en annan organisations medlemslista.
DROP POLICY IF EXISTS "org_members_select" ON organization_members;
CREATE POLICY "org_members_select" ON organization_members
  FOR SELECT
  USING (user_id = auth.uid() OR organization_id = get_org_id());

-- Ingen INSERT/UPDATE/DELETE-policy alls för anon/authenticated — speglar
-- audit_log-mönstret som redan finns i projektet. Medlemskapsrader skrivs
-- bara av: handle_new_user-triggern nedan (SECURITY DEFINER), eller en
-- service-role-klient (invite-user / create-user / ensure-org /
-- auth/callback / switch-organization).


-- ============================================================
-- 2. Backfill: alla profiler som redan har en org har redan implicit
--    medlemskap i den.
-- ============================================================
INSERT INTO organization_members (user_id, organization_id)
SELECT id, organization_id FROM profiles WHERE organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;


-- ============================================================
-- 3. handle_new_user(): ge även medlemskap när en profils org sätts vid
--    kontoskapande (invite-user/create-user-flödena).
--
--    Baserad på den version som faktiskt är live idag (fix_invite_trigger.sql,
--    2026-06-12 — senare än org_settings_migration.sql 2026-05-18), som
--    läser BÅDE role och organization_id från raw_user_meta_data. Enda
--    ändringen mot den versionen är organization_members-inserten sist.
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  new_org_id := CASE
    WHEN NEW.raw_user_meta_data->>'organization_id' IS NOT NULL
    THEN (NEW.raw_user_meta_data->>'organization_id')::uuid
    ELSE NULL
  END;

  INSERT INTO profiles (id, full_name, organization_id, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO NOTHING;

  IF new_org_id IS NOT NULL THEN
    INSERT INTO organization_members (user_id, organization_id)
    VALUES (NEW.id, new_org_id)
    ON CONFLICT (user_id, organization_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 4. VERIFIERING
-- ============================================================

-- RLS ska vara påslaget
SELECT tablename, rowsecurity AS rls_enabled FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'organization_members';

-- Ska bara finnas EN policy (SELECT) — ingen INSERT/UPDATE/DELETE
SELECT policyname, cmd, qual FROM pg_policies
WHERE tablename = 'organization_members';

-- Antal rader efter backfill
SELECT COUNT(*) AS backfilled_rows FROM organization_members;

-- Sanity: alla profiler med en org ska nu ha en matchande medlemskapsrad.
-- Ska ge 0 rader.
SELECT p.id, p.organization_id
FROM profiles p
LEFT JOIN organization_members om
  ON om.user_id = p.id AND om.organization_id = p.organization_id
WHERE p.organization_id IS NOT NULL AND om.user_id IS NULL;
