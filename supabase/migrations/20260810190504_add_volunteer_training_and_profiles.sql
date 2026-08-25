/*
# Add volunteer readiness and student-facing profiles

1. New Columns
- `volunteer_applications.training_completed` — records whether the volunteer passed every training module.
- `volunteer_applications.training_completed_at` — records when training was completed.
- `volunteer_applications.profile_bio` — volunteer-written biography shown to students.
- `volunteer_applications.profile_image_url` — public URL for the volunteer profile photo.

2. New Functions
- `complete_volunteer_training()` — marks the currently signed-in volunteer's application complete after the client quiz is passed.
- `update_volunteer_profile(text, text)` — lets a signed-in volunteer update only their profile bio and photo URL.

3. Storage
- Creates the public `volunteer-profiles` bucket for profile photos. Photos are intentionally public so students can view matched volunteer profiles.
- Adds policies allowing authenticated volunteers to manage objects inside their own user-id folder.

4. Security
- Completion is written through a server-side function tied to the signed-in account email or user id, rather than trusting a client-supplied volunteer id.
- Profile updates are written through a server-side function tied to the signed-in account email or user id.
- Storage writes are restricted to each volunteer's own folder.

5. Important Notes
- Existing applications keep their current data and receive an incomplete training status by default.
- Existing application bio values are preserved; the new profile bio is separate so volunteers can tailor what students see.
*/

ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS training_completed boolean NOT NULL DEFAULT false;

ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS training_completed_at timestamptz;

ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS profile_bio text;

ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS profile_image_url text;

CREATE OR REPLACE FUNCTION complete_volunteer_training()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE volunteer_applications
  SET training_completed = true,
      training_completed_at = COALESCE(training_completed_at, now())
  WHERE user_id = auth.uid()
     OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION complete_volunteer_training() FROM anon;
GRANT EXECUTE ON FUNCTION complete_volunteer_training() TO authenticated;

CREATE OR REPLACE FUNCTION update_volunteer_profile(p_bio text, p_image_url text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE volunteer_applications
  SET profile_bio = left(coalesce(p_bio, ''), 1200),
      profile_image_url = nullif(left(coalesce(p_image_url, ''), 2000), '')
  WHERE user_id = auth.uid()
     OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_volunteer_profile(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION update_volunteer_profile(text, text) TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteer-profiles', 'volunteer-profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "volunteer_profile_images_select" ON storage.objects;
CREATE POLICY "volunteer_profile_images_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'volunteer-profiles');

DROP POLICY IF EXISTS "volunteer_profile_images_insert_own" ON storage.objects;
CREATE POLICY "volunteer_profile_images_insert_own" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'volunteer-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "volunteer_profile_images_update_own" ON storage.objects;
CREATE POLICY "volunteer_profile_images_update_own" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'volunteer-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'volunteer-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "volunteer_profile_images_delete_own" ON storage.objects;
CREATE POLICY "volunteer_profile_images_delete_own" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'volunteer-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);