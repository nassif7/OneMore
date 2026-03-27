import {
  FIRST_CIG_NOTIF_KEY,
  MIN_GAPS_FOR_CUTOFF,
  NEXT_NOTIF_BODY_KEY,
  NEXT_NOTIF_TIME_KEY,
  NUDGES,
  PENDING_NOTIF_KEY,
} from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { computePattern } from './patternCalculator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toMinutesSinceMidnight = (ts: number): number => {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

const randomNudge = (): string => NUDGES[Math.floor(Math.random() * NUDGES.length)]

// ─── Cancel Pending ───────────────────────────────────────────────────────────

export const cancelPendingNotification = async (): Promise<void> => {
  const id = await AsyncStorage.getItem(PENDING_NOTIF_KEY)
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id)
    await AsyncStorage.removeItem(PENDING_NOTIF_KEY)
    await AsyncStorage.removeItem(NEXT_NOTIF_TIME_KEY)
    await AsyncStorage.removeItem(NEXT_NOTIF_BODY_KEY)
  }
}

// ─── Schedule Next Notification ───────────────────────────────────────────────

export const scheduleNextNotification = async (lastCigTime: number): Promise<void> => {
  await cancelPendingNotification()

  const pattern = await computePattern()

  // Need at least one gap to schedule
  if (!pattern.avgGapMs) return

  const nextTime = new Date(lastCigTime + pattern.avgGapMs * 1.1)

  // Only apply the cutoff once we have enough data to trust it
  if (pattern.totalGapsCount >= MIN_GAPS_FOR_CUTOFF && pattern.avgLastCigMinutes !== null) {
    const cutoffMinutes = pattern.avgLastCigMinutes - 30
    const nextMinutes = toMinutesSinceMidnight(nextTime.getTime())
    if (nextMinutes > cutoffMinutes) return
  }

  // Don't schedule in the past
  const secondsUntilNext = Math.round((nextTime.getTime() - Date.now()) / 1000)
  if (secondsUntilNext <= 0) return

  // Use the same nudge for both the stored body and the notification
  const nudge = randomNudge()

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ONEMORE',
      body: nudge,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilNext,
      repeats: false,
    },
  })

  await AsyncStorage.setItem(NEXT_NOTIF_BODY_KEY, nudge)
  await AsyncStorage.setItem(NEXT_NOTIF_TIME_KEY, String(nextTime.getTime()))
  await AsyncStorage.setItem(PENDING_NOTIF_KEY, id)
}

// ─── Schedule First Cigarette Notification ─────────────────────────────────────

export const scheduleFirstCigNotification = async (): Promise<void> => {
  const pattern = await computePattern()

  if (pattern.avgFirstCigMinutes === null) return

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(Math.floor(pattern.avgFirstCigMinutes / 60), Math.round(pattern.avgFirstCigMinutes % 60), 0, 0)

  const secondsUntilFirst = Math.round((tomorrow.getTime() - Date.now()) / 1000)
  if (secondsUntilFirst <= 0) return

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ONEMORE',
      body: randomNudge(),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilFirst,
      repeats: false,
    },
  })

  await AsyncStorage.setItem(FIRST_CIG_NOTIF_KEY, id)
}
