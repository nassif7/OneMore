import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Calendar } from 'react-native-calendars'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IMonthCalendarProps {
  monthData: Record<string, number> // "YYYY-MM-DD" → count
  dailyAvg: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Returns border fill ratio 0–1 based on count vs avg
// 0 cigs = no ring. At avg = full ring. Capped at 1.
function ringRatio(count: number, avg: number): number {
  if (count === 0 || avg === 0) return 0
  return Math.min(count / avg, 1)
}

// Border trick: we fake a partial ring using 4 borders and rotation.
// ratio 0–1 maps to which borders are visible.
// We use a simpler approach: opacity + border width scale.
// Full ring = borderWidth 4, no ring = borderWidth 0.
function ringStyle(ratio: number) {
  if (ratio === 0) return {}
  const borderWidth = Math.round(ratio * 4)
  return {
    borderWidth,
    borderColor: '#000',
  }
}

// ─── Day Component ────────────────────────────────────────────────────────────

function DayComponent({ date, count, avg, isToday }: { date: string; count: number; avg: number; isToday: boolean }) {
  const ratio = ringRatio(count, avg)
  const ring = ringStyle(ratio)

  const handlePress = () => {
    if (count > 0) {
      router.push({ pathname: '/history', params: { date } })
    }
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.dayOuter} activeOpacity={count > 0 ? 0.7 : 1}>
      <View style={[styles.dayCircle, ring, isToday && styles.dayCircleToday]}>
        <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{new Date(date).getUTCDate()}</Text>
        {count > 0 && <Text style={styles.dayCount}>{count}</Text>}
      </View>
    </TouchableOpacity>
  )
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

export default function MonthCalendar({ monthData, dailyAvg }: IMonthCalendarProps) {
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <Calendar
      disableAllTouchEventsForDisabledDays
      style={styles.calendar}
      hideExtraDays={true}
      theme={
        {
          calendarBackground: '#F5F0E8',
          textSectionTitleColor: '#000',
          monthTextColor: '#000',
          arrowColor: '#000',
          textDayFontFamily: 'SpaceMono',
          textMonthFontFamily: 'BebasNeue',
          textDayHeaderFontFamily: 'SpaceMono',
          textMonthFontSize: 20,
          textDayHeaderFontSize: 9,
          'stylesheet.calendar.main': {
            week: {
              marginTop: 0,
              marginBottom: 0,
              flexDirection: 'row',
              justifyContent: 'space-around',
            },
          },
        } as any
      }
      dayComponent={({ date }: any) => {
        const dateStr = date.dateString as string
        const count = monthData[dateStr] ?? 0
        const isToday = dateStr === todayStr
        return <DayComponent date={dateStr} count={count} avg={dailyAvg} isToday={isToday} />
      }}
    />
  )
}

MonthCalendar.displayName = 'MonthCalendar'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  calendar: {
    borderTopWidth: 3,
    borderColor: '#000',
  },
  dayOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40, // was 40
    height: 44, // was 48
  },
  dayCircle: {
    width: 32, // was 32
    height: 32, // was 32
    borderRadius: 16, // was 16
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: '#000',
  },
  dayCircleToday: {
    backgroundColor: '#FF4500',
  },
  dayText: {
    fontFamily: 'SpaceMono',
    fontSize: 10, // was 10
    color: '#000',
  },
  dayTextToday: {
    color: '#fff',
  },
  dayCount: {
    fontFamily: 'BebasNeue',
    fontSize: 8, // was 8
    color: '#555',
    lineHeight: 9,
  },
})
