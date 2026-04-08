import { NUDGES } from '@/constants'
import { scheduleFirstCigNotification, scheduleNextNotification } from '@/services/notificationScheduler'
import { computePattern, PatternCalculatorError } from '@/services/patternCalculator'
import { logCigarette } from '@/services/storage'
import { UseSmokeLoggerProps } from '@/types'
import * as Haptics from 'expo-haptics'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'

const randomNudge = (): string => NUDGES[Math.floor(Math.random() * NUDGES.length)]

export default function useSmokeLogger({ onSmoked, onScheduled }: UseSmokeLoggerProps) {
  const [nudge, setNudge] = useState<string>(NUDGES[0])

  const handleSmoke = useCallback(async (): Promise<void> => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    let updated: number[]
    try {
      updated = await logCigarette()
    } catch (error) {
      console.error('[useSmokeLogger] Failed to log cigarette:', error)
      Alert.alert('ERROR', 'Failed to log. Please try again.')
      return
    }

    const lastCigTime = updated[updated.length - 1]

    try {
      const pattern = await computePattern()
      if (updated.length === 1) await scheduleFirstCigNotification(pattern)
      await scheduleNextNotification(lastCigTime, pattern)
    } catch (error) {
      if (!(error instanceof PatternCalculatorError)) {
        console.error('[useSmokeLogger] Notification scheduling failed:', error)
      }
    }

    setNudge(randomNudge())
    onSmoked(updated)
    onScheduled?.()
  }, [onSmoked, onScheduled])

  return { nudge, handleSmoke }
}
