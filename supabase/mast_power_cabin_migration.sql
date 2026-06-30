-- Text specs for truck categories (motviktstruck, ledstaplare, skjutstativtruck)
ALTER TABLE machines
  ADD COLUMN IF NOT EXISTS mast_type  TEXT,
  ADD COLUMN IF NOT EXISTS power_unit TEXT,
  ADD COLUMN IF NOT EXISTS cabin      TEXT;
