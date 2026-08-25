/*
# Add volunteer messages table

1. New Tables
- `volunteer_messages` — notifications sent to volunteers (e.g. when matched with a student)
  - `id` (uuid, primary key)
  - `volunteer_id` (uuid, references volunteer_applications, cascade delete)
  - `match_id` (uuid, nullable, references matches, cascade delete)
  - `title` (text, not null)
  - `body` (text, not null)
  - `read` (boolean, default false)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `volunteer_messages`.
- Admin can insert (is_admin()).
- Authenticated users can read/update messages where the volunteer_applications row belongs to them (user_id match).
- Admin can read all messages.

3. Important Notes
- Messages are created when an admin matches a volunteer with a student.
- Volunteers see messages in their portal and can mark them as read.
*/

CREATE TABLE IF NOT EXISTS volunteer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteer_applications(id) ON DELETE CASCADE,
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE volunteer_messages ENABLE ROW LEVEL SECURITY;

-- Admin can read all messages
DROP POLICY IF EXISTS "admin_select_volunteer_messages" ON volunteer_messages;
CREATE POLICY "admin_select_volunteer_messages" ON volunteer_messages FOR SELECT
  TO authenticated USING (is_admin());

-- Admin can insert messages
DROP POLICY IF EXISTS "admin_insert_volunteer_messages" ON volunteer_messages;
CREATE POLICY "admin_insert_volunteer_messages" ON volunteer_messages FOR INSERT
  TO authenticated WITH CHECK (is_admin());

-- Authenticated users can read their own messages (via volunteer_applications.user_id)
DROP POLICY IF EXISTS "auth_select_own_messages" ON volunteer_messages;
CREATE POLICY "auth_select_own_messages" ON volunteer_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_messages.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  );

-- Authenticated users can update read status on their own messages
DROP POLICY IF EXISTS "auth_update_own_messages" ON volunteer_messages;
CREATE POLICY "auth_update_own_messages" ON volunteer_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_messages.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_messages.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  );
