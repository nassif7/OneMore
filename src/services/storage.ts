import { DAY_PREFIX, FIRST_CIG_NOTIF_KEY, NEXT_NOTIF_BODY_KEY, NEXT_NOTIF_TIME_KEY, PENDING_NOTIF_KEY } from '@/constants'
import { generateEntryId, parseEntries, serializeEntries } from '@/helpers'
import { TagId, TLogEntry } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'

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

const fetchDays = async (keys: string[]): Promise<Record<string, TLogEntry[]>> => {
  if (keys.length === 0) return {}

  try {
    const entries = await AsyncStorage.multiGet(keys)
    const result: Record<string, TLogEntry[]> = {}

    for (const [key, data] of entries) {
      const dateStr = key.replace(DAY_PREFIX, '')
      result[dateStr] = parseEntries(data)
    }

    return result
  } catch (error) {
    console.error('[Storage] Error fetching days:', error)
    throw new StorageError('Failed to fetch days from storage', error)
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export const logCigarette = async (): Promise<TLogEntry[]> => {
  const key = keyForDate(new Date())
  try {
    const existing = await AsyncStorage.getItem(key)
    const entries = parseEntries(existing)
    entries.push({ id: generateEntryId(), ts: Date.now() })
    await AsyncStorage.setItem(key, serializeEntries(entries))
    return entries
  } catch (error) {
    console.error('[Storage] Error logging cigarette:', error)
    throw new StorageError('Failed to log cigarette', error)
  }
}

export const deleteLog = async (date: Date, id: string): Promise<TLogEntry[]> => {
  const key = keyForDate(date)
  try {
    const existing = await AsyncStorage.getItem(key)
    const entries = parseEntries(existing)
    const updated = entries.filter((e) => e.id !== id)
    await AsyncStorage.setItem(key, serializeEntries(updated))
    return updated
  } catch (error) {
    console.error('[Storage] Error deleting log:', error)
    throw new StorageError('Failed to delete log', error)
  }
}

export const addLog = async (date: Date, timestamp: number, tag?: TagId): Promise<TLogEntry[]> => {
  const key = keyForDate(date)
  try {
    const existing = await AsyncStorage.getItem(key)
    const entries = parseEntries(existing)
    const entry: TLogEntry = tag ? { id: generateEntryId(), ts: timestamp, tag } : { id: generateEntryId(), ts: timestamp }
    const updated = [...entries, entry].sort((a, b) => a.ts - b.ts)
    await AsyncStorage.setItem(key, serializeEntries(updated))
    return updated
  } catch (error) {
    console.error('[Storage] Error adding log:', error)
    throw new StorageError('Failed to add log', error)
  }
}

export const editLog = async (date: Date, id: string, newTimestamp: number): Promise<TLogEntry[]> => {
  const key = keyForDate(date)
  try {
    const existing = await AsyncStorage.getItem(key)
    const entries = parseEntries(existing)
    const updated = entries.map((e) => (e.id === id ? { ...e, ts: newTimestamp } : e)).sort((a, b) => a.ts - b.ts)
    await AsyncStorage.setItem(key, serializeEntries(updated))
    return updated
  } catch (error) {
    console.error('[Storage] Error editing log:', error)
    throw new StorageError('Failed to edit log', error)
  }
}

export const setTag = async (date: Date, id: string, tag: TagId | undefined): Promise<TLogEntry[]> => {
  const key = keyForDate(date)
  try {
    const existing = await AsyncStorage.getItem(key)
    const entries = parseEntries(existing)
    const updated = entries.map((e) => {
      if (e.id !== id) return e
      if (tag === undefined) {
        const { tag: _drop, ...rest } = e
        return rest
      }
      return { ...e, tag }
    })
    await AsyncStorage.setItem(key, serializeEntries(updated))
    return updated
  } catch (error) {
    console.error('[Storage] Error setting tag:', error)
    throw new StorageError('Failed to set tag', error)
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getDay = async (date: Date): Promise<TLogEntry[]> => {
  const key = keyForDate(date)
  try {
    const data = await AsyncStorage.getItem(key)
    return parseEntries(data)
  } catch (error) {
    console.error('[Storage] Error getting day:', error)
    throw new StorageError('Failed to get day data', error)
  }
}

export const getWeek = async (dateKeys: string[]): Promise<Record<string, TLogEntry[]>> => {
  const storageKeys = dateKeys.map((k) => `${DAY_PREFIX}${k}`)
  return fetchDays(storageKeys)
}

export const getLast7Days = async (): Promise<Record<string, TLogEntry[]>> => {
  return fetchDays(dateRangeKeys(7))
}

export const getLastMonth = async (): Promise<Record<string, TLogEntry[]>> => {
  return fetchDays(dateRangeKeys(30))
}

export const getAllDays = async (): Promise<Record<string, TLogEntry[]>> => {
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

export const clearAllData = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    const allKeys = await AsyncStorage.getAllKeys()
    const keysToRemove = allKeys.filter(
      (k) =>
        k.startsWith(DAY_PREFIX) ||
        k === PENDING_NOTIF_KEY ||
        k === NEXT_NOTIF_TIME_KEY ||
        k === NEXT_NOTIF_BODY_KEY ||
        k === FIRST_CIG_NOTIF_KEY,
    )
    if (keysToRemove.length > 0) await AsyncStorage.multiRemove(keysToRemove)
  } catch (error) {
    console.error('[Storage] Error clearing all data:', error)
    throw new StorageError('Failed to clear all data', error)
  }
}
