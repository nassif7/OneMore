// ─── Get Gap Color ────────────────────────────────────────────────────────────
// Returns a background color based on gap ratio vs average.
// Only highlights below-average gaps — everything else stays default.
//
// ratio = gapMs / avgGapMs
//   null or > 0.9 → default bg — on avg or above, no highlight
//   <= 0.9        → red        — below avg, needs attention

export const getGapColor = (ratio: number | null): string => {
  if (ratio === null) return "#F5F0E8"; // default — no data
  if (ratio > 0.9) return "#F5F0E8"; // on avg or above — default bg
  return "#DD0000"; // below avg — red
};
