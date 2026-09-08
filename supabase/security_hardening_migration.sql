-- ============================================================
-- FleetRent – Säkerhetshärdning (security audit 2026-09-05)
-- Kör i Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Säkert att köra flera gånger (CREATE OR REPLACE / IF NOT EXISTS / DROP IF EXISTS)
-- ============================================================


-- ============================================================
-- 1. SKYDDA profiles: hindra en användare från att själv ändra
--    role / organization_id / is_super_admin på sin egen rad.
--
--    RLS-policyn "own_profile" (FOR ALL USING (id = auth.uid()))
--    har ingen WITH CHECK som begränsar VILKA kolumner som får
--    ändras — bara att raden fortfarande tillhör en själv. Det
--    gjorde det möjligt att via en vanlig REST-PATCH (samma
--    anon-nyckel + JWT som redan finns i webbläsaren) sätta sin
--    egen roll till 'admin', eller byta organization_id till en
--    helt annan organisation → full läs/skriv på den orgens data.
--
--    Lösningen är en trigger snarare än enbart en RLS-policy,
--    eftersom en trigger inte går att kringgå oavsett vilken
--    policy som matchar — bara service-role (adminklienten som
--    redan används av invite-user/create-user/update-member för
--    att sätta dessa fält korrekt) får ändra dem.
-- ============================================================

CREATE OR REPLACE FUNCTION protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service-role (adminklienten) är den enda som får ändra dessa fält.
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role := OLD.role;
    END IF;
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      NEW.organization_id := OLD.organization_id;
    END IF;
    IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
      NEW.is_super_admin := OLD.is_super_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields_trigger ON profiles;
CREATE TRIGGER protect_profile_fields_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_fields();


-- ============================================================
-- 2. organizations: bara admins får redigera företagsuppgifter.
--    Tidigare policy tillät ALLA medlemmar i orgen (även t.ex.
--    'verkstad'/'saljare') att ändra företagsnamn, adress och
--    standardvillkor — inte bara läsa/uppdatera sin egen org,
--    utan att någon rollkontroll fanns alls.
-- ============================================================

DROP POLICY IF EXISTS "org_update" ON organizations;
CREATE POLICY "org_update" ON organizations
  FOR UPDATE
  USING (
    id = get_org_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    id = get_org_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );


-- ============================================================
-- 3. audit_log: spårbar logg för säkerhetskritiska händelser som
--    idag inte loggas alls (roll-/användarändringar, integrations-
--    anslutning/frånkoppling, och särskilt super-admins ändringar
--    av en organisations plan/gränser via /api/admin/update-org).
--
--    Skrivs ENDAST server-side via service-role — RLS tillåter
--    ingen INSERT/UPDATE/DELETE från vanliga användare alls, bara
--    SELECT av sin egen orgs rader (så en admin kan se sin egen
--    orgs logg i appen om ni bygger ett UI för det senare).
--    Super-admin-händelser har organization_id = target-orgen,
--    men actor_organization_id visar vem som faktiskt gjorde det.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID        REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id           UUID        REFERENCES auth.users(id),
  actor_organization_id   UUID        REFERENCES organizations(id),
  action                  TEXT        NOT NULL,
  target_table            TEXT,
  target_id               TEXT,
  metadata                JSONB       NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_org_idx ON audit_log (organization_id, created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Vanliga användare får bara LÄSA sin egen orgs händelser (om ni bygger UI för detta).
-- Ingen INSERT/UPDATE/DELETE-policy skapas alls => omöjligt för anon/authenticated
-- att skriva eller manipulera loggen. Endast service-role (som kringgår RLS) skriver.
DROP POLICY IF EXISTS "audit_log_select_own_org" ON audit_log;
CREATE POLICY "audit_log_select_own_org" ON audit_log
  FOR SELECT
  USING (organization_id = get_org_id());


-- ============================================================
-- 4. VERIFIERING
-- ============================================================

SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname = 'protect_profile_fields_trigger';

SELECT tablename, rowsecurity AS rls_enabled FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('organizations', 'audit_log');

SELECT policyname, tablename, cmd, qual, with_check FROM pg_policies
WHERE tablename IN ('organizations', 'audit_log') ORDER BY tablename, policyname;
