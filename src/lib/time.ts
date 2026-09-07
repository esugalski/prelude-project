// Lesson-time slots are stored as plain "HH:MM" (24-hour) strings entered via
// <input type="time">, with no timezone column - the whole app treats them as
// Eastern Time by convention. These helpers only reformat for display
// (24-hour -> 12-hour with AM/PM); they never convert between timezones.

function parse24h(time: string): { hour: number; minute: string; period: 'AM' | 'PM' } | null {
  const [hStr, mStr] = time.split(':');
  const h24 = parseInt(hStr, 10);
  if (isNaN(h24) || mStr == null) return null;
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  let hour = h24 % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: mStr, period };
}

export function formatTime(time: string): string {
  const parsed = parse24h(time);
  if (!parsed) return time;
  return `${parsed.hour}:${parsed.minute} ${parsed.period}`;
}

export function formatTimeRange(start: string, end: string): string {
  const a = parse24h(start);
  const b = parse24h(end);
  if (!a || !b) return `${start}–${end}`;
  if (a.period === b.period) {
    return `${a.hour}:${a.minute}–${b.hour}:${b.minute} ${b.period}`;
  }
  return `${a.hour}:${a.minute} ${a.period}–${b.hour}:${b.minute} ${b.period}`;
}
