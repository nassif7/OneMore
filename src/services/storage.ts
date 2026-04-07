import { DAY_PREFIX } from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Types ────────────────────────────────────────────────────────────────────

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

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

const safeJsonParse = (json: string | null): number[] => {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) && parsed.every((x) => typeof x === 'number') ? parsed : []
  } catch {
    console.warn('[Storage] Failed to parse JSON, returning empty array')
    return []
  }
}

const fetchDays = async (keys: string[]): Promise<Record<string, number[]>> => {
  if (keys.length === 0) return {}

  try {
    const entries = await AsyncStorage.multiGet(keys)
    const result: Record<string, number[]> = {}

    for (const [key, data] of entries) {
      const dateStr = key.replace(DAY_PREFIX, '')
      result[dateStr] = safeJsonParse(data)
    }

    return result
  } catch (error) {
    console.error('[Storage] Error fetching days:', error)
    throw new StorageError('Failed to fetch days from storage', error)
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export const logCigarette = async (): Promise<number[]> => {
  const key = keyForDate(new Date())
  try {
    const existing = await AsyncStorage.getItem(key)
    const times = safeJsonParse(existing)
    times.push(Date.now())
    await AsyncStorage.setItem(key, JSON.stringify(times))
    return times
  } catch (error) {
    console.error('[Storage] Error logging cigarette:', error)
    throw new StorageError('Failed to log cigarette', error)
  }
}

export const deleteLog = async (date: Date, timestamp: number): Promise<number[]> => {
  const key = keyForDate(date)
  try {
    const existing = await AsyncStorage.getItem(key)
    const times = safeJsonParse(existing)
    const updated = times.filter((t) => t !== timestamp)
    await AsyncStorage.setItem(key, JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('[Storage] Error deleting log:', error)
    throw new StorageError('Failed to delete log', error)
  }
}

export const editLog = async (date: Date, oldTimestamp: number, newTimestamp: number): Promise<number[]> => {
  const key = keyForDate(date)
  try {
    const existing = await AsyncStorage.getItem(key)
    const times = safeJsonParse(existing)
    const updated = times.map((t) => (t === oldTimestamp ? newTimestamp : t)).sort((a, b) => a - b)
    await AsyncStorage.setItem(key, JSON.stringify(updated))
    return updated
  } catch (error) {
    console.error('[Storage] Error editing log:', error)
    throw new StorageError('Failed to edit log', error)
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getDay = async (date: Date): Promise<number[]> => {
  const key = keyForDate(date)
  try {
    const data = await AsyncStorage.getItem(key)
    return safeJsonParse(data)
  } catch (error) {
    console.error('[Storage] Error getting day:', error)
    throw new StorageError('Failed to get day data', error)
  }
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
  try {
    const allKeys = await AsyncStorage.getAllKeys()
    const dayKeys = allKeys
      .filter((k) => k.startsWith(DAY_PREFIX))
      .sort()
      .reverse()
    return fetchDays(dayKeys)
  } catch (error) {
    console.error('[Storage] Error getting all days:', error)
    throw new StorageError('Failed to get all days', error)
  }
}
