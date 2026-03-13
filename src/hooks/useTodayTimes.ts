import { getDay } from '@/services/storage'
import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'

export default function useTodayTimes() {
  const [times, setTimes] = useState<number[]>([])

  const loadToday = useCallback(async () => {
    const todayTimes = await getDay(new Date())
    setTimes(todayTimes)
  }, [])

  useEffect(() => {
    loadToday()

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadToday()
    })

    return () => sub.remove()
  }, [loadToday])

  return { times, setTimes, reload: loadToday }
}
