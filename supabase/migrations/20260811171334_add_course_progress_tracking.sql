/*
# Track student course progress

1. New Table
- `course_progress` — one row per (student enrollment, instrument family, movement index) the student has passed.
- Links to `lesson_enrollments` via `enrollment_id` with cascade delete.

2. RLS
- Students can only see/insert their own progress (matched by parent_email → auth email).
- Volunteers can read progress for enrollments matched to them (via the `matches` table).
- Admins (via service role) can read all progress.

3. Security
- Uses auth.uid() joined to lesson_enrollments.user_id for ownership.
- Volunteer read access is scoped through the matches table so volunteers only see their own students' progress.
*/

CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES lesson_enrollments(id) ON DELETE CASCADE,
  instrument_family text NOT NULL,
  movement_index int NOT NULL,
  passed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, instrument_family, movement_index)
);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Students: full CRUD on their own progress
CREATE POLICY "select_own_progress" ON course_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lesson_enrollments e
      WHERE e.id = course_progress.enrollment_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "insert_own_progress" ON course_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lesson_enrollments e
      WHERE e.id = course_progress.enrollment_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "delete_own_progress" ON course_progress FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lesson_enrollments e
      WHERE e.id = course_progress.enrollment_id
      AND e.user_id = auth.uid()
    )
  );

-- Volunteers: read progress for students matched to them
CREATE POLICY "volunteer_read_matched_progress" ON course_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      JOIN volunteer_applications v ON v.id = m.volunteer_id
      WHERE m.enrollment_id = course_progress.enrollment_id
      AND (v.user_id = auth.uid() OR lower(v.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_progress_enrollment ON course_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_family ON course_progress(enrollment_id, instrument_family);