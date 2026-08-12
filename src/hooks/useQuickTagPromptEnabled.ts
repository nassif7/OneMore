import { getQuickTagPromptEnabled, setQuickTagPromptEnabled } from '@/services/settings'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

export default function useQuickTagPromptEnabled() {
  const [enabled, setEnabledState] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const load = useCallback(async () => {
    try {
      const value = await getQuickTagPromptEnabled()
      setEnabledState(value)
    } catch (error) {
      console.error('[useQuickTagPromptEnabled] Failed to load setting:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const setEnabled = useCallback(async (value: boolean) => {
    setEnabledState(value)
    try {
      await setQuickTagPromptEnabled(value)
    } catch (error) {
      console.error('[useQuickTagPromptEnabled] Failed to save setting:', error)
    }
  }, [])

  return { enabled, isLoading, setEnabled }
}
