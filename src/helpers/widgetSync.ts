import { TLogEntry } from '@/types'
import { formatTimeUntil, toCalendarDateString } from './time'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Props every widget timeline entry carries. `pendingTs` is the +1 queue written by the widget. */
export type WidgetProps = {
  todayCount: number
  lastLoggedAt: number | null
  pendingTs: number[]
  /** False on iOS 16, where widget buttons are unavailable; the widget hides +1. */
  interactive: boolean
  /** Average gap between cigarettes, already formatted ("36M"), or null without enough data. */
  avgGapLabel: string | null
  /** When the next nudge is due (ms). The widget counts down to it with a system timer. */
  nextAt: number | null
  /** Rotating home-screen copy ("GO ON THEN."). Picked at sync time. */
  line: string
}

export type SnapshotExtras = {
  interactive?: boolean
  avgGapMs?: number | null
  nextAt?: number | null
  line?: string
}

export type WidgetTimelineItem = { date: Date; props: WidgetProps }

export type PendingAdd = { dateStr: string; ts: number }

// ─── Day helpers ──────────────────────────────────────────────────────────────

export const startOfNextDay = (now: Date): Date => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)

const isSameLocalDay = (ts: number, now: Date): boolean => toCalendarDateString(new Date(ts)) === toCalendarDateString(now)

// ─── Snapshot / timeline ──────────────────────────────────────────────────────

/**
 * Builds the widget props from today's stored entries plus any not-yet-merged taps.
 * Pending taps made today still count, so the widget never shows less than the user tapped.
 */
export const buildSnapshot = (todayEntries: TLogEntry[], pendingTs: number[], now: Date, extras: SnapshotExtras = {}): WidgetProps => {
  const todayTs = [...todayEntries.map((e) => e.ts), ...pendingTs.filter((ts) => isSameLocalDay(ts, now))]
  const unique = Array.from(new Set(todayTs))
  return { todayCount: unique.length, lastLoggedAt: unique.length > 0 ? Math.max(...unique) : null,
    pendingTs,
    interactive: extras.interactive ?? true,
    avgGapLabel: extras.avgGapMs ? formatTimeUntil(extras.avgGapMs) : null,
    nextAt: extras.nextAt ?? null,
    line: extras.line ?? '',
  }
}

/**
 * Two entries: "now", and local midnight with the count reset to 0. `lastLoggedAt` is carried
 * across midnight so "time since last" keeps counting. The midnight entry has an empty queue;
 * taps made before midnight stay on the earlier entry and are recovered by `collectPending`
 * (the widget only ever updates the entry that was on screen when the button was pressed).
 */
export const buildTimeline = (snapshot: WidgetProps, now: Date): WidgetTimelineItem[] => [
  { date: now, props: snapshot },
  {
    date: startOfNextDay(now),
    props: {
      ...snapshot,
      todayCount: 0,
      pendingTs: [],
      // A nudge time that has already passed by midnight is stale.
      nextAt: snapshot.nextAt !== null && snapshot.nextAt > startOfNextDay(now).getTime() ? snapshot.nextAt : null,
    },
  },
]

// ─── Pending queue ────────────────────────────────────────────────────────────

/** Union of `pendingTs` across every timeline entry (past and future), de-duplicated and ascending. */
export const collectPending = (entries: { props?: Partial<WidgetProps> | null }[]): number[] => {
  const all = entries.flatMap((e) => (Array.isArray(e.props?.pendingTs) ? e.props.pendingTs : []))
  return Array.from(new Set(all.filter((ts) => Number.isFinite(ts)))).sort((a, b) => a - b)
}

/**
 * Which pending taps still need adding to storage. Each tap goes to the day of its own
 * timestamp, and is skipped if that day already has an entry with the same `ts`; this makes
 * the merge idempotent, so the foreground sync and the interaction listener can both run it.
 */
export const mergePending = (pendingTs: number[], existingByDate: Record<string, TLogEntry[]>): PendingAdd[] => {
  const seen = new Set<string>()
  const adds: PendingAdd[] = []
  for (const ts of [...pendingTs].sort((a, b) => a - b)) {
    const dateStr = toCalendarDateString(new Date(ts))
    const dedupeKey = `${dateStr}|${ts}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    if ((existingByDate[dateStr] ?? []).some((e) => e.ts === ts)) continue
    adds.push({ dateStr, ts })
  }
  return adds
}

/**
 * Re-read-before-write: taps in `latest` that were not part of the batch we merged. They arrived
 * between our first read and our write, so they must stay queued instead of being wiped.
 *
 * Known, accepted race: a tap landing between this second read and the timeline write that
 * follows is still lost, because widget and app share no lock and the write cannot be made
 * atomic from JS. The window is a few milliseconds and the cost is one missed +1, so it is accepted.
 */
export const carryForward = (latestPending: number[], mergedPending: number[]): number[] => {
  const merged = new Set(mergedPending)
  return latestPending.filter((ts) => !merged.has(ts))
}

/**
 * The native side persists timeline props in UserDefaults, which cannot store null, so null fields
 * are dropped before writing. The widget reads a missing field as "no value".
 */
export const stripNulls = (item: WidgetTimelineItem): WidgetTimelineItem => ({
  date: item.date,
  props: Object.fromEntries(Object.entries(item.props).filter(([, v]) => v !== null && v !== undefined)) as unknown as WidgetProps,
})
