import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_PREFIX = 'day:'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const keyForDate = (date: Date): string => `${DAY_PREFIX}${date.toISOString().split('T')[0]}` // "day:2026-03-08"

// ─── Write ────────────────────────────────────────────────────────────────────

export const logCigarette = async (): Promise<number[]> => {
  const key = keyForDate(new Date())
  const existing = await AsyncStorage.getItem(key)
  const times: number[] = existing ? JSON.parse(existing) : []
  times.push(Date.now())
  await AsyncStorage.setItem(key, JSON.stringify(times))
  return times
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getDay = async (date: Date): Promise<number[]> => {
  const key = keyForDate(date)
  const data = await AsyncStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export const getLast7Days = async (): Promise<Record<string, number[]>> => {
  const result: Record<string, number[]> = {}
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = keyForDate(date)
    const data = await AsyncStorage.getItem(key)
    // Strip prefix for the result key so consumers get clean date strings
    const dateStr = key.replace(DAY_PREFIX, '')
    result[dateStr] = data ? JSON.parse(data) : []
  }
  return result
}
