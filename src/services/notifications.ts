import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'

// ─── Constants ────────────────────────────────────────────────────────────────

const NEXT_NOTIF_TIME_KEY = 'next_notification_time'
const NEXT_NOTIF_BODY_KEY = 'next_notification_body'
const PENDING_NOTIF_KEY = 'pending_notification_id'
const FIRST_CIG_NOTIF_KEY = 'first_cig_notif_id'
const DAY_PREFIX = 'day:'

// Minimum gaps needed before we trust the pattern enough to apply cutoff
const MIN_GAPS_FOR_CUTOFF = 5

export const NUDGES = [
  'GO ON THEN.',
  "WE'RE NOT JUDGING.",
  'YOUR LUNGS, YOUR RULES.',
  'ONE MORE NEVER KILLED— wait.',
  'DO IT. DO IT. DO IT.',
  'FEELING THAT ITCH?',
  'YOUR LUNGS CALLED. THEY MISS YOU.',
  'ACCOUNTABILITY? NEVER HEARD OF HER.',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toMinutesSinceMidnight = (ts: number): number => {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

const randomNudge = (): string => NUDGES[Math.floor(Math.random() * NUDGES.length)]

// ─── Types ────────────────────────────────────────────────────────────────────

type TSmokingPattern = {
  avgGapMs: number | null
  avgFirstCigMinutes: number | null
  avgLastCigMinutes: number | null
  totalGapsCount: number
}

// ─── Permission ───────────────────────────────────────────────────────────────

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// ─── Pattern ──────────────────────────────────────────────────────────────────

export const computePattern = async (): Promise<TSmokingPattern> => {
  const allKeys = await AsyncStorage.getAllKeys()
  const dayKeys = allKeys.filter((k) => k.startsWith(DAY_PREFIX)).sort()

  const gaps: number[] = []
  const firstMins: number[] = []
  const lastMins: number[] = []

  for (const key of dayKeys) {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) continue
    const times: number[] = JSON.parse(raw)
    if (times.length === 0) continue

    firstMins.push(toMinutesSinceMidnight(times[0]))
    lastMins.push(toMinutesSinceMidnight(times[times.length - 1]))

    for (let i = 1; i < times.length; i++) {
      gaps.push(times[i] - times[i - 1])
    }
  }

  return {
    avgGapMs: gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
    avgFirstCigMinutes: firstMins.length > 0 ? firstMins.reduce((a, b) => a + b, 0) / firstMins.length : null,
    avgLastCigMinutes: lastMins.length > 0 ? lastMins.reduce((a, b) => a + b, 0) / lastMins.length : null,
    totalGapsCount: gaps.length,
  }
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

export const cancelPendingNotification = async (): Promise<void> => {
  const id = await AsyncStorage.getItem(PENDING_NOTIF_KEY)
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id)
    await AsyncStorage.removeItem(PENDING_NOTIF_KEY)
    await AsyncStorage.removeItem(NEXT_NOTIF_TIME_KEY)
    await AsyncStorage.removeItem(NEXT_NOTIF_BODY_KEY)
  }
}

// ─── Schedule next ────────────────────────────────────────────────────────────

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

// ─── Schedule first cig ───────────────────────────────────────────────────────

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

// ─── Handler setup ────────────────────────────────────────────────────────────

export const setupNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
}

// ─── Readers ──────────────────────────────────────────────────────────────────

export const getNextNotificationTime = async (): Promise<number | null> => {
  const val = await AsyncStorage.getItem(NEXT_NOTIF_TIME_KEY)
  return val ? parseInt(val, 10) : null
}

export const getNextNotificationBody = async (): Promise<string | null> => {
  return AsyncStorage.getItem(NEXT_NOTIF_BODY_KEY)
}
