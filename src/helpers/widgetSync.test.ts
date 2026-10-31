import { TLogEntry } from '@/types'
import { buildSnapshot, buildTimeline, carryForward, collectPending, mergePending, startOfNextDay } from './widgetSync'

const at = (h: number, m = 0, day = 15) => new Date(2026, 5, day, h, m, 0, 0)
const e = (ts: number): TLogEntry => ({ id: String(ts), ts })

describe('buildSnapshot', () => {
  it('counts today entries and tracks the latest', () => {
    const now = at(12)
    const snap = buildSnapshot([e(at(8).getTime()), e(at(10).getTime())], [], now)
    expect(snap).toEqual({ todayCount: 2, lastLoggedAt: at(10).getTime(), pendingTs: [], interactive: true })
  })

  it('is empty with no entries', () => {
    expect(buildSnapshot([], [], at(12))).toEqual({ todayCount: 0, lastLoggedAt: null, pendingTs: [], interactive: true })
  })

  it('counts pending taps from today once, even if also stored', () => {
    const ts = at(11).getTime()
    expect(buildSnapshot([e(ts)], [ts], at(12)).todayCount).toBe(1)
    expect(buildSnapshot([], [ts], at(12))).toMatchObject({ todayCount: 1, lastLoggedAt: ts })
  })

  it('does not count pending taps from another day', () => {
    expect(buildSnapshot([], [at(23, 50, 14).getTime()], at(12)).todayCount).toBe(0)
  })

  it('handles untagged and tagged entries alike', () => {
    const tagged: TLogEntry = { id: 'x', ts: at(9).getTime(), tag: 'COFFEE' }
    expect(buildSnapshot([tagged, e(at(10).getTime())], [], at(12)).todayCount).toBe(2)
  })
})

describe('buildTimeline', () => {
  it('carries interactive=false across midnight', () => {
    const now = at(18)
    expect(buildTimeline(buildSnapshot([], [], now, false), now)[1].props.interactive).toBe(false)
  })

  it('adds a midnight entry that resets the count but keeps lastLoggedAt', () => {
    const now = at(18)
    const snap = buildSnapshot([e(at(17).getTime())], [], now)
    const [first, midnight] = buildTimeline(snap, now)
    expect(first.props).toEqual(snap)
    expect(midnight.date).toEqual(startOfNextDay(now))
    expect(midnight.date.getHours()).toBe(0)
    expect(midnight.props).toEqual({ todayCount: 0, lastLoggedAt: at(17).getTime(), pendingTs: [], interactive: true })
  })
})

describe('midnight transition does not lose taps', () => {
  it('recovers a 23:50 tap held on the pre-midnight entry and files it under yesterday', () => {
    const now = at(23, 40)
    const timeline = buildTimeline(buildSnapshot([], [], now), now)
    // The widget applies +1 at 23:50 to the entry on screen (index 0) only.
    const tap = at(23, 50).getTime()
    const afterTap = [{ props: { ...timeline[0].props, todayCount: 1, pendingTs: [tap] } }, { props: timeline[1].props }]

    // At 00:05 the widget shows the midnight entry (pendingTs: []), but the app reads every entry.
    const pending = collectPending(afterTap)
    expect(pending).toEqual([tap])

    const adds = mergePending(pending, {})
    expect(adds).toEqual([{ dateStr: '2026-06-15', ts: tap }])

    // Today (the 16th) must not include yesterday's tap.
    expect(buildSnapshot([], pending, at(0, 5, 16)).todayCount).toBe(0)
  })

  it('keeps taps from both sides of midnight', () => {
    const before = at(23, 50).getTime()
    const after = at(0, 10, 16).getTime()
    const pending = collectPending([{ props: { pendingTs: [before] } }, { props: { pendingTs: [after] } }])
    expect(pending).toEqual([before, after])
    expect(mergePending(pending, {}).map((a) => a.dateStr)).toEqual(['2026-06-15', '2026-06-16'])
  })
})

describe('collectPending', () => {
  it('unions, dedupes and sorts across entries', () => {
    expect(collectPending([{ props: { pendingTs: [3, 1] } }, { props: { pendingTs: [2, 3] } }])).toEqual([1, 2, 3])
  })

  it('ignores missing, malformed or non-finite data', () => {
    expect(collectPending([{ props: null }, {}, { props: { pendingTs: [NaN, 5] } }, { props: { todayCount: 1 } }])).toEqual([5])
  })
})

describe('mergePending', () => {
  it('skips taps already stored for that day (idempotent)', () => {
    const ts = at(10).getTime()
    expect(mergePending([ts], { '2026-06-15': [e(ts)] })).toEqual([])
  })

  it('merges only what is missing, leaving other entries alone', () => {
    const stored = at(9).getTime()
    const tap = at(10).getTime()
    expect(mergePending([stored, tap], { '2026-06-15': [e(stored)] })).toEqual([{ dateStr: '2026-06-15', ts: tap }])
  })

  it('dedupes repeated pending values', () => {
    const ts = at(10).getTime()
    expect(mergePending([ts, ts], {})).toHaveLength(1)
  })

  it('merging twice yields nothing the second time', () => {
    const ts = at(10).getTime()
    const first = mergePending([ts], {})
    const stored = { [first[0].dateStr]: [e(first[0].ts)] }
    expect(mergePending([ts], stored)).toEqual([])
  })

  it('works against legacy-shaped stored entries', () => {
    // parseEntries turns bare numbers into { id: String(ts), ts }
    const ts = at(10).getTime()
    expect(mergePending([ts], { '2026-06-15': [{ id: String(ts), ts }] })).toEqual([])
  })

  it('returns nothing for an empty queue', () => {
    expect(mergePending([], {})).toEqual([])
  })
})

describe('carryForward', () => {
  it('keeps taps that arrived after the first read', () => {
    expect(carryForward([1, 2, 3], [1, 2])).toEqual([3])
  })

  it('returns nothing when everything was merged', () => {
    expect(carryForward([1, 2], [1, 2])).toEqual([])
  })
})
