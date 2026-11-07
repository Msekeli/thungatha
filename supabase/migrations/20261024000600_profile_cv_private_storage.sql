-- Private CV storage bucket; staged uploads never replace the current master CV.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-cvs', 'profile-cvs', false, 5242880, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy "Users can upload their own staged CVs" on storage.objects for insert to authenticated with check (bucket_id='profile-cvs' and (storage.foldername(name))[1]=(auth.jwt()->>'sub') and (storage.foldername(name))[2]='staged');
create policy "Users can read their own CVs" on storage.objects for select to authenticated using (bucket_id='profile-cvs' and (storage.foldername(name))[1]=(auth.jwt()->>'sub'));
create policy "Users can update their own CVs" on storage.objects for update to authenticated using (bucket_id='profile-cvs' and (storage.foldername(name))[1]=(auth.jwt()->>'sub')) with check (bucket_id='profile-cvs' and (storage.foldername(name))[1]=(auth.jwt()->>'sub'));
create policy "Users can remove their own CVs" on storage.objects for delete to authenticated using (bucket_id='profile-cvs' and (storage.foldername(name))[1]=(auth.jwt()->>'sub'));