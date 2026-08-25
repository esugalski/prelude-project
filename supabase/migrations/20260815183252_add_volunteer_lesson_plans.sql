/*
# Add volunteer lesson plans table

1. New Tables
- `volunteer_lesson_plans` — stores lesson plan templates created by volunteers
  - `id` (uuid, primary key)
  - `volunteer_id` (uuid, references volunteer_applications, cascade delete)
  - `title` (text, not null) — name of the plan
  - `student_name` (text, nullable) — optional student this plan is for
  - `lessons` (jsonb, not null, default '[]') — array of lesson objects, each with:
    - `date` (string, ISO date or free text)
    - `objective` (string)
    - `activities` (string)
    - `notes` (string)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `volunteer_lesson_plans`.
- Authenticated volunteers can CRUD their own plans (scoped via volunteer_applications.user_id = auth.uid()).
- Admin can read all plans (is_admin()).

3. Important Notes
- Volunteers create and save lesson plans to map out multiple lessons in advance.
- Plans are stored as JSONB so the structure can evolve without schema changes.
- Each volunteer sees only their own plans.
*/

CREATE TABLE IF NOT EXISTS volunteer_lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES volunteer_applications(id) ON DELETE CASCADE,
  title text NOT NULL,
  student_name text,
  lessons jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_volunteer ON volunteer_lesson_plans(volunteer_id);

ALTER TABLE volunteer_lesson_plans ENABLE ROW LEVEL SECURITY;

-- Admin can read all lesson plans
DROP POLICY IF EXISTS "admin_select_lesson_plans" ON volunteer_lesson_plans;
CREATE POLICY "admin_select_lesson_plans" ON volunteer_lesson_plans FOR SELECT
  TO authenticated USING (is_admin());

-- Volunteers can read their own plans
DROP POLICY IF EXISTS "auth_select_own_lesson_plans" ON volunteer_lesson_plans;
CREATE POLICY "auth_select_own_lesson_plans" ON volunteer_lesson_plans FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_lesson_plans.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  );

-- Volunteers can insert plans for themselves
DROP POLICY IF EXISTS "auth_insert_own_lesson_plans" ON volunteer_lesson_plans;
CREATE POLICY "auth_insert_own_lesson_plans" ON volunteer_lesson_plans FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_lesson_plans.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  );

-- Volunteers can update their own plans
DROP POLICY IF EXISTS "auth_update_own_lesson_plans" ON volunteer_lesson_plans;
CREATE POLICY "auth_update_own_lesson_plans" ON volunteer_lesson_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_lesson_plans.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_lesson_plans.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  );

-- Volunteers can delete their own plans
DROP POLICY IF EXISTS "auth_delete_own_lesson_plans" ON volunteer_lesson_plans;
CREATE POLICY "auth_delete_own_lesson_plans" ON volunteer_lesson_plans FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM volunteer_applications
      WHERE volunteer_applications.id = volunteer_lesson_plans.volunteer_id
      AND volunteer_applications.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_lesson_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lesson_plans_updated_at ON volunteer_lesson_plans;
CREATE TRIGGER trg_lesson_plans_updated_at
  BEFORE UPDATE ON volunteer_lesson_plans
  FOR EACH ROW EXECUTE FUNCTION update_lesson_plan_updated_at();
