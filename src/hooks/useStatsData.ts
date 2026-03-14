import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { getAllDays, getDay, getWeek } from '@/services/storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { AppState } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TDayBar = {
  label: string
  count: number
  isToday: boolean
  dateStr: string
}

export type TPeriodStats = {
  dailyAvg: number
  avgGapMinutes: number | null
  avgGapLabel: string
}

export type TStats = {
  todayCount: number
  weekTotal: number
  dailyAvg: number
  packEquiv: string
  avgGap: string
  lastOne: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date, offsetWeeks: number): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMon + offsetWeeks * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function getMonthKeys(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    return formatDateKey(d)
  })
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getAvgGapMinutes(allTimes: number[][]): number | null {
  const gaps: number[] = []
  for (const times of allTimes) {
    const sorted = [...times].sort()
    for (let i = 1; i < sorted.length; i++) {
      gaps.push((sorted[i] - sorted[i - 1]) / 60000)
    }
  }
  if (!gaps.length) return null
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
}

function formatGap(minutes: number | null): string {
  if (minutes === null) return '—'
  if (minutes < 60) return `${minutes}M`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}H ${m}M` : `${h}H`
}

function computePeriodStats(data: Record<string, number[]>): TPeriodStats {
  const counts = Object.values(data).map((t) => t.length)
  const daysWithData = counts.filter((c) => c > 0)
  const dailyAvg = daysWithData.length ? Math.round(daysWithData.reduce((a, b) => a + b, 0) / daysWithData.length) : 0
  const avgGapMinutes = getAvgGapMinutes(Object.values(data))
  return { dailyAvg, avgGapMinutes, avgGapLabel: formatGap(avgGapMinutes) }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useStatsData(weekOffset: number = 0) {
  // ── Today ──
  const [todayTimes, setTodayTimes] = useState<number[]>([])

  // ── Week ──
  const [weekData, setWeekData] = useState<TDayBar[]>([])
  const [weekTotal, setWeekTotal] = useState<number>(0)
  const [weekLabel, setWeekLabel] = useState<string>('')
  const [currentWeekStats, setCurrentWeekStats] = useState<TPeriodStats>({
    dailyAvg: 0,
    avgGapMinutes: null,
    avgGapLabel: '—',
  })
  const [prevWeekStats, setPrevWeekStats] = useState<TPeriodStats | null>(null)

  // ── Month ──
  const [monthData, setMonthData] = useState<Record<string, number>>({})
  const [currentMonthStats, setCurrentMonthStats] = useState<TPeriodStats>({
    dailyAvg: 0,
    avgGapMinutes: null,
    avgGapLabel: '—',
  })
  const [prevMonthStats, setPrevMonthStats] = useState<TPeriodStats | null>(null)

  // ── All-time ──
  const [allTimeDailyAvg, setAllTimeDailyAvg] = useState<number>(0)
  const [allTimeAvgGap, setAllTimeAvgGap] = useState<string>('—')
  const [allTimeAvgGapMinutes, setAllTimeAvgGapMinutes] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    const now = new Date()
    const todayKey = formatDateKey(now)

    // ── Today ──
    const todayData = await getDay(now)
    setTodayTimes(todayData)

    // ── Current week ──
    const weekStart = getWeekStart(now, weekOffset)
    const days: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
    const currentKeys = days.map(formatDateKey)
    const currentData = await getWeek(currentKeys)
    const bars: TDayBar[] = days.map((d, i) => ({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 1),
      count: (currentData[currentKeys[i]] ?? []).length,
      isToday: currentKeys[i] === todayKey,
      dateStr: currentKeys[i],
    }))
    const total = bars.reduce((sum, d) => sum + d.count, 0)
    setWeekData(bars)
    setWeekTotal(total)
    setCurrentWeekStats(computePeriodStats(currentData))

    const weekEnd = days[6]
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    setWeekLabel(weekOffset === 0 ? 'THIS WEEK' : `${fmt(weekStart)} – ${fmt(weekEnd)}`)

    // ── Previous week ──
    const prevWeekStart = getWeekStart(now, weekOffset - 1)
    const prevWeekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(prevWeekStart)
      d.setDate(d.getDate() + i)
      return d
    })
    const prevWeekKeys = prevWeekDays.map(formatDateKey)
    const prevWeekData = await getWeek(prevWeekKeys)
    const prevWeekHasData = prevWeekKeys.some((k) => (prevWeekData[k] ?? []).length > 0)
    setPrevWeekStats(prevWeekHasData ? computePeriodStats(prevWeekData) : null)

    // ── Current month ──
    const currentMonthKeys = getMonthKeys(now.getFullYear(), now.getMonth())
    const currentMonthData = await getWeek(currentMonthKeys)
    setCurrentMonthStats(computePeriodStats(currentMonthData))

    // ── Previous month ──
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthKeys = getMonthKeys(prevMonthDate.getFullYear(), prevMonthDate.getMonth())
    const prevMonthData = await getWeek(prevMonthKeys)
    const prevMonthHasData = prevMonthKeys.some((k) => (prevMonthData[k] ?? []).length > 0)
    setPrevMonthStats(prevMonthHasData ? computePeriodStats(prevMonthData) : null)

    // ── All-time ──
    const allData = await getAllDays()
    const allTimeStats = computePeriodStats(allData)
    setAllTimeDailyAvg(allTimeStats.dailyAvg)
    setAllTimeAvgGap(allTimeStats.avgGapLabel)
    setAllTimeAvgGapMinutes(allTimeStats.avgGapMinutes)

    // ── Month calendar data ──
    const monthRecord: Record<string, number> = {}
    for (const [key, times] of Object.entries(allData)) {
      monthRecord[key] = times.length
    }
    setMonthData(monthRecord)
  }, [weekOffset])

  useFocusEffect(
    useCallback(() => {
      loadData()
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') loadData()
      })
      return () => sub.remove()
    }, [loadData]),
  )

  // ── Derived ──
  const todayAvgGapMinutes = getAvgGapMinutes([todayTimes])
  const stats: TStats = {
    todayCount: todayTimes.length,
    weekTotal,
    dailyAvg: currentWeekStats.dailyAvg,
    packEquiv: (weekTotal / 20).toFixed(1),
    avgGap: getAvgGap(todayTimes),
    lastOne: getTimeSinceLast(todayTimes),
  }

  return {
    // today
    stats,
    todayAvgGapMinutes,
    // week
    weekData,
    weekLabel,
    currentWeekStats,
    prevWeekStats,
    // month
    monthData,
    currentMonthStats,
    prevMonthStats,
    // all-time
    allTimeDailyAvg,
    allTimeAvgGap,
    allTimeAvgGapMinutes,
  }
}
