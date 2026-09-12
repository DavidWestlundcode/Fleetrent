-- "Senaste händelserna" on the public landing page — managed from /admin.
CREATE TABLE IF NOT EXISTS landing_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT,
  event_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE landing_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous site visitors) may read published events.
-- No insert/update/delete policy exists for anon/authenticated — writes only
-- happen through /api/admin/landing-events via the service-role admin client.
CREATE POLICY "public_read_published" ON landing_events
  FOR SELECT
  USING (is_published = true);
