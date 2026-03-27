import { NUDGES } from '@/constants'
import { scheduleFirstCigNotification, scheduleNextNotification } from '@/services/notificationScheduler'
import { logCigarette } from '@/services/storage'
import { UseSmokeLoggerProps } from '@/types'
import * as Haptics from 'expo-haptics'
import { useCallback, useState } from 'react'

const randomNudge = (): string => NUDGES[Math.floor(Math.random() * NUDGES.length)]

export default function useSmokeLogger({ onSmoked, onScheduled }: UseSmokeLoggerProps) {
  const [nudge, setNudge] = useState<string>(NUDGES[0])

  const handleSmoke = useCallback(async (): Promise<void> => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    const updated = await logCigarette()
    const lastCigTime = updated[updated.length - 1]

    if (updated.length === 1) await scheduleFirstCigNotification()
    await scheduleNextNotification(lastCigTime)

    setNudge(randomNudge())
    onSmoked(updated)
    onScheduled?.()
  }, [onSmoked, onScheduled])

  return { nudge, handleSmoke }
}
