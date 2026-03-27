import { getDay } from '@/services/storage'
import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'

interface UseTodayTimesState {
  times: number[]
  isLoading: boolean
  error: Error | null
}

export default function useTodayTimes() {
  const [state, setState] = useState<UseTodayTimesState>({
    times: [],
    isLoading: true,
    error: null,
  })

  const loadToday = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const todayTimes = await getDay(new Date())
      setState((s) => ({ ...s, times: todayTimes, isLoading: false, error: null }))
    } catch (error) {
      console.error('[useTodayTimes] Error loading today times:', error)
      setState((s) => ({
        ...s,
        times: [],
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error loading today times'),
      }))
    }
  }, [])

  useEffect(() => {
    loadToday()

    const sub = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') loadToday()
    })

    return () => sub.remove()
  }, [loadToday])

  const setTimes = useCallback((times: number[]) => {
    setState((s) => ({ ...s, times }))
  }, [])

  return {
    times: state.times,
    setTimes,
    reload: loadToday,
    isLoading: state.isLoading,
    error: state.error,
  }
}
