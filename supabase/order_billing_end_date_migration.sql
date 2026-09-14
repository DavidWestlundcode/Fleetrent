-- "Avsluta order" — manual override for where billing should stop, for when a customer ends
-- the rental before the machine is actually picked up/returned. Set via the order edit page.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS billing_end_date DATE;
