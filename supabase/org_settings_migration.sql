-- ============================================================
-- FleetRent – Org-inställningar & invite-fix
-- Kör i Supabase SQL Editor
-- ============================================================


-- ============================================================
-- 1. KOLUMNER FÖR FÖRETAGSINFORMATION
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS org_number      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email           TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone           TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address         TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_city     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS standard_terms  TEXT NOT NULL DEFAULT '';


-- ============================================================
-- 2. INVITE-FIX: uppdatera handle_new_user-triggern
--    Läser organization_id från inbjudans metadata och
--    sätter rätt org + roll på den nya profilen.
--    - Inbjuden användare → org satt, roll = 'saljare'
--    - Ny egenregistrerad → org = NULL, roll = 'admin'
--      (ensure-org skapar org vid första inloggning)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_org_id UUID;
BEGIN
  -- Hämta organization_id från inbjudans metadata (satt av invite-user-routen)
  BEGIN
    invite_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  EXCEPTION WHEN others THEN
    invite_org_id := NULL;
  END;

  INSERT INTO profiles (id, full_name, organization_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    invite_org_id,
    CASE WHEN invite_org_id IS NOT NULL THEN 'saljare' ELSE 'admin' END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


-- ============================================================
-- 3. VERIFIERING
-- ============================================================

-- Kontrollera att kolumnerna lades till
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'organizations'
  AND table_schema = 'public'
ORDER BY ordinal_position;
