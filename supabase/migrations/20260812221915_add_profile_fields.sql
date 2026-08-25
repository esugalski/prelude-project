/*
# Add profile fields for volunteers and students

1. New Columns on volunteer_applications
- profile_hobbies (text) — what the volunteer likes to do outside music
- profile_teaching_methods (text) — how the volunteer likes to teach
- profile_image_url already exists (added in earlier migration)

2. New Columns on lesson_enrollments
- profile_hobbies (text) — what the child likes to do
- profile_learning_style (text) — how the child learns best
- profile_image_url (text) — public URL for student profile photo

3. New Functions
- update_volunteer_profile(p_bio, p_image_url, p_hobbies, p_teaching_methods) — replaces existing function, lets a signed-in volunteer update all profile fields
- update_student_profile(p_hobbies, p_learning_style, p_image_url) — lets a signed-in parent update their child's profile fields

4. Storage
- Creates public bucket "student-profiles" for student profile photos
- Adds storage policies for authenticated users to manage their own folder

5. Security
- Profile updates go through SECURITY DEFINER functions tied to auth.uid()
- Storage writes restricted to each user's own folder
- Existing data preserved; all new columns are nullable

6. Important Notes
- The existing update_volunteer_profile(text, text) function is replaced with the new 4-parameter version
- Volunteers and students can fill in profile info on top of their sign-up data
- When matched, both sides can view each other's full profile
*/

-- Add profile columns to volunteer_applications
ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS profile_hobbies text;

ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS profile_teaching_methods text;

-- Add profile columns to lesson_enrollments
ALTER TABLE lesson_enrollments
  ADD COLUMN IF NOT EXISTS profile_hobbies text;

ALTER TABLE lesson_enrollments
  ADD COLUMN IF NOT EXISTS profile_learning_style text;

ALTER TABLE lesson_enrollments
  ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Replace update_volunteer_profile with expanded version
CREATE OR REPLACE FUNCTION update_volunteer_profile(
  p_bio text,
  p_image_url text,
  p_hobbies text,
  p_teaching_methods text
)
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
      profile_image_url = nullif(left(coalesce(p_image_url, ''), 2000), ''),
      profile_hobbies = left(coalesce(p_hobbies, ''), 1000),
      profile_teaching_methods = left(coalesce(p_teaching_methods, ''), 1000)
  WHERE user_id = auth.uid()
     OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_volunteer_profile(text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION update_volunteer_profile(text, text, text, text) TO authenticated;

-- Create update_student_profile function
CREATE OR REPLACE FUNCTION update_student_profile(
  p_hobbies text,
  p_learning_style text,
  p_image_url text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE lesson_enrollments
  SET profile_hobbies = left(coalesce(p_hobbies, ''), 1000),
      profile_learning_style = left(coalesce(p_learning_style, ''), 1000),
      profile_image_url = nullif(left(coalesce(p_image_url, ''), 2000), '')
  WHERE user_id = auth.uid()
     OR lower(parent_email) = lower(coalesce(auth.jwt() ->> 'email', ''));

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_student_profile(text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION update_student_profile(text, text, text) TO authenticated;

-- Create student-profiles storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-profiles', 'student-profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for student-profiles bucket
DROP POLICY IF EXISTS "student_profile_images_select" ON storage.objects;
CREATE POLICY "student_profile_images_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'student-profiles');

DROP POLICY IF EXISTS "student_profile_images_insert_own" ON storage.objects;
CREATE POLICY "student_profile_images_insert_own" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'student-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "student_profile_images_update_own" ON storage.objects;
CREATE POLICY "student_profile_images_update_own" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'student-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'student-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "student_profile_images_delete_own" ON storage.objects;
CREATE POLICY "student_profile_images_delete_own" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'student-profiles'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
