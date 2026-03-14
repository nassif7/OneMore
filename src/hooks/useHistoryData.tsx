import { getLast7Days } from '@/services/storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { AppState } from 'react-native'

export type TDayEntry = {
  key: string
  label: string
  fullDate: string
  times: number[]
}

export default function useHistoryData() {
  const [days, setDays] = useState<TDayEntry[]>([])

  const loadData = useCallback(async () => {
    const last7 = await getLast7Days()

    const entries: TDayEntry[] = Object.entries(last7)
      .sort(([a], [b]) => b.localeCompare(a)) // most recent first
      .map(([key, times]) => {
        const date = new Date(key)
        return {
          key,
          label: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
          times,
        }
      })

    setDays(entries)
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

  const maxCount = Math.max(...days.map((d) => d.times.length), 1)

  return { days, maxCount }
}
