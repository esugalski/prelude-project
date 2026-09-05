/*
# Add per-match chat messages

1. New Tables
- `match_messages` — one row per chat message, scoped to a single `matches`
  row. Since a student can have multiple teachers (one per instrument) and a
  teacher can have multiple students, chat is naturally scoped by match_id
  rather than by student or by volunteer directly — that automatically gives
  each (student, teacher) pair its own separate conversation.

2. New Functions
- `is_own_match(p_match_id uuid)` — returns true if the current auth user is
  either the parent on that match's enrollment or the volunteer on that
  match, reusing the existing is_own_enrollment()/is_own_volunteer_application()
  SECURITY DEFINER helpers (added in 20260903020000) so this evaluates without
  re-triggering RLS on matches/lesson_enrollments/volunteer_applications - the
  same recursion those functions were introduced to avoid.

3. Security
- Enable RLS. Authenticated users can SELECT/INSERT messages only on matches
  they're a party to (is_own_match()). Admins get full access for support/
  moderation. No UPDATE/DELETE policy for regular users — messages are
  append-only from the app's perspective.
- Adds match_messages to the supabase_realtime publication so the chat UI can
  subscribe to new messages live.
*/

CREATE TABLE IF NOT EXISTS match_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('volunteer', 'parent')),
  sender_email text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS match_messages_match_id_created_at_idx
  ON match_messages (match_id, created_at);

ALTER TABLE match_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_own_match(p_match_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = p_match_id
    AND (is_own_enrollment(m.enrollment_id) OR is_own_volunteer_application(m.volunteer_id))
  );
$$;

REVOKE EXECUTE ON FUNCTION is_own_match(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION is_own_match(uuid) TO authenticated;

DROP POLICY IF EXISTS "own_match_select_messages" ON match_messages;
CREATE POLICY "own_match_select_messages" ON match_messages FOR SELECT
  TO authenticated
  USING (is_own_match(match_messages.match_id));

DROP POLICY IF EXISTS "own_match_insert_messages" ON match_messages;
CREATE POLICY "own_match_insert_messages" ON match_messages FOR INSERT
  TO authenticated
  WITH CHECK (is_own_match(match_messages.match_id));

DROP POLICY IF EXISTS "admin_all_match_messages" ON match_messages;
CREATE POLICY "admin_all_match_messages" ON match_messages FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'match_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE match_messages;
  END IF;
END $$;
