-- Image + SEO meta fields for landing_events, and the storage bucket for event images.
ALTER TABLE landing_events
  ADD COLUMN IF NOT EXISTS image_url        TEXT,
  ADD COLUMN IF NOT EXISTS meta_title       TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Public bucket: event images are shown on the public site, so they're served
-- via plain public URLs. Uploads only happen through the admin API (service
-- role), so no insert/update/delete policy is needed — mirrors landing_events
-- itself, which has no write policy for anon/authenticated either.
insert into storage.buckets (id, name, public)
values ('landing-events', 'landing-events', true)
on conflict (id) do nothing;

create policy "public_read" on storage.objects
  for select using (bucket_id = 'landing-events');
