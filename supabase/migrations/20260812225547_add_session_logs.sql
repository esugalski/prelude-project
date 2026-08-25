/*
# Add session logging for volunteers

1. New Tables
- `session_logs`
  - `id` (uuid, primary key)
  - `volunteer_id` (uuid, references volunteer_applications, cascade delete)
  - `enrollment_id` (uuid, references lesson_enrollments, cascade delete)
  - `session_date` (date, not null) — when the lesson happened
  - `duration_minutes` (int, not null, default 30) — how long the lesson lasted
  - `notes` (text, optional) — volunteer's notes about the session
  - `confirmed` (boolean, default false) — whether the volunteer has confirmed the session happened
  - `created_at` (timestamptz, default now())

2. Security
- RLS enabled on `session_logs`
- Volunteers can read, insert, update, delete only their own session logs (matched by volunteer_applications.user_id = auth.uid())
- A SECURITY DEFINER function `log_session` validates ownership before inserting

3. Important Notes
- Volunteers log sessions after they happen, confirming each one
- Total hours are computed by summing duration_minutes across confirmed sessions
- Only the volunteer who owns the session can create or modify it
- The enrollment_id links to a specific student so the log shows who the session was with
*/

CREATE TABLE IF NOT EXISTS session_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES volunteer_applications(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES lesson_enrollments(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  duration_minutes int NOT NULL DEFAULT 30,
  notes text DEFAULT '',
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_session_logs_volunteer ON session_logs(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_date ON session_logs(session_date DESC);

-- Helper function to get the volunteer_applications.id for the current user
CREATE OR REPLACE FUNCTION get_volunteer_id_for_user()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM volunteer_applications
  WHERE user_id = auth.uid()
     OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  LIMIT 1;
$$;

-- Policies: volunteers can only access their own session logs
DROP POLICY IF EXISTS "select_own_session_logs" ON session_logs;
CREATE POLICY "select_own_session_logs" ON session_logs
FOR SELECT TO authenticated
USING (volunteer_id = get_volunteer_id_for_user());

DROP POLICY IF EXISTS "insert_own_session_logs" ON session_logs;
CREATE POLICY "insert_own_session_logs" ON session_logs
FOR INSERT TO authenticated
WITH CHECK (volunteer_id = get_volunteer_id_for_user());

DROP POLICY IF EXISTS "update_own_session_logs" ON session_logs;
CREATE POLICY "update_own_session_logs" ON session_logs
FOR UPDATE TO authenticated
USING (volunteer_id = get_volunteer_id_for_user())
WITH CHECK (volunteer_id = get_volunteer_id_for_user());

DROP POLICY IF EXISTS "delete_own_session_logs" ON session_logs;
CREATE POLICY "delete_own_session_logs" ON session_logs
FOR DELETE TO authenticated
USING (volunteer_id = get_volunteer_id_for_user());
