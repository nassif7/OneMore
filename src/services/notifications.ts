import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'

// ─── Constants ────────────────────────────────────────────────────────────────

const PENDING_NOTIF_KEY = 'pending_notification_id'

const NUDGES = [
  'GO ON THEN.',
  "WE'RE NOT JUDGING.",
  'YOUR LUNGS, YOUR RULES.',
  'ONE MORE NEVER KILLED— wait.',
  'DO IT. DO IT. DO IT.',
  'FEELING THAT ITCH?',
  'YOUR LUNGS CALLED. THEY MISS YOU.',
  'ACCOUNTABILITY? NEVER HEARD OF HER.',
]

// ─── Permission ───────────────────────────────────────────────────────────────

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert a timestamp to minutes since midnight
const toMinutesSinceMidnight = (ts: number): number => {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

// Set a Date to a specific minutes-since-midnight value today
const todayAtMinutes = (minutes: number): Date => {
  const d = new Date()
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return d
}

const randomNudge = (): string => NUDGES[Math.floor(Math.random() * NUDGES.length)]

// ─── Stats from all history ───────────────────────────────────────────────────

interface SmokingPattern {
  avgGapMs: number | null // avg ms between consecutive cigs
  avgFirstCigMinutes: number | null // avg time-of-day of first cig (mins since midnight)
  avgLastCigMinutes: number | null // avg time-of-day of last cig (mins since midnight)
}

export const computePattern = async (): Promise<SmokingPattern> => {
  const allKeys = await AsyncStorage.getAllKeys()
  const dayKeys = allKeys.filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort()

  const gaps: number[] = []
  const firstMins: number[] = []
  const lastMins: number[] = []

  for (const key of dayKeys) {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) continue
    const times: number[] = JSON.parse(raw)
    if (times.length === 0) continue

    // First and last cig time of day
    firstMins.push(toMinutesSinceMidnight(times[0]))
    lastMins.push(toMinutesSinceMidnight(times[times.length - 1]))

    // Gaps between consecutive cigs
    for (let i = 1; i < times.length; i++) {
      gaps.push(times[i] - times[i - 1])
    }
  }

  return {
    avgGapMs: gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
    avgFirstCigMinutes: firstMins.length > 0 ? firstMins.reduce((a, b) => a + b, 0) / firstMins.length : null,
    avgLastCigMinutes: lastMins.length > 0 ? lastMins.reduce((a, b) => a + b, 0) / lastMins.length : null,
  }
}

// ─── Cancel pending notification ─────────────────────────────────────────────

export const cancelPendingNotification = async (): Promise<void> => {
  const id = await AsyncStorage.getItem(PENDING_NOTIF_KEY)
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id)
    await AsyncStorage.removeItem(PENDING_NOTIF_KEY)
  }
}

// ─── Schedule next notification ───────────────────────────────────────────────

export const scheduleNextNotification = async (
  lastCigTime: number, // timestamp of last logged cigarette
): Promise<void> => {
  // Always cancel any existing pending notification first
  await cancelPendingNotification()

  const pattern = await computePattern()

  // Need at least an avg gap to schedule
  if (!pattern.avgGapMs || !pattern.avgLastCigMinutes) return

  // Next notification time = lastCigTime + avgGap * 1.1
  const nextTime = new Date(lastCigTime + pattern.avgGapMs * 1.1)

  // Stop condition: don't schedule if after avgLastCigTime - 30min
  const cutoffMinutes = pattern.avgLastCigMinutes - 30
  const nextMinutes = toMinutesSinceMidnight(nextTime.getTime())

  if (nextMinutes > cutoffMinutes) return

  // Don't schedule in the past
  if (nextTime.getTime() <= Date.now()) return

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ONEMORE',
      body: randomNudge(),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextTime,
    },
  })

  await AsyncStorage.setItem(PENDING_NOTIF_KEY, id)
}

// ─── Schedule first cig notification for tomorrow ────────────────────────────
// Call this once per day, e.g. when the user logs their last cig
// or on app launch if not yet scheduled

export const scheduleFirstCigNotification = async (): Promise<void> => {
  const pattern = await computePattern()

  // No data yet — wait
  if (pattern.avgFirstCigMinutes === null) return

  // Schedule for tomorrow at avgFirstCigTime
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(Math.floor(pattern.avgFirstCigMinutes / 60), Math.round(pattern.avgFirstCigMinutes % 60), 0, 0)

  // Don't schedule if already past that time today
  if (tomorrow.getTime() <= Date.now()) return

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ONEMORE',
      body: randomNudge(),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow,
    },
  })

  // Store separately so we don't overwrite the intraday pending id
  await AsyncStorage.setItem('first_cig_notif_id', id)
}

// ─── Setup handler (call in _layout.tsx) ─────────────────────────────────────

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
