/*
# Allow volunteers to view their matched students' course progress

Volunteers can read enrollment details only when a match connects the enrollment to their own volunteer application. This supports the volunteer dashboard without exposing unrelated students.
*/

DROP POLICY IF EXISTS "volunteer_read_matched_enrollments" ON lesson_enrollments;
CREATE POLICY "volunteer_read_matched_enrollments" ON lesson_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM matches m
      JOIN volunteer_applications v ON v.id = m.volunteer_id
      WHERE m.enrollment_id = lesson_enrollments.id
      AND (v.user_id = auth.uid() OR lower(v.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  );