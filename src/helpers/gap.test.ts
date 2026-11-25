import { TLogEntry } from '@/types'
import { getAvgGap } from '@/services/stats'
import { formatAvgGap, getAvgGapMs, NO_GAP_LABEL } from './gap'
import { buildSnapshot } from './widgetSync'

const MIN = 60000
const at = (h: number, m = 0, day = 15) => new Date(2026, 5, day, h, m, 0, 0).getTime()
const e = (ts: number): TLogEntry => ({ id: String(ts), ts })

describe('getAvgGapMs', () => {
  it('is null with 0 entries', () => expect(getAvgGapMs([])).toBeNull())
  it('is null with 1 entry', () => expect(getAvgGapMs([at(9)])).toBeNull())

  it('is the gap itself with 2 entries', () => expect(getAvgGapMs([at(9), at(9, 40)])).toBe(40 * MIN))

  it('averages consecutive gaps with 3+ entries', () => {
    // gaps: 30m, 90m → 60m
    expect(getAvgGapMs([at(9), at(9, 30), at(11)])).toBe(60 * MIN)
  })

  it('does not depend on input order and does not mutate the input', () => {
    const input = [at(11), at(9), at(9, 30)]
    const copy = [...input]
    expect(getAvgGapMs(input)).toBe(60 * MIN)
    expect(input).toEqual(copy)
  })

  it('treats entries across midnight as plain timestamps (callers pass one day)', () => {
    expect(getAvgGapMs([at(23, 30, 14), at(0, 30, 15)])).toBe(60 * MIN)
  })
})

describe('formatAvgGap', () => {
  it('uses the N/A empty state with fewer than 2 entries', () => {
    expect(formatAvgGap([])).toBe(NO_GAP_LABEL)
    expect(formatAvgGap([at(9)])).toBe('N/A')
  })

  it('formats minutes and hours', () => {
    expect(formatAvgGap([at(9), at(9, 36)])).toBe('36m')
    expect(formatAvgGap([at(9), at(10, 5)])).toBe('1h 5m')
    expect(formatAvgGap([at(9), at(11)])).toBe('2h 0m')
  })
})

describe('home screen and widget agree', () => {
  const cases: Record<string, number[]> = {
    none: [],
    one: [at(9)],
    two: [at(9), at(9, 36)],
    unsorted: [at(11), at(9), at(9, 30)],
    many: [at(8), at(8, 45), at(10, 10), at(13, 5), at(13, 20)],
  }
  it.each(Object.entries(cases))('%s', (_name, ts) => {
    const now = new Date(at(18))
    const widget = buildSnapshot(ts.map(e), [], now).avgGapLabel
    expect(widget).toBe(getAvgGap(ts.map(e)))
  })

  it('includes pending widget taps from today and ignores yesterday\'s', () => {
    const now = new Date(at(18))
    expect(buildSnapshot([e(at(9))], [at(9, 30), at(23, 50, 14)], now).avgGapLabel).toBe('30m')
  })
})
