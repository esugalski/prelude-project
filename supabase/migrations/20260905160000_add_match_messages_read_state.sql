/*
# Add read tracking to match messages

1. Changes
- `match_messages.read` (boolean, default false) — lets each side know
  whether the other has seen their latest message, driving the unread-dot
  indicators on the Chat tab and on each conversation in the chat list.

2. Security
- Add an UPDATE policy so either party on a match can mark that match's
  messages as read, scoped by the same is_own_match() helper already used
  for SELECT/INSERT (added in 20260905150000).
*/

ALTER TABLE match_messages ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "own_match_update_messages" ON match_messages;
CREATE POLICY "own_match_update_messages" ON match_messages FOR UPDATE
  TO authenticated
  USING (is_own_match(match_messages.match_id))
  WITH CHECK (is_own_match(match_messages.match_id));
