import { DAY_PREFIX } from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SmokingPattern = {
  avgGapMs: number | null
  avgFirstCigMinutes: number | null
  avgLastCigMinutes: number | null
  totalGapsCount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toMinutesSinceMidnight = (ts: number): number => {
  const d = new Date(ts)
  return d.getHours() * 60 + d.getMinutes()
}

// ─── Pattern Computation ──────────────────────────────────────────────────────

export const computePattern = async (): Promise<SmokingPattern> => {
  const allKeys = await AsyncStorage.getAllKeys()
  const dayKeys = allKeys.filter((k) => k.startsWith(DAY_PREFIX)).sort()

  if (dayKeys.length === 0) {
    return {
      avgGapMs: null,
      avgFirstCigMinutes: null,
      avgLastCigMinutes: null,
      totalGapsCount: 0,
    }
  }

  // Batch fetch all data instead of sequential calls
  const entries = await AsyncStorage.multiGet(dayKeys)

  const gaps: number[] = []
  const firstMins: number[] = []
  const lastMins: number[] = []

  for (const [, raw] of entries) {
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
