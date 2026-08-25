/*
# Add Google Meet link to volunteer applications

1. Modified Tables
- `volunteer_applications`
  - `meet_link` (text, nullable) — a reusable Google Meet URL the volunteer stores once
    and uses for every session. e.g. https://meet.google.com/abc-mnop-xyz

2. Security
- No new tables; RLS already enabled on volunteer_applications.
- Existing policies already allow each volunteer to update their own row, which covers
  setting the meet_link field.

3. Important Notes
- Volunteers paste their personal Google Meet room link once in the portal.
- "Start session" buttons throughout the portal open this link in a new tab.
- The link is stored per-volunteer so every student session uses the same room.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'volunteer_applications' AND column_name = 'meet_link'
  ) THEN
    ALTER TABLE volunteer_applications ADD COLUMN meet_link text;
  END IF;
END $$;