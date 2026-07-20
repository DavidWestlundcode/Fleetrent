-- Bucket for machine photos (nameplate/machine images, pickup & return condition photos).
-- Private bucket: files are only reachable via signed URLs generated server/client-side
-- for an authenticated user whose organization matches the file's folder prefix.
insert into storage.buckets (id, name, public)
values ('machine-photos', 'machine-photos', false)
on conflict (id) do nothing;

-- Path convention: {organization_id}/{machineId}/{uuid}.{ext}
-- get_org_id() is already defined in schema.sql and reused here for the same
-- per-organization isolation used by every other table's RLS policy.
create policy "org_isolation_select" on storage.objects
  for select using (
    bucket_id = 'machine-photos'
    and (storage.foldername(name))[1] = get_org_id()::text
  );

create policy "org_isolation_insert" on storage.objects
  for insert with check (
    bucket_id = 'machine-photos'
    and (storage.foldername(name))[1] = get_org_id()::text
  );

create policy "org_isolation_delete" on storage.objects
  for delete using (
    bucket_id = 'machine-photos'
    and (storage.foldername(name))[1] = get_org_id()::text
  );
