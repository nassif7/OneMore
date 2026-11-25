import { TTagCount } from '@/types'
import { deltaPercent, formatRate, getMonthDots, getTopTags, upperGap, weekOfLabel } from './statsOverview'

describe('formatRate', () => {
  it('shows a per-day rate', () => expect(formatRate(4)).toBe('4/DAY'))
  it('shows a dash with no data', () => expect(formatRate(0)).toBe('—'))
})

describe('upperGap', () => {
  it('uppercases lowercase helper output', () => {
    expect(upperGap('36m')).toBe('36M')
    expect(upperGap('1h 5m')).toBe('1H 5M')
    expect(upperGap('N/A')).toBe('N/A')
    expect(upperGap('—')).toBe('—')
  })
})

describe('weekOfLabel', () => {
  it('formats the first day of the week', () => expect(weekOfLabel('2026-11-17')).toBe('WEEK OF NOV 17'))
  it('does not shift across a month boundary', () => expect(weekOfLabel('2026-12-01')).toBe('WEEK OF DEC 1'))
})

describe('deltaPercent', () => {
  it('computes the rounded change', () => {
    expect(deltaPercent(8, 12)).toBe(-33)
    expect(deltaPercent(110, 100)).toBe(10)
    expect(deltaPercent(5, 5)).toBe(0)
  })
  it('is null when the current value is empty, never -100%', () => {
    expect(deltaPercent(null, 84)).toBeNull()
  })
  it('is null when the previous period has no data', () => {
    expect(deltaPercent(84, null)).toBeNull()
    expect(deltaPercent(84, 0)).toBeNull()
    expect(deltaPercent(null, null)).toBeNull()
  })
})

describe('getMonthDots', () => {
  const now = new Date(2026, 10, 25, 12) // 25 Nov 2026 (30 days)
  it('has one dot per day, marking today and the future', () => {
    const dots = getMonthDots({ '2026-11-03': 5, '2026-11-25': 2, '2026-10-30': 9 }, now)
    expect(dots).toHaveLength(30)
    expect(dots[2]).toMatchObject({ day: 3, count: 5, isToday: false, isFuture: false })
    expect(dots[24]).toMatchObject({ day: 25, count: 2, isToday: true, isFuture: false })
    expect(dots[25]).toMatchObject({ day: 26, count: 0, isFuture: true })
    expect(dots.filter((d) => d.isToday)).toHaveLength(1)
  })
  it('is all zeros for a new user', () => {
    expect(getMonthDots({}, now).every((d) => d.count === 0)).toBe(true)
  })
})

describe('getTopTags', () => {
  const b = (tag: TTagCount['tag'], count: number): TTagCount => ({ tag, count, pct: 0 })
  it('takes the first n used tags', () => {
    expect(getTopTags([b('COFFEE', 5), b('SOCIAL', 3), b('BORED', 2), b('MOOD' as never, 1)], 3).map((t) => t.tag)).toEqual(['COFFEE', 'SOCIAL', 'BORED'])
  })
  it('skips unused tags and handles empty', () => {
    expect(getTopTags([b('COFFEE', 0), b('SOCIAL', 0)], 3)).toEqual([])
    expect(getTopTags([b('COFFEE', 2), b('SOCIAL', 0)], 3)).toHaveLength(1)
    expect(getTopTags([], 3)).toEqual([])
  })
})
