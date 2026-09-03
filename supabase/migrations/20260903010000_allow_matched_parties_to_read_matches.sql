/*
# Allow matched parents and volunteers to read their own match rows

1. Problem
- The `matches` table only had admin-gated policies (`is_admin()`) for SELECT,
  INSERT, UPDATE, and DELETE.
- That meant even a successfully created match was invisible to the two people
  it actually concerns: the matched student's parent and the matched volunteer.
  Their portals query `matches` directly under their own (non-admin) session,
  so RLS silently returned zero rows every time, regardless of whether a real
  match row existed.
- This also silently broke `volunteer_read_matched_enrollments` on
  `lesson_enrollments` (added in 20260811171437), since its EXISTS subquery
  joins `matches` and is therefore subject to the same RLS - it could never
  find a row either.

2. Changes
- Add a SELECT policy so a parent can read matches for their own enrollments
  (matched via `lesson_enrollments.user_id` or `parent_email`).
- Add a SELECT policy so a volunteer can read matches for their own
  application (matched via `volunteer_applications.user_id` or `email`).
- These are additional permissive policies alongside the existing admin
  policies; admin access is unchanged.
*/

DROP POLICY IF EXISTS "parent_select_own_matches" ON matches;
CREATE POLICY "parent_select_own_matches" ON matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lesson_enrollments e
      WHERE e.id = matches.enrollment_id
      AND (e.user_id = auth.uid() OR lower(e.parent_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

DROP POLICY IF EXISTS "volunteer_select_own_matches" ON matches;
CREATE POLICY "volunteer_select_own_matches" ON matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_applications v
      WHERE v.id = matches.volunteer_id
      AND (v.user_id = auth.uid() OR lower(v.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  );
