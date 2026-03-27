import { DAY_PREFIX } from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const keyForDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${DAY_PREFIX}${y}-${m}-${d}`
}

const dateRangeKeys = (days: number): string[] => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return keyForDate(date)
  })
}

const fetchDays = async (keys: string[]): Promise<Record<string, number[]>> => {
  if (keys.length === 0) return {}

  const entries = await AsyncStorage.multiGet(keys)
  const result: Record<string, number[]> = {}

  for (const [key, data] of entries) {
    const dateStr = key.replace(DAY_PREFIX, '')
    result[dateStr] = data ? JSON.parse(data) : []
  }

  return result
}

// ─── Write ────────────────────────────────────────────────────────────────────

export const logCigarette = async (): Promise<number[]> => {
  const key = keyForDate(new Date())
  const existing = await AsyncStorage.getItem(key)
  const times: number[] = existing ? JSON.parse(existing) : []
  times.push(Date.now())
  await AsyncStorage.setItem(key, JSON.stringify(times))
  return times
}

export const deleteLog = async (date: Date, timestamp: number): Promise<number[]> => {
  const key = keyForDate(date)
  const existing = await AsyncStorage.getItem(key)
  const times: number[] = existing ? JSON.parse(existing) : []
  const updated = times.filter((t) => t !== timestamp)
  await AsyncStorage.setItem(key, JSON.stringify(updated))
  return updated
}

export const editLog = async (date: Date, oldTimestamp: number, newTimestamp: number): Promise<number[]> => {
  const key = keyForDate(date)
  const existing = await AsyncStorage.getItem(key)
  const times: number[] = existing ? JSON.parse(existing) : []
  const updated = times.map((t) => (t === oldTimestamp ? newTimestamp : t)).sort((a, b) => a - b) // keep sorted after edit
  await AsyncStorage.setItem(key, JSON.stringify(updated))
  return updated
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getDay = async (date: Date): Promise<number[]> => {
  const key = keyForDate(date)
  const data = await AsyncStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export const getWeek = async (dateKeys: string[]): Promise<Record<string, number[]>> => {
  const storageKeys = dateKeys.map((k) => `${DAY_PREFIX}${k}`)
  return fetchDays(storageKeys)
}

export const getLast7Days = async (): Promise<Record<string, number[]>> => {
  return fetchDays(dateRangeKeys(7))
}

export const getLastMonth = async (): Promise<Record<string, number[]>> => {
  return fetchDays(dateRangeKeys(30))
}

export const getAllDays = async (): Promise<Record<string, number[]>> => {
  const allKeys = await AsyncStorage.getAllKeys()
  const dayKeys = allKeys
    .filter((k) => k.startsWith(DAY_PREFIX))
    .sort()
    .reverse()
  return fetchDays(dayKeys)
}
