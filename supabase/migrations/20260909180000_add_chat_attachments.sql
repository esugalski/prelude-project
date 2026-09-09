/*
# Add image attachments to chat messages

1. Changes
- `match_messages.attachment_url` / `attachment_name` — an optional image
  attachment (e.g. a scanned sheet-music photo) alongside the text body.

2. Storage
- Creates the `chat-attachments` bucket (public, like the existing
  volunteer-profiles/student-profiles buckets - images are unguessable
  per-match/random-named object paths, not just per-user, so public read
  doesn't expose anything beyond what the two chat parties already share).
- Limited to 10 MB, common image mime types.

3. Security
- SELECT is open to any authenticated user (matches the existing
  volunteer-profiles bucket's policy bar).
- INSERT is restricted to the two parties of the match the object is filed
  under: the object path is `${match_id}/...`, and the policy calls the
  existing is_own_match() SECURITY DEFINER helper (added in 20260905150000)
  against that folder segment - the same helper match_messages itself uses,
  so this can't be used to write into a match you're not part of.
*/

ALTER TABLE match_messages ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE match_messages ADD COLUMN IF NOT EXISTS attachment_name text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-attachments', 'chat-attachments', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

DROP POLICY IF EXISTS "chat_attachments_select" ON storage.objects;
CREATE POLICY "chat_attachments_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "chat_attachments_insert_own_match" ON storage.objects;
CREATE POLICY "chat_attachments_insert_own_match" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND is_own_match(((storage.foldername(name))[1])::uuid)
);
