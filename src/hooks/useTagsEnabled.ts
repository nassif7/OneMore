import { getTagsEnabled, setTagsEnabled } from '@/services/settings'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

export default function useTagsEnabled() {
  const [enabled, setEnabledState] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const load = useCallback(async () => {
    try {
      const value = await getTagsEnabled()
      setEnabledState(value)
    } catch (error) {
      console.error('[useTagsEnabled] Failed to load setting:', error)
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
      await setTagsEnabled(value)
    } catch (error) {
      console.error('[useTagsEnabled] Failed to save setting:', error)
    }
  }, [])

  return { enabled, isLoading, setEnabled }
}
