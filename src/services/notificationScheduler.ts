import {
  FIRST_CIG_NOTIF_KEY,
  MIN_GAPS_FOR_CUTOFF,
  NEXT_NOTIF_BODY_KEY,
  NEXT_NOTIF_TIME_BUFFER,
  NEXT_NOTIF_TIME_KEY,
  NUDGES,
  PENDING_NOTIF_KEY,
  SLEEP_TIME_CUTOFF_MINUTES,
} from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { SmokingPattern } from './patternCalculator'

// ─── Types ────────────────────────────────────────────────────────────────────

export class NotificationSchedulerError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message)
    this.name = 'NotificationSchedulerError'
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toMinutesSinceMidnight = (ts: number): number => {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

const randomNudge = (): string => NUDGES[Math.floor(Math.random() * NUDGES.length)]

// ─── Cancel Pending ───────────────────────────────────────────────────────────

export const cancelPendingNotification = async (): Promise<void> => {
  try {
    const id = await AsyncStorage.getItem(PENDING_NOTIF_KEY)
    if (id) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id)
      } catch (error) {
        console.warn('[NotificationScheduler] Failed to cancel notification:', error)
      }
      await AsyncStorage.removeItem(PENDING_NOTIF_KEY)
      await AsyncStorage.removeItem(NEXT_NOTIF_TIME_KEY)
      await AsyncStorage.removeItem(NEXT_NOTIF_BODY_KEY)
    }
  } catch (error) {
    console.error('[NotificationScheduler] Error canceling pending notification:', error)
    throw new NotificationSchedulerError('Failed to cancel pending notification', error)
  }
}

// ─── Schedule Next Notification ───────────────────────────────────────────────

/**
 * Schedule next notification based on average gap between cigarettes.
 * Includes sleep-time cutoff to avoid scheduling during sleep hours.
 */
export const scheduleNextNotification = async (lastCigTime: number, pattern: SmokingPattern): Promise<void> => {
  try {
    await cancelPendingNotification()

    // Need at least one gap to schedule
    if (!pattern.avgGapMs) return

    const nextTime = new Date(lastCigTime + pattern.avgGapMs * NEXT_NOTIF_TIME_BUFFER)

    // Only apply the cutoff once we have enough data to trust it
    if (pattern.totalGapsCount >= MIN_GAPS_FOR_CUTOFF && pattern.avgLastCigMinutes !== null) {
      const cutoffMinutes = pattern.avgLastCigMinutes - SLEEP_TIME_CUTOFF_MINUTES
      const nextMinutes = toMinutesSinceMidnight(nextTime.getTime())
      if (nextMinutes > cutoffMinutes) return
    }

    // Don't schedule in the past
    const secondsUntilNext = Math.round((nextTime.getTime() - Date.now()) / 1000)
    if (secondsUntilNext <= 0) return

    // Use the same nudge for both the stored body and the notification
    const nudge = randomNudge()

    try {
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
    } catch (error) {
      console.error('[NotificationScheduler] Failed to schedule notification:', error)
      throw new NotificationSchedulerError('Failed to schedule notification', error)
    }
  } catch (error) {
    console.error('[NotificationScheduler] Error in scheduleNextNotification:', error)
    if (error instanceof NotificationSchedulerError) throw error
    throw new NotificationSchedulerError('Unexpected error scheduling notification', error)
  }
}

// ─── Schedule First Cigarette Notification ─────────────────────────────────────

/**
 * Schedule notification for first cigarette of the next day.
 * Scheduled at average time of first cigarette based on history.
 */
export const scheduleFirstCigNotification = async (pattern: SmokingPattern): Promise<void> => {
  try {
    if (pattern.avgFirstCigMinutes === null) return

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(Math.floor(pattern.avgFirstCigMinutes / 60), Math.round(pattern.avgFirstCigMinutes % 60), 0, 0)

    const secondsUntilFirst = Math.round((tomorrow.getTime() - Date.now()) / 1000)
    if (secondsUntilFirst <= 0) return

    try {
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
    } catch (error) {
      console.error('[NotificationScheduler] Failed to schedule first cig notification:', error)
      throw new NotificationSchedulerError('Failed to schedule first cigarette notification', error)
    }
  } catch (error) {
    console.error('[NotificationScheduler] Error in scheduleFirstCigNotification:', error)
    if (error instanceof NotificationSchedulerError) throw error
    throw new NotificationSchedulerError('Unexpected error scheduling first cig notification', error)
  }
}
