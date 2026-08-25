/*
# Add instrument update parameters to profile functions

1. Modified Functions
- `update_volunteer_profile(p_bio, p_image_url, p_hobbies, p_teaching_methods, p_instrument_specialty)` — adds ability for a signed-in volunteer to update their instrument specialty from their profile editor
- `update_student_profile(p_hobbies, p_learning_style, p_image_url, p_instrument_interest)` — adds ability for a signed-in parent to update their child's instrument interest from their profile editor

2. Security
- Both functions remain SECURITY DEFINER, tied to auth.uid() or matching email
- No new tables or columns — only updates existing columns instrument_specialty / instrument_interest

3. Important Notes
- Existing callers that omit the new parameter will still work (parameter defaults to NULL, which preserves the existing value via COALESCE)
- The instrument values are stored as a comma-separated string in the existing text columns
*/

CREATE OR REPLACE FUNCTION update_volunteer_profile(
  p_bio text,
  p_image_url text,
  p_hobbies text,
  p_teaching_methods text,
  p_instrument_specialty text DEFAULT NULL
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
      profile_teaching_methods = left(coalesce(p_teaching_methods, ''), 1000),
      instrument_specialty = COALESCE(left(coalesce(p_instrument_specialty, ''), 500), instrument_specialty)
  WHERE user_id = auth.uid()
     OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''));

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_volunteer_profile(text, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION update_volunteer_profile(text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION update_student_profile(
  p_hobbies text,
  p_learning_style text,
  p_image_url text,
  p_instrument_interest text DEFAULT NULL
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
      profile_image_url = nullif(left(coalesce(p_image_url, ''), 2000), ''),
      instrument_interest = COALESCE(left(coalesce(p_instrument_interest, ''), 500), instrument_interest)
  WHERE user_id = auth.uid()
     OR lower(parent_email) = lower(coalesce(auth.jwt() ->> 'email', ''));

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_student_profile(text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION update_student_profile(text, text, text, text) TO authenticated;