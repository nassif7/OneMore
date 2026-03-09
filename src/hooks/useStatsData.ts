import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { getDay, getLast7Days } from '@/services/storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { AppState } from 'react-native'

export type TDayBar = {
  label: string
  count: number
}

export type TStats = {
  todayCount: number
  weekTotal: number
  dailyAvg: number
  packEquiv: string
  avgGap: string
  lastOne: string
}

export default function useStatsData() {
  const [todayTimes, setTodayTimes] = useState<number[]>([])
  const [weekData, setWeekData] = useState<TDayBar[]>([])
  const [weekTotal, setWeekTotal] = useState<number>(0)

  const loadData = useCallback(async () => {
    const today = await getDay(new Date())
    setTodayTimes(today)

    const last7 = await getLast7Days()
    const bars: TDayBar[] = Object.entries(last7)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, times]) => ({
        label: new Date(key).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 1),
        count: times.length,
      }))

    setWeekData(bars)
    setWeekTotal(bars.reduce((sum, d) => sum + d.count, 0))
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadData()
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') loadData()
      })
      return () => sub.remove()
    }, [loadData]),
  )

  const todayCount = todayTimes.length
  const dailyAvg = weekData.length ? Math.round(weekTotal / weekData.length) : 0
  const packEquiv = (weekTotal / 20).toFixed(1)
  const avgGap = getAvgGap(todayTimes)
  const lastOne = getTimeSinceLast(todayTimes)

  const stats: TStats = {
    todayCount,
    weekTotal,
    dailyAvg,
    packEquiv,
    avgGap,
    lastOne,
  }

  return { weekData, stats }
}
