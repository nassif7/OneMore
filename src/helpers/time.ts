// ─── Format Gap ───────────────────────────────────────────────────────────────
// Converts a gap in milliseconds to a human-readable string.
// e.g. 3720000 → "1h 2m"

export const formatGap = (ms: number): string => {
  const mins = Math.round(ms / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

// ─── To Calendar Date String ──────────────────────────────────────────────────
// Converts a Date to a "YYYY-MM-DD" string using local time.
// Avoids the UTC shift bug from toISOString().

export const toCalendarDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
