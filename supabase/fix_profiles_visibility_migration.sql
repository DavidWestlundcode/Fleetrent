-- ============================================================
-- FleetOS – Fixa varför en kollega "försvinner" från teamlistan
-- när de byter aktivt bolag.
--
-- Databasen hade sedan tidigare en policy på profiles (aldrig incheckad
-- i kodbasen) som bara lät dig se en kollegas profilrad om DERAS
-- profiles.organization_id (aktiva bolag) råkade matcha ditt eget just
-- då — inte om de faktiskt har medlemskap i din organisation. Det är
-- därför Anders "försvann" från WTS Västerås teamlista så fort han
-- bytte aktivt bolag till WTS Nord, trots att hans medlemskap i
-- Västerås aldrig rördes.
--
-- Kör i Supabase SQL Editor. Säkert att köra flera gånger.
-- ============================================================

-- Ta bort alla SELECT-policyer på profiles utom own_profile (oavsett
-- exakt namn — det fanns en policy i databasen som aldrig checkades in
-- i kodbasen, så vi vet inte det exakta namnet med säkerhet).
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'profiles' AND policyname <> 'own_profile'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

-- Ny regel: du får se en profil om personen faktiskt har medlemskap
-- (organization_members) i din just nu aktiva organisation — oavsett
-- vilket bolag DERAS eget konto råkar stå i just då. own_profile
-- (FOR ALL USING (id = auth.uid())) täcker redan din egen rad.
CREATE POLICY "org_members_read" ON profiles
  FOR SELECT
  USING (
    id IN (SELECT user_id FROM organization_members WHERE organization_id = get_org_id())
  );

-- ============================================================
-- VERIFIERING
-- ============================================================
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';
