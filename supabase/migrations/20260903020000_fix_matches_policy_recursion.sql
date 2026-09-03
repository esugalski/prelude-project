/*
# Fix infinite recursion between matches and lesson_enrollments RLS policies

1. Problem
- 20260903010000 added SELECT policies on `matches` that check ownership by
  querying `lesson_enrollments` / `volunteer_applications` directly inside
  the policy's USING clause.
- `lesson_enrollments` already had a policy (`volunteer_read_matched_enrollments`,
  from 20260811171437) that checks ownership by querying `matches`.
- Evaluating either table's RLS now triggers evaluation of the other's RLS,
  which triggers the first again - Postgres detects this and raises
  "infinite recursion detected in policy" (42P17), breaking every read of
  lesson_enrollments for authenticated users (including admins).

2. Fix
- Move the ownership checks into SECURITY DEFINER functions. Such functions
  run as their owner, which bypasses RLS on the tables they query directly
  (the same pattern already used by complete_volunteer_training() and
  update_volunteer_profile()), so evaluating the matches policies no longer
  triggers a nested RLS evaluation on lesson_enrollments/volunteer_applications.
- Re-point the two matches policies at these functions instead of raw
  subqueries.
*/

CREATE OR REPLACE FUNCTION is_own_enrollment(p_enrollment_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lesson_enrollments e
    WHERE e.id = p_enrollment_id
    AND (e.user_id = auth.uid() OR lower(e.parent_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

REVOKE EXECUTE ON FUNCTION is_own_enrollment(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION is_own_enrollment(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION is_own_volunteer_application(p_volunteer_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM volunteer_applications v
    WHERE v.id = p_volunteer_id
    AND (v.user_id = auth.uid() OR lower(v.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

REVOKE EXECUTE ON FUNCTION is_own_volunteer_application(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION is_own_volunteer_application(uuid) TO authenticated;

DROP POLICY IF EXISTS "parent_select_own_matches" ON matches;
CREATE POLICY "parent_select_own_matches" ON matches FOR SELECT
  TO authenticated
  USING (is_own_enrollment(matches.enrollment_id));

DROP POLICY IF EXISTS "volunteer_select_own_matches" ON matches;
CREATE POLICY "volunteer_select_own_matches" ON matches FOR SELECT
  TO authenticated
  USING (is_own_volunteer_application(matches.volunteer_id));
