/*
  # Add enrollment reference to slot requests

  1. Changes
    - `slot_requests.enrollment_id` (nullable uuid, FK to lesson_enrollments, ON DELETE SET NULL)
      lets a lesson-time request identify which child (of possibly several sharing a parent) it's for.

  2. Security
    - No RLS policy changes — existing insert/select policies are unaffected by an additive nullable column.
*/

ALTER TABLE slot_requests
  ADD COLUMN IF NOT EXISTS enrollment_id uuid REFERENCES lesson_enrollments(id) ON DELETE SET NULL;
