import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { getAllDays, getDay, getWeek } from '@/services/storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useReducer } from 'react'
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

interface StatsState {
  // today
  todayTimes: number[]
  // week
  weekData: TDayBar[]
  weekTotal: number
  weekLabel: string
  currentWeekStats: TPeriodStats
  prevWeekStats: TPeriodStats | null
  // month
  monthData: Record<string, number>
  currentMonthStats: TPeriodStats
  prevMonthStats: TPeriodStats | null
  // all-time
  allTimeDailyAvg: number
  allTimeAvgGap: string
  allTimeAvgGapMinutes: number | null
  // loading
  isLoading: boolean
  error: Error | null
}

type StatsAction =
  | {
      type: 'LOAD_START'
    }
  | {
      type: 'LOAD_SUCCESS'
      payload: Omit<StatsState, 'isLoading' | 'error'>
    }
  | {
      type: 'LOAD_ERROR'
      payload: Error
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

const initialState: StatsState = {
  todayTimes: [],
  weekData: [],
  weekTotal: 0,
  weekLabel: '',
  currentWeekStats: { dailyAvg: 0, avgGapMinutes: null, avgGapLabel: '—' },
  prevWeekStats: null,
  monthData: {},
  currentMonthStats: { dailyAvg: 0, avgGapMinutes: null, avgGapLabel: '—' },
  prevMonthStats: null,
  allTimeDailyAvg: 0,
  allTimeAvgGap: '—',
  allTimeAvgGapMinutes: null,
  isLoading: true,
  error: null,
}

function statsReducer(state: StatsState, action: StatsAction): StatsState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null }
    case 'LOAD_SUCCESS':
      return { ...action.payload, isLoading: false, error: null }
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload }
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook to manage stats data for week and month views.
 * Loads today, current/previous week, current/previous month, and all-time stats.
 * Handles errors gracefully by logging and showing empty states.
 */
export default function useStatsData(weekOffset: number = 0) {
  const [state, dispatch] = useReducer(statsReducer, initialState)

  const loadData = useCallback(async () => {
    dispatch({ type: 'LOAD_START' })
    try {
      const now = new Date()
      const todayKey = formatDateKey(now)

      // ── Today ──
      const todayData = await getDay(now)

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
      const weekTotal = bars.reduce((sum, d) => sum + d.count, 0)

      const weekEnd = days[6]
      const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
      const weekLabel = weekOffset === 0 ? 'THIS WEEK' : `${fmt(weekStart)} – ${fmt(weekEnd)}`

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
      const prevWeekStats = prevWeekHasData ? computePeriodStats(prevWeekData) : null

      // ── Current month ──
      const currentMonthKeys = getMonthKeys(now.getFullYear(), now.getMonth())
      const currentMonthData = await getWeek(currentMonthKeys)
      const currentMonthStats = computePeriodStats(currentMonthData)

      // ── Previous month ──
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevMonthKeys = getMonthKeys(prevMonthDate.getFullYear(), prevMonthDate.getMonth())
      const prevMonthData = await getWeek(prevMonthKeys)
      const prevMonthHasData = prevMonthKeys.some((k) => (prevMonthData[k] ?? []).length > 0)
      const prevMonthStats = prevMonthHasData ? computePeriodStats(prevMonthData) : null

      // ── All-time ──
      const allData = await getAllDays()
      const allTimeStats = computePeriodStats(allData)

      // ── Month calendar data ──
      const monthRecord: Record<string, number> = {}
      for (const [key, times] of Object.entries(allData)) {
        monthRecord[key] = times.length
      }

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          todayTimes: todayData,
          weekData: bars,
          weekTotal,
          weekLabel,
          currentWeekStats: computePeriodStats(currentData),
          prevWeekStats,
          monthData: monthRecord,
          currentMonthStats,
          prevMonthStats,
          allTimeDailyAvg: allTimeStats.dailyAvg,
          allTimeAvgGap: allTimeStats.avgGapLabel,
          allTimeAvgGapMinutes: allTimeStats.avgGapMinutes,
        },
      })
    } catch (error) {
      console.error('[useStatsData] Error loading data:', error)
      dispatch({
        type: 'LOAD_ERROR',
        payload: error instanceof Error ? error : new Error('Unknown error loading stats'),
      })
    }
  }, [weekOffset])

  useFocusEffect(
    useCallback(() => {
      loadData()
      const sub = AppState.addEventListener('change', (appState) => {
        if (appState === 'active') loadData()
      })
      return () => sub.remove()
    }, [loadData]),
  )

  // ── Derived ──
  const todayAvgGapMinutes = getAvgGapMinutes([state.todayTimes])
  const stats: TStats = {
    todayCount: state.todayTimes.length,
    weekTotal: state.weekTotal,
    dailyAvg: state.currentWeekStats.dailyAvg,
    packEquiv: (state.weekTotal / 20).toFixed(1),
    avgGap: getAvgGap(state.todayTimes),
    lastOne: getTimeSinceLast(state.todayTimes),
  }

  return {
    // today
    stats,
    todayAvgGapMinutes,
    // week
    weekData: state.weekData,
    weekLabel: state.weekLabel,
    currentWeekStats: state.currentWeekStats,
    prevWeekStats: state.prevWeekStats,
    // month
    monthData: state.monthData,
    currentMonthStats: state.currentMonthStats,
    prevMonthStats: state.prevMonthStats,
    // all-time
    allTimeDailyAvg: state.allTimeDailyAvg,
    allTimeAvgGap: state.allTimeAvgGap,
    allTimeAvgGapMinutes: state.allTimeAvgGapMinutes,
    // state
    isLoading: state.isLoading,
    error: state.error,
  }
}
