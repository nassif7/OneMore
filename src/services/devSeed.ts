import { generateEntryId, serializeEntries } from '@/helpers'
import { TagId, TLogEntry } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getDay, keyForDate } from './storage'

// ─── Dev Demo Data Seeder ─────────────────────────────────────────────────────
// Temporary tool for generating screenshot-ready dummy data. Only ever writes
// to days that are currently empty — never touches a day with real logs — and
// records exactly which day keys it created so they can be cleanly removed
// later without affecting any real data.

const DEMO_SEEDED_DAYS_KEY = 'demo_seeded_days'

const WEIGHTED_TAGS: TagId[] = [
  'COFFEE',
  'COFFEE',
  'STRESSED',
  'STRESSED',
  'AFTER_MEAL',
  'AFTER_MEAL',
  'SOCIAL',
  'WORK_BREAK',
  'BORED',
  'DRINKING',
  'RELAXING',
  'LATE_NIGHT',
]

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

const randomTag = (): TagId | undefined => {
  if (Math.random() > 0.55) return undefined
  return WEIGHTED_TAGS[randomInt(0, WEIGHTED_TAGS.length - 1)]
}

// Average real-world gap between cigarettes, plus variance — used to space
// entries out sequentially instead of scattering independent random
// timestamps (which clumps unrealistically in short windows).
const AVG_GAP_MINUTES = 90
const GAP_VARIANCE_MINUTES = 60
const MIN_GAP_MINUTES = 20
const MAX_ENTRIES_PER_DAY = 20

const generateDayEntries = (date: Date, now: Date): TLogEntry[] => {
  const isToday = date.toDateString() === now.toDateString()

  const dayStart = new Date(date)
  dayStart.setHours(7, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 0, 0)

  // Never generate a timestamp later than "now" — matters only for today,
  // since every other day in the seeded range is already fully in the past.
  const rangeStart = dayStart.getTime()
  const rangeEnd = isToday ? Math.min(dayEnd.getTime(), now.getTime()) : dayEnd.getTime()
  if (rangeEnd <= rangeStart) return []

  const entries: TLogEntry[] = []
  let ts = rangeStart + randomInt(0, 60) * 60000

  while (ts <= rangeEnd && entries.length < MAX_ENTRIES_PER_DAY) {
    entries.push({ id: generateEntryId(), ts, tag: randomTag() })
    const gapMinutes = Math.max(MIN_GAP_MINUTES, AVG_GAP_MINUTES + randomInt(-GAP_VARIANCE_MINUTES, GAP_VARIANCE_MINUTES))
    ts += gapMinutes * 60000
  }

  return entries
}

export const seedDemoData = async (days: number = 30): Promise<number> => {
  const now = new Date()
  const seededKeys: string[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const existing = await getDay(date)
    if (existing.length > 0) continue

    const entries = generateDayEntries(date, now)
    if (entries.length === 0) continue

    const key = keyForDate(date)
    await AsyncStorage.setItem(key, serializeEntries(entries))
    seededKeys.push(key)
  }

  const stored = await AsyncStorage.getItem(DEMO_SEEDED_DAYS_KEY)
  const allSeeded = [...(stored ? (JSON.parse(stored) as string[]) : []), ...seededKeys]
  await AsyncStorage.setItem(DEMO_SEEDED_DAYS_KEY, JSON.stringify(allSeeded))

  return seededKeys.length
}

export const clearDemoData = async (): Promise<void> => {
  const stored = await AsyncStorage.getItem(DEMO_SEEDED_DAYS_KEY)
  if (!stored) return

  const keys = JSON.parse(stored) as string[]
  if (keys.length > 0) await AsyncStorage.multiRemove(keys)
  await AsyncStorage.removeItem(DEMO_SEEDED_DAYS_KEY)
}
