import { getDay } from '@/services/storage'
import { TLogEntry } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'

interface UseTodayTimesState {
  entries: TLogEntry[]
  isLoading: boolean
  error: Error | null
}

export default function useTodayTimes() {
  const [state, setState] = useState<UseTodayTimesState>({
    entries: [],
    isLoading: true,
    error: null,
  })

  const loadToday = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const todayEntries = await getDay(new Date())
      setState((s) => ({ ...s, entries: todayEntries, isLoading: false, error: null }))
    } catch (error) {
      console.error('[useTodayTimes] Error loading today times:', error)
      setState((s) => ({
        ...s,
        entries: [],
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

  const setEntries = useCallback((entries: TLogEntry[]) => {
    setState((s) => ({ ...s, entries }))
  }, [])

  return {
    entries: state.entries,
    setEntries,
    reload: loadToday,
    isLoading: state.isLoading,
    error: state.error,
  }
}
