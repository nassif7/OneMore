import { TTagCount } from '@/types'
import { toCalendarDateString } from './time'

// Presentation-only helpers for the Stats overview. They reshape numbers the stats hook already
// computes; no statistic is calculated here.

export const NO_VALUE = '—'

/** "4/DAY", or "—" with no data. The period averages are per active day, so they read as a rate. */
export const formatRate = (dailyAvg: number): string => (dailyAvg > 0 ? `${dailyAvg}/DAY` : NO_VALUE)

/** Gap labels are shown uppercase on the overview ("36M"), whatever case the source helper uses. */
export const upperGap = (label: string): string => label.toUpperCase()

/** "WEEK OF NOV 17" from the week's first day ("YYYY-MM-DD", local). */
export const weekOfLabel = (firstDayStr: string): string => {
  const [y, m, d] = firstDayStr.split('-').map(Number)
  const day = new Date(y, m - 1, d)
  return `WEEK OF ${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`
}

/**
 * Percent change from `previous` to `current`, rounded. Null when there is nothing meaningful to
 * compare: either side is empty (null) or the previous value is 0 (no base to divide by). Callers
 * pass null, not 0, for an empty period, so an empty current value never reads as "-100%".
 */
export const deltaPercent = (current: number | null, previous: number | null): number | null => {
  if (current === null || previous === null || previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export type MonthDot = { day: number; count: number; isToday: boolean; isFuture: boolean }

/** One entry per day of `now`'s month, with the logged count from the date-keyed `monthData`. */
export const getMonthDots = (monthData: Record<string, number>, now: Date): MonthDot[] => {
  const y = now.getFullYear()
  const m = now.getMonth()
  const todayStr = toCalendarDateString(now)
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const dateStr = toCalendarDateString(new Date(y, m, i + 1))
    return {
      day: i + 1,
      count: monthData[dateStr] ?? 0,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    }
  })
}

/** The top `n` tags that were actually used. The breakdown arrives sorted by count, descending. */
export const getTopTags = (breakdown: TTagCount[], n: number): TTagCount[] => breakdown.filter((t) => t.count > 0).slice(0, n)
