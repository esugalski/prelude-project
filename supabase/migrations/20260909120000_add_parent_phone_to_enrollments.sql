/*
# Add parent phone number to lesson enrollments

1. Changes
- `lesson_enrollments.parent_phone` (text, default '') — the enrollment form
  now requires a parent/guardian phone number alongside email. Defaulted to
  '' rather than left nullable so existing rows (submitted before this
  column existed) don't need a backfill to stay valid.

2. Security
- No RLS policy changes — existing insert/select/update policies on
  lesson_enrollments already cover this additive column.
*/

ALTER TABLE lesson_enrollments
  ADD COLUMN IF NOT EXISTS parent_phone text NOT NULL DEFAULT '';
