import { MonthCalendarProps } from '@/types'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Calendar } from 'react-native-calendars'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ringRatio(count: number, avg: number): number {
  if (count === 0 || avg === 0) return 0
  return Math.min(count / avg, 1)
}

function ringStyle(ratio: number) {
  if (ratio === 0) return {}
  return { borderWidth: Math.round(ratio * 4), borderColor: '#000' }
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
}

// ─── Day Component ────────────────────────────────────────────────────────────

function DayComponent({ date, count, avg, isToday }: { date: string; count: number; avg: number; isToday: boolean }) {
  const ring = ringStyle(ringRatio(count, avg))

  return (
    <TouchableOpacity
      onPress={() => count > 0 && router.push({ pathname: '/history', params: { date } })}
      style={styles.dayOuter}
      activeOpacity={count > 0 ? 0.7 : 1}
    >
      <View style={[styles.dayCircle, ring, isToday && styles.dayCircleToday]}>
        <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{new Date(date).getUTCDate()}</Text>
        {count > 0 && <Text style={styles.dayCount}>{count}</Text>}
      </View>
    </TouchableOpacity>
  )
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

export default function MonthCalendar({ monthData, dailyAvg }: MonthCalendarProps) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`

  const goPrev = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goNext = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const isCurrentMonth =
    currentMonth.getFullYear() === new Date().getFullYear() && currentMonth.getMonth() === new Date().getMonth()

  return (
    <View>
      {/* Custom nav header — matches WeekBarChart */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
          <Text style={styles.navArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{formatMonthLabel(currentMonth)}</Text>
        <TouchableOpacity onPress={goNext} style={styles.navBtn} disabled={isCurrentMonth}>
          <Text style={[styles.navArrow, isCurrentMonth && styles.navArrowDisabled]}>→</Text>
        </TouchableOpacity>
      </View>

      <Calendar
        key={monthKey}
        current={monthKey}
        disableAllTouchEventsForDisabledDays
        hideExtraDays
        renderHeader={() => null}
        hideDayNames={false}
        theme={
          {
            calendarBackground: '#F5F0E8',
            textSectionTitleColor: '#000',
            textDayHeaderFontFamily: 'SpaceMono',
            textDayHeaderFontSize: 9,
            'stylesheet.calendar.main': {
              week: {
                marginTop: 0,
                marginBottom: 0,
                flexDirection: 'row',
                justifyContent: 'space-around',
              },
            },
            'stylesheet.calendar.header': {
              arrow: {
                padding: 0,
                width: 0,
                height: 0,
                overflow: 'hidden',
              },
              header: {
                height: 0,
                overflow: 'hidden',
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
    </View>
  )
}

MonthCalendar.displayName = 'MonthCalendar'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navBtn: {
    padding: 4,
  },
  navArrow: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    color: '#000',
  },
  navArrowDisabled: {
    color: '#ccc',
  },
  navTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 3,
    color: '#000',
  },
  dayOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 44,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 10,
    color: '#000',
  },
  dayTextToday: {
    color: '#fff',
  },
  dayCount: {
    fontFamily: 'BebasNeue',
    fontSize: 8,
    color: '#555',
    lineHeight: 9,
  },
})
