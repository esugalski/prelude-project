/*
# Create Prelude Project tables

1. New Tables
- `instrument_needs` — instruments that donors can fund (name, family, target/raised amounts, image)
- `volunteer_applications` — volunteer teacher applications (name, email, phone, specialty, experience, status)
- `volunteer_availability` — recurring/one-off teaching slots offered by volunteers
- `slot_requests` — student requests for specific lesson slots
- `lesson_enrollments` — parent/guardian enrollments of children for lessons
- `instrument_requests` — requests for free instruments from families
- `courses` — course catalog entries (title, family, description, movements data as jsonb)

2. Security
- Enable RLS on all tables.
- All tables allow anon + authenticated CRUD (single-tenant public app model).
- Data is intentionally public/shared — instrument gallery, course catalog, enrollment forms.
*/

CREATE TABLE IF NOT EXISTS instrument_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  instrument_family text NOT NULL DEFAULT 'Strings',
  target_amount numeric NOT NULL DEFAULT 0,
  raised_amount numeric NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE instrument_needs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_instrument_needs" ON instrument_needs;
CREATE POLICY "anon_select_instrument_needs" ON instrument_needs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_instrument_needs" ON instrument_needs;
CREATE POLICY "anon_insert_instrument_needs" ON instrument_needs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_instrument_needs" ON instrument_needs;
CREATE POLICY "anon_update_instrument_needs" ON instrument_needs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_instrument_needs" ON instrument_needs;
CREATE POLICY "anon_delete_instrument_needs" ON instrument_needs FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  instrument_specialty text NOT NULL DEFAULT 'Strings (violin/cello)',
  experience_years numeric NOT NULL DEFAULT 0,
  teaching_experience text DEFAULT '',
  availability text DEFAULT 'Flexible',
  bio text DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_volunteer_applications" ON volunteer_applications;
CREATE POLICY "anon_select_volunteer_applications" ON volunteer_applications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_volunteer_applications" ON volunteer_applications;
CREATE POLICY "anon_insert_volunteer_applications" ON volunteer_applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_volunteer_applications" ON volunteer_applications;
CREATE POLICY "anon_update_volunteer_applications" ON volunteer_applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_volunteer_applications" ON volunteer_applications;
CREATE POLICY "anon_delete_volunteer_applications" ON volunteer_applications FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS volunteer_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_name text NOT NULL,
  volunteer_email text NOT NULL,
  instrument_specialty text DEFAULT '',
  slot_type text NOT NULL DEFAULT 'recurring',
  day_of_week text DEFAULT '',
  start_time text NOT NULL,
  end_time text NOT NULL,
  one_off_date date,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'Open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE volunteer_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_volunteer_availability" ON volunteer_availability;
CREATE POLICY "anon_select_volunteer_availability" ON volunteer_availability FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_volunteer_availability" ON volunteer_availability;
CREATE POLICY "anon_insert_volunteer_availability" ON volunteer_availability FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_volunteer_availability" ON volunteer_availability;
CREATE POLICY "anon_update_volunteer_availability" ON volunteer_availability FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_volunteer_availability" ON volunteer_availability;
CREATE POLICY "anon_delete_volunteer_availability" ON volunteer_availability FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS slot_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES volunteer_availability(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_email text NOT NULL,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE slot_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_slot_requests" ON slot_requests;
CREATE POLICY "anon_select_slot_requests" ON slot_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_slot_requests" ON slot_requests;
CREATE POLICY "anon_insert_slot_requests" ON slot_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_slot_requests" ON slot_requests;
CREATE POLICY "anon_update_slot_requests" ON slot_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_slot_requests" ON slot_requests;
CREATE POLICY "anon_delete_slot_requests" ON slot_requests FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS lesson_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name text NOT NULL,
  child_age integer NOT NULL DEFAULT 8,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  instrument_interest text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lesson_enrollments" ON lesson_enrollments;
CREATE POLICY "anon_select_lesson_enrollments" ON lesson_enrollments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lesson_enrollments" ON lesson_enrollments;
CREATE POLICY "anon_insert_lesson_enrollments" ON lesson_enrollments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lesson_enrollments" ON lesson_enrollments;
CREATE POLICY "anon_update_lesson_enrollments" ON lesson_enrollments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lesson_enrollments" ON lesson_enrollments;
CREATE POLICY "anon_delete_lesson_enrollments" ON lesson_enrollments FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS instrument_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name text NOT NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  dream_instrument text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE instrument_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_instrument_requests" ON instrument_requests;
CREATE POLICY "anon_select_instrument_requests" ON instrument_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_instrument_requests" ON instrument_requests;
CREATE POLICY "anon_insert_instrument_requests" ON instrument_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_instrument_requests" ON instrument_requests;
CREATE POLICY "anon_update_instrument_requests" ON instrument_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_instrument_requests" ON instrument_requests;
CREATE POLICY "anon_delete_instrument_requests" ON instrument_requests FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  instrument_family text NOT NULL,
  description text DEFAULT '',
  movements jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE
  TO anon, authenticated USING (true);
