-- Storage buckets + policies for portfolio media (public reads) and interview responses (private).

insert into storage.buckets (id, name, public)
  values ('portfolio-media', 'portfolio-media', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('interview-responses', 'interview-responses', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('certifications', 'certifications', false)
  on conflict (id) do nothing;

-- portfolio-media: authenticated users upload to their own prefix; public read
create policy "portfolio upload own prefix" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "portfolio public read" on storage.objects
  for select using (bucket_id = 'portfolio-media');

create policy "portfolio owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'portfolio-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- interview-responses: applicant writes own; parties read via signed URL only
create policy "interview upload own prefix" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'interview-responses'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- certifications: user uploads own; only owner reads
create policy "cert upload own prefix" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'certifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "cert owner read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'certifications'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
