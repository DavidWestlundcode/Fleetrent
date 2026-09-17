-- ============================================================
-- FleetOS – Aktivera Realtime (live-uppdateringar) för kärntabellerna
-- Kör i Supabase SQL Editor. Säkert att köra flera gånger.
--
-- RLS (org_isolation-policyerna) styr redan VILKA rader en given
-- uppkoppling får ta emot — den här migrationen styr bara OM en
-- tabell alls skickar ut ändringshändelser över websocket. De är
-- separata mekanismer; båda behövs.
-- ============================================================

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE machines; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE customers; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE orders; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE order_events; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE templates; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE articles; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE service_records; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- VERIFIERING — ska lista alla 7 tabeller
-- ============================================================
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;
