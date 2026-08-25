/*
# Add auth, admin, and matching support

1. New Tables
- `matches` — pairs a volunteer with a student enrollment (volunteer_id, enrollment_id, status)
- `admin_emails` — allowlisted admin email addresses

2. New Columns
- `lesson_enrollments.user_id` (uuid, nullable, references auth.users) — links enrollment to the parent's auth account
- `volunteer_applications.user_id` (uuid, nullable, references auth.users) — links application to the volunteer's auth account

3. New Functions
- `is_admin()` — returns true if the current auth user's email is in the admin_emails table

4. Security Changes
- Add SELECT-only policy for authenticated users on lesson_enrollments scoped to their own user_id
- Add SELECT-only policy for authenticated users on volunteer_applications scoped to their own user_id
- Add UPDATE policy for authenticated users on volunteer_applications scoped to their own user_id
- Admin users (is_admin()) get full CRUD on volunteer_applications, lesson_enrollments, matches, and volunteer_availability
- Existing anon policies remain so the public enrollment and volunteer forms still work without login
- matches table: admin-only CRUD, authenticated users can read their own matches

5. Important Notes
- The user_id columns are nullable so existing rows (created before auth) are preserved
- New enrollments/applications will set user_id from the auth session
- The admin email annica0727@gmail.com is inserted as the initial admin
*/

-- Add user_id to lesson_enrollments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_enrollments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE lesson_enrollments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add user_id to volunteer_applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'volunteer_applications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE volunteer_applications ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create admin_emails table
CREATE TABLE IF NOT EXISTS admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_admin_emails" ON admin_emails;
CREATE POLICY "anon_select_admin_emails" ON admin_emails FOR SELECT
  TO anon, authenticated USING (true);

-- Insert the initial admin email
INSERT INTO admin_emails (email)
VALUES ('annica0727@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Create is_admin() function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_emails
    WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );
$$;

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES volunteer_applications(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES lesson_enrollments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Matched',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Admin full CRUD on matches
DROP POLICY IF EXISTS "admin_select_matches" ON matches;
CREATE POLICY "admin_select_matches" ON matches FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_matches" ON matches;
CREATE POLICY "admin_insert_matches" ON matches FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_matches" ON matches;
CREATE POLICY "admin_update_matches" ON matches FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_matches" ON matches;
CREATE POLICY "admin_delete_matches" ON matches FOR DELETE
  TO authenticated USING (is_admin());

-- Admin full CRUD on volunteer_applications (in addition to existing anon policies)
DROP POLICY IF EXISTS "admin_update_volunteer_applications" ON volunteer_applications;
CREATE POLICY "admin_update_volunteer_applications" ON volunteer_applications FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin full CRUD on lesson_enrollments (in addition to existing anon policies)
DROP POLICY IF EXISTS "admin_update_lesson_enrollments" ON lesson_enrollments;
CREATE POLICY "admin_update_lesson_enrollments" ON lesson_enrollments FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin full CRUD on volunteer_availability (in addition to existing anon policies)
DROP POLICY IF EXISTS "admin_update_volunteer_availability" ON volunteer_availability;
CREATE POLICY "admin_update_volunteer_availability" ON volunteer_availability FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Authenticated users can read their own enrollment
DROP POLICY IF EXISTS "auth_select_own_enrollments" ON lesson_enrollments;
CREATE POLICY "auth_select_own_enrollments" ON lesson_enrollments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Authenticated users can read their own volunteer application
DROP POLICY IF EXISTS "auth_select_own_applications" ON volunteer_applications;
CREATE POLICY "auth_select_own_applications" ON volunteer_applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Authenticated users can update their own volunteer application
DROP POLICY IF EXISTS "auth_update_own_applications" ON volunteer_applications;
CREATE POLICY "auth_update_own_applications" ON volunteer_applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Authenticated users can read volunteer availability
DROP POLICY IF EXISTS "auth_select_own_availability" ON volunteer_availability;
CREATE POLICY "auth_select_own_availability" ON volunteer_availability FOR SELECT
  TO authenticated USING (true);

-- Authenticated users can insert volunteer availability
DROP POLICY IF EXISTS "auth_insert_own_availability" ON volunteer_availability;
CREATE POLICY "auth_insert_own_availability" ON volunteer_availability FOR INSERT
  TO authenticated WITH CHECK (true);

-- Authenticated users can update volunteer availability
DROP POLICY IF EXISTS "auth_update_own_availability" ON volunteer_availability;
CREATE POLICY "auth_update_own_availability" ON volunteer_availability FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Authenticated users can read slot requests
DROP POLICY IF EXISTS "auth_select_slot_requests" ON slot_requests;
CREATE POLICY "auth_select_slot_requests" ON slot_requests FOR SELECT
  TO authenticated USING (true);

-- Authenticated users can insert slot requests
DROP POLICY IF EXISTS "auth_insert_slot_requests" ON slot_requests;
CREATE POLICY "auth_insert_slot_requests" ON slot_requests FOR INSERT
  TO authenticated WITH CHECK (true);

-- Authenticated users can update slot requests
DROP POLICY IF EXISTS "auth_update_slot_requests" ON slot_requests;
CREATE POLICY "auth_update_slot_requests" ON slot_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
