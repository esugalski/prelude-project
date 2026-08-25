/*
  # Scope student profile updates to a single enrollment

  1. Modified Functions
    - `update_student_profile(p_hobbies, p_learning_style, p_image_url, p_instrument_interest, p_enrollment_id)`
      — adds an explicit enrollment id so a parent with multiple children on file can update
      one child's profile without touching the others.

  2. Security
    - Function remains SECURITY DEFINER, tied to auth.uid() or matching parent email — unchanged
      ownership check.
    - New: the UPDATE additionally filters on `id = p_enrollment_id` when supplied, so exactly one
      lesson_enrollments row is touched per call instead of every row owned by the parent.

  3. Important Notes
    - p_enrollment_id defaults to NULL to stay backward compatible; when NULL the WHERE clause
      falls back to the old (unscoped) behavior, which only matters during a deploy race window
      before the frontend starts passing it. In steady state, ProfileEditor.tsx always passes it.
    - No new tables or columns.
*/

CREATE OR REPLACE FUNCTION update_student_profile(
  p_hobbies text,
  p_learning_style text,
  p_image_url text,
  p_instrument_interest text DEFAULT NULL,
  p_enrollment_id uuid DEFAULT NULL
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
  WHERE id = COALESCE(p_enrollment_id, id)
    AND (user_id = auth.uid() OR lower(parent_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_student_profile(text, text, text, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION update_student_profile(text, text, text, text, uuid) TO authenticated;
