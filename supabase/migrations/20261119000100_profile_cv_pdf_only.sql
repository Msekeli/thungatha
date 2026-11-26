-- CV import is PDF-only from this point forward. Existing staged DOCX objects are not modified.
update storage.buckets
set allowed_mime_types = array['application/pdf']
where id = 'profile-cvs';
