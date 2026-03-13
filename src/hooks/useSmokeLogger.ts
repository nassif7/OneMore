import { scheduleFirstCigNotification, scheduleNextNotification } from '@/services/notifications'
import { logCigarette } from '@/services/storage'
import * as Haptics from 'expo-haptics'
import { useCallback, useState } from 'react'

const NUDGES: string[] = [
  'GO ON THEN.',
  "WE'RE NOT JUDGING.",
  'YOUR LUNGS, YOUR RULES.',
  'ONE MORE NEVER KILLED— wait.',
  'DO IT. DO IT. DO IT.',
  'ACCOUNTABILITY? NEVER HEARD OF HER.',
]

const randomNudge = (): string => NUDGES[Math.floor(Math.random() * NUDGES.length)]

interface UseSmokeLoggerProps {
  onSmoked: (updatedTimes: number[]) => void
}

export default function useSmokeLogger({ onSmoked }: UseSmokeLoggerProps) {
  const [nudge, setNudge] = useState<string>(NUDGES[0])

  const handleSmoke = useCallback(async (): Promise<void> => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    const updated = await logCigarette()
    const lastCigTime = updated[updated.length - 1]

    if (updated.length === 1) {
      await scheduleFirstCigNotification()
    }
    await scheduleNextNotification(lastCigTime)

    setNudge(randomNudge())

    onSmoked(updated)
  }, [onSmoked])

  return { nudge, handleSmoke }
}
