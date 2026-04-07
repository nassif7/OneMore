import { getDay } from '@/services/storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { AppState } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TDayEntry = {
  date: Date
  label: string
  fullDate: string
  times: number[]
}

interface UseHistoryDataState {
  entry: TDayEntry | null
  isLoading: boolean
  error: Error | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a new Date with time components set to 00:00:00.000.
 * Useful for date comparisons without time component.
 *
 * @param date - Source date
 * @returns New Date at start of day in local timezone
 *
 * @example
 * const date = new Date('2024-01-15T14:30:00')
 * startOfDay(date) // 2024-01-15T00:00:00
 */
const startOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Converts a calendar date (from react-native-calendars) to local date,
 * correcting for timezone offset issues.
 *
 * When react-native-calendars converts "YYYY-MM-DD" via new Date(),
 * it parses as UTC midnight, which shifts the date in non-UTC timezones.
 * This function adds the timezone offset back to align with user's local date.
 *
 * @param date - Date from calendar picker (UTC-shifted)
 * @returns Date corrected to user's local timezone
 *
 * @example
 * // In UTC-5 timezone:
 * // Calendar passes: 2024-01-15 → parsed as 2024-01-15T00:00:00Z (UTC)
 * // Becomes: 2024-01-14T19:00:00 (EST, shifted back 5 hours)
 * fromCalendarString(calendaDate) // Corrects back to 2024-01-15T00:00:00 EST
 */
const fromCalendarString = (date: Date): Date => {
  const local = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  return startOfDay(local)
}

/**
 * Creates a TDayEntry from a date and list of log times.
 * Generates localized labels for display in UI.
 *
 * @param date - Date to create entry for
 * @param times - Unix timestamps (milliseconds) of cigarettes logged
 * @returns Formatted day entry with labels and times
 *
 * @example
 * const times = [1705326600000, 1705330200000]
 * toEntry(new Date('2024-01-15'), times)
 * // → { date, label: "MONDAY", fullDate: "Jan 15, 2024", times: [...] }
 */
const toEntry = (date: Date, times: number[]): TDayEntry => ({
  date,
  label: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
  fullDate: date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase(),
  times,
})

/**
 * Checks if a given date is today (by date comparison, ignoring time).
 *
 * @param date - Date to compare
 * @returns true if date is today, false otherwise
 *
 * @example
 * isToday(new Date()) // true
 * isToday(new Date(Date.now() - 86400000)) // false (yesterday)
 */
const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

// ─── useHistoryData ───────────────────────────────────────────────────────────

/**
 * Hook to manage a history view for a selected date.
 * Loads cigarette logs for the selected date and provides navigation methods.
 *
 * Handles timezone corrections for calendar date selection and auto-reloads
 * when app comes to foreground. Gracefully handles errors without throwing.
 *
 * @param initialDate - Optional starting date (defaults to today)
 * @returns Object with entry data, navigation, and reload function
 *
 * @example
 * const { entry, selectedDate, isToday, goToPrevDay, goToNextDay, goToDate } = useHistoryData()
 * if (entry) console.log(`${entry.label}: ${entry.times.length} cigarettes`)
 */
export default function useHistoryData(initialDate?: Date) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate ? startOfDay(initialDate) : startOfDay(new Date()))

  const [state, setState] = useState<UseHistoryDataState>({
    entry: null,
    isLoading: true,
    error: null,
  })

  const loadData = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const times = await getDay(selectedDate)
      setState((s) => ({
        ...s,
        entry: toEntry(selectedDate, times),
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      console.error('[useHistoryData] Error loading day:', error)
      setState((s) => ({
        ...s,
        entry: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }))
    }
  }, [selectedDate])

  useFocusEffect(
    useCallback(() => {
      loadData()
      const sub = AppState.addEventListener('change', (appState) => {
        if (appState === 'active') loadData()
      })
      return () => sub.remove()
    }, [loadData]),
  )

  const goToPrevDay = () => {
    setSelectedDate((d) => {
      const prev = new Date(d)
      prev.setDate(prev.getDate() - 1)
      return prev
    })
  }

  const goToNextDay = () => {
    setSelectedDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      return next
    })
  }

  const goToDate = (date: Date) => {
    setSelectedDate(fromCalendarString(date))
  }

  return {
    entry: state.entry,
    selectedDate,
    isToday: isToday(selectedDate),
    goToPrevDay,
    goToNextDay,
    goToDate,
    reload: loadData,
    isLoading: state.isLoading,
    error: state.error,
  }
}
