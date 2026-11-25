import { formatGap } from './time'

/** Shown by the home screen and the widget when there is no gap yet (fewer than 2 entries). */
export const NO_GAP_LABEL = 'N/A'

/**
 * Average gap in ms between consecutive timestamps, or null with fewer than 2.
 * Sorts a copy first, so storage order (legacy days may be unsorted) never skews the result.
 * Callers pass one day's timestamps; this function does not filter by day.
 */
export const getAvgGapMs = (timestamps: readonly number[]): number | null => {
  if (timestamps.length < 2) return null
  const sorted = [...timestamps].sort((a, b) => a - b)
  return (sorted[sorted.length - 1] - sorted[0]) / (sorted.length - 1)
}

/** The AVG GAP text, e.g. "36m", "1h 5m", or "N/A". The single source for the home screen and the widget. */
export const formatAvgGap = (timestamps: readonly number[]): string => {
  const ms = getAvgGapMs(timestamps)
  return ms === null ? NO_GAP_LABEL : formatGap(ms)
}
